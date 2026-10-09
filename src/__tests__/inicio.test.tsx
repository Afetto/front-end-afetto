import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaInicio from "@/app/(tabs)/index";

// Mocka o boundary HTTP: usePets -> petService.listar e usePerfilCompleto ->
// perfilCompletoService.buscar continuam rodando de verdade.
jest.mock("@/api/api", () => ({
  api: { get: jest.fn() },
}));

// Sessão fixa: só os dados do usuário (o progresso vem da API)
jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({
    sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" },
  }),
}));

const mockGet = api.get as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const PETS_DA_API = {
  content: [
    { id: "pet-1", nome: "Jordan", especie: "CACHORRO", raca: "Shih-tzu" },
    { id: "pet-2", nome: "Mia", especie: "GATO", raca: "" },
  ],
};

// GET /usuario/me/perfil antes e depois do "Finalize seu cadastro"
const PERFIL_INCOMPLETO = {
  perfilCompleto: false,
  tipoMoradia: null,
  telaProtecao: null,
  quantidadePets: 0,
  endereco: null,
};

const PERFIL_COMPLETO = {
  perfilCompleto: true,
  tipoMoradia: "APARTAMENTO",
  telaProtecao: true,
  quantidadePets: 2,
  endereco: {
    cep: "05422-001", logradouro: "Rua dos Pinheiros", numero: "500", complemento: null,
    bairro: "Pinheiros", cidade: "São Paulo", estado: "SP",
  },
};

// Cada rota responde o seu dado; `pets` pode ser uma função para simular falha
function responderApi({
  pets = () => Promise.resolve({ data: PETS_DA_API }),
  perfil = PERFIL_INCOMPLETO,
}: { pets?: () => Promise<unknown>; perfil?: unknown } = {}) {
  mockGet.mockImplementation((url: string) => {
    if (url === "/pet") return pets();
    if (url === "/usuario/me/perfil") return Promise.resolve({ data: perfil });
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
}

describe("TelaInicio — progresso vindo da API", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("mostra a quantidade de pets da API e conclui a etapa do pet sozinha", async () => {
    responderApi();

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("2 pets")).toBeTruthy();
    expect(await screen.findByText("Etapa 2 de 2 — Finalize seu cadastro!")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/pet", expect.anything());
    expect(mockGet).toHaveBeenCalledWith("/usuario/me/perfil");
  });

  it("mantém a etapa do pet pendente quando a API não devolve nenhum pet", async () => {
    responderApi({ pets: () => Promise.resolve({ data: { content: [] } }) });

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("Nenhum pet")).toBeTruthy();
    expect(await screen.findByText("Etapa 1 de 2 — Finalize seu cadastro!")).toBeTruthy();
    expect(screen.getByText("Cadastrar seu Pet")).toBeTruthy();
  });

  it("marca \"Finalize seu cadastro\" como concluído quando a API diz que o perfil está completo", async () => {
    responderApi({ pets: () => Promise.resolve({ data: { content: [] } }), perfil: PERFIL_COMPLETO });

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("Etapa 2 de 2 — Cadastrar seu Pet")).toBeTruthy();
  });

  it("com perfil completo e pet cadastrado, some o checklist", async () => {
    responderApi({ perfil: PERFIL_COMPLETO });

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("Tudo certo! Seu pet está protegido.")).toBeTruthy();
    expect(screen.queryByText("Sua configuração")).toBeNull();
  });

  it("não mostra checklist nem progresso antes de a API responder", () => {
    mockGet.mockReturnValue(new Promise(() => {}));

    render(<TelaInicio />, { wrapper });

    expect(screen.queryByText("Sua configuração")).toBeNull();
    expect(screen.queryByText(/Etapa \d de \d/)).toBeNull();
    expect(screen.queryByText("Nenhum pet")).toBeNull();
  });

  it("mostra erro com 'Tentar novamente' quando a busca falha, e recupera ao tentar de novo", async () => {
    let falhar = true;
    responderApi({
      pets: () => (falhar ? Promise.reject(new Error("falha de rede")) : Promise.resolve({ data: PETS_DA_API })),
    });

    render(<TelaInicio />, { wrapper });

    expect(
      await screen.findByText("Não foi possível carregar seus pets.")
    ).toBeTruthy();
    expect(screen.queryByText("Sua configuração")).toBeNull();

    falhar = false;
    fireEvent.press(screen.getByText("Tentar novamente"));

    await waitFor(() => expect(screen.getByText("2 pets")).toBeTruthy());
    expect(screen.queryByText("Não foi possível carregar seus pets.")).toBeNull();
  });
});
