import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaClinicaDetalhe from "@/app/(app)/clinica/[id]";
import TelaClinica from "@/app/(tabs)/clinica";
import { enderecoCompleto, formatarDistancia, formatarNota } from "@/utils/clinica";
import { router } from "expo-router";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: "cli-1" }),
}));

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" } }),
}));

const mockGet = api.get as jest.Mock;
const mockPut = api.put as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const CLINICA = {
  id: "cli-1",
  nome: "Clínica Veterinária Bigode e Rabo",
  imagemUrl: null,
  endereco: {
    logradouro: "Rua dos Pinheiros", numero: "100", complemento: null, bairro: "Pinheiros",
    cidade: "São Paulo", uf: "SP", cep: "05422-000", latitude: -23.56, longitude: -46.68,
  },
  distanciaKm: 0.85,
  perto: true,
  favorita: false,
  notaMedia: 4.5,
  totalAvaliacoes: 2,
};

const DETALHE = {
  ...CLINICA,
  descricao: "Atendimento de cães e gatos.",
  telefone: "(11) 0000-0001",
  email: "contato@bigodeerabo.example",
  site: "https://www.bigodeerabo.example",
  veterinarios: [{ nome: "Dra. Ana Lima", especialidade: "Clínica geral", turno: "MANHA" }],
  expediente: [{ diaSemana: "segunda-feira", abertura: "08:00", fechamento: "18:00" }],
};

const AVALIACOES = {
  content: [
    { id: "av-1", nota: 5, comentario: "Equipe atenciosa", autor: "Bruno S.", data: "2026-10-01T10:00:00", minha: false },
  ],
};

function responderApi(perfil: object = { perfilCompleto: true, endereco: { cep: "05422-001" } }) {
  mockGet.mockImplementation((url: string) => {
    if (url === "/clinica") return Promise.resolve({ data: { content: [CLINICA] } });
    if (url === "/clinica/cli-1") return Promise.resolve({ data: DETALHE });
    if (url === "/clinica/cli-1/avaliacao") return Promise.resolve({ data: AVALIACOES });
    if (url === "/usuario/me/perfil") {
      return Promise.resolve({ data: { tipoMoradia: null, telaProtecao: null, quantidadePets: 0, ...perfil } });
    }
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockReset();
  mockPut.mockReset();
  mockPut.mockResolvedValue({ data: {} });
});

describe("formatação", () => {
  it("distância, nota e endereço", () => {
    expect(formatarDistancia(0.85)).toBe("850 m");
    expect(formatarDistancia(3.24)).toBe("3,2 km");
    expect(formatarNota(4.5)).toBe("4,5");
    expect(enderecoCompleto({ logradouro: "Rua A", numero: "10", bairro: "Centro", cidade: "São Paulo", uf: "SP" })).toBe(
      "Rua A, 10 — Centro, São Paulo/SP"
    );
  });
});

describe("TelaClinica — lista (HTTP mockado)", () => {
  it("mostra a clínica com nota, distância e 'perto de você'; o coração favorita", async () => {
    responderApi();
    render(<TelaClinica />, { wrapper });

    expect(await screen.findByText("Clínica Veterinária Bigode e Rabo")).toBeTruthy();
    expect(screen.getByText("PERTO DE VOCÊ")).toBeTruthy();
    expect(screen.getByText("· 850 m")).toBeTruthy();
    expect(screen.getByText("4,5 (2)")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Favoritar"));
    await waitFor(() => expect(mockPut).toHaveBeenCalledWith("/clinica/cli-1/favorito"));

    fireEvent.press(screen.getByText("Clínica Veterinária Bigode e Rabo"));
    expect(router.push).toHaveBeenCalledWith("/clinica/cli-1");
  });

  it("busca pelo nome depois que o tutor para de digitar, e filtra favoritas", async () => {
    responderApi();
    render(<TelaClinica />, { wrapper });
    await screen.findByText("Clínica Veterinária Bigode e Rabo");

    fireEvent.changeText(screen.getByPlaceholderText("Buscar clínica pelo nome"), "  bigode ");
    // A busca espera 400 ms sem digitação; o act cobre a atualização que o timer dispara
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 450));
    });
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith("/clinica", { params: { page: 0, size: 50, nome: "bigode" } })
    );

    fireEvent.press(screen.getByText("Favoritas"));
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith("/clinica", { params: { page: 0, size: 50, nome: "bigode", favoritas: true } })
    );
  });

  it("sem endereço salvo, sugere completar o cadastro para ver as clínicas perto", async () => {
    responderApi({ perfilCompleto: false, endereco: null });
    render(<TelaClinica />, { wrapper });

    expect(await screen.findByText(/Salve seu endereço/)).toBeTruthy();
  });
});

describe("TelaClinicaDetalhe (HTTP mockado)", () => {
  it("mostra contato, horário, equipe e avaliações dos outros tutores", async () => {
    responderApi();
    render(<TelaClinicaDetalhe />, { wrapper });

    expect(await screen.findByText("Atendimento de cães e gatos.")).toBeTruthy();
    expect(screen.getByText("(11) 0000-0001")).toBeTruthy();
    expect(screen.getByText("Segunda-feira")).toBeTruthy();
    expect(screen.getByText("08:00 – 18:00")).toBeTruthy();
    expect(screen.getByText("Clínica geral · Manhã")).toBeTruthy();
    expect(await screen.findByText("Equipe atenciosa")).toBeTruthy();
    expect(screen.getByText("01/10/2026 às 10:00")).toBeTruthy();
    expect(screen.getByText("Comentários (1)")).toBeTruthy();

    fireEvent.press(screen.getByText("Agendar consulta"));
    expect(router.push).toHaveBeenCalledWith("/agendamento/cli-1");
  });

  it("avalia com estrelas e comentário (PUT), e exige a nota", async () => {
    responderApi();
    render(<TelaClinicaDetalhe />, { wrapper });
    await screen.findByText("Avalie esta clínica");

    fireEvent.press(screen.getByText("Enviar avaliação"));
    expect(await screen.findByText("Escolha de 1 a 5 estrelas")).toBeTruthy();
    expect(mockPut).not.toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText("4 estrelas"));
    fireEvent.changeText(screen.getByPlaceholderText("Conte como foi o atendimento (opcional)"), "Ótimo atendimento");
    fireEvent.press(screen.getByText("Enviar avaliação"));

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/clinica/cli-1/avaliacao", { nota: 4, comentario: "Ótimo atendimento" })
    );
  });

  it("depois de avaliar, o comentário do tutor aparece na caixa, com 'Você', nome, data e hora", async () => {
    let avaliou = false;
    responderApi();
    const respostaPadrao = mockGet.getMockImplementation()!;
    mockGet.mockImplementation((url: string, config?: unknown) => {
      if (url === "/clinica/cli-1/avaliacao" && avaliou) {
        return Promise.resolve({
          data: {
            content: [
              { id: "av-2", nota: 4, comentario: "Ótimo atendimento", autor: "Ana L.", data: "2026-10-09T21:10:00", minha: true },
              ...AVALIACOES.content,
            ],
          },
        });
      }
      return respostaPadrao(url, config);
    });
    mockPut.mockImplementation(() => {
      avaliou = true;
      return Promise.resolve({ data: {} });
    });

    render(<TelaClinicaDetalhe />, { wrapper });
    await screen.findByText("Avalie esta clínica");

    fireEvent.press(screen.getByLabelText("4 estrelas"));
    fireEvent.changeText(screen.getByPlaceholderText("Conte como foi o atendimento (opcional)"), "Ótimo atendimento");
    fireEvent.press(screen.getByText("Enviar avaliação"));

    expect(await screen.findByText("Avaliação salva! Ela já aparece nos comentários abaixo.")).toBeTruthy();
    expect(await screen.findByText("VOCÊ")).toBeTruthy();
    expect(screen.getByText("Ana L.")).toBeTruthy();
    expect(screen.getByText("09/10/2026 às 21:10")).toBeTruthy();
    expect(screen.getByText("Comentários (2)")).toBeTruthy();
    expect(screen.getByText("Sua avaliação")).toBeTruthy();
  });
});
