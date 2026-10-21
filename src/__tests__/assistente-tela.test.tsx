import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaAssistente from "@/app/(tabs)/assistente";
import { formatarDataISO } from "@/utils/calendario";
import { converterDataParaBR } from "@/utils/data";

// Mocka só o boundary HTTP: hooks, services e as respostas rodam de verdade
jest.mock("@/api/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" } }),
}));

const mockGet = api.get as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const daqui = (dias: number) => formatarDataISO(new Date(Date.now() + dias * 86_400_000));

const PETS = [
  { id: "pet-1", nome: "Thor", especie: "CACHORRO", raca: "" },
  { id: "pet-2", nome: "Mia", especie: "GATO", raca: "" },
];

// Vacinas, remédios e consultas por pet (como a API devolve)
const CUIDADOS: Record<string, { vacinas: unknown[]; remedios: unknown[]; consultas: unknown[] }> = {
  "pet-1": {
    vacinas: [{ nomeVacina: "V10", dataAplicacao: daqui(-300), proximaDose: daqui(10), linkVacina: { href: "/vacina/vac-1" } }],
    remedios: [{ id: "rem-1", idPet: "pet-1", nomeRemedio: "Amoxicilina", dosagem: "1 comprimido", dataInicio: daqui(-2), dataFim: daqui(5) }],
    consultas: [],
  },
  "pet-2": { vacinas: [], remedios: [], consultas: [] },
};

function responderApi({ pets = PETS, falharVacinas = false }: { pets?: unknown[]; falharVacinas?: boolean } = {}) {
  mockGet.mockImplementation((url: string, config?: { params?: { idPet?: string } }) => {
    if (url === "/pet") return Promise.resolve({ data: { content: pets } });
    const doPet = CUIDADOS[config?.params?.idPet ?? ""];
    if (url === "/vacina") {
      return falharVacinas ? Promise.reject(new Error("falha de rede")) : Promise.resolve({ data: { content: doPet.vacinas } });
    }
    if (url === "/remedio") return Promise.resolve({ data: { content: doPet.remedios } });
    if (url === "/consulta") return Promise.resolve({ data: { content: doPet.consultas } });
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
}

beforeEach(() => {
  mockGet.mockReset();
  (router.push as jest.Mock).mockClear();
});

describe("TelaAssistente — perguntas respondidas com os dados reais do pet", () => {
  it("responde a próxima vacina do pet e o botão abre o histórico dele", async () => {
    responderApi();
    render(<TelaAssistente />, { wrapper });

    expect(screen.getByText("Respostas com os dados do seu pet")).toBeTruthy();
    fireEvent.press(await screen.findByText("Próxima vacina"));

    // A pergunta inteira entra na conversa
    expect(screen.getByText("Quando é a próxima vacina?")).toBeTruthy();
    expect(
      await screen.findByText(`A próxima vacina de Thor é V10 (próxima dose), em ${converterDataParaBR(daqui(10))}.`)
    ).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/vacina", { params: expect.objectContaining({ idPet: "pet-1" }) });

    fireEvent.press(screen.getByText("Ver vacinas no histórico"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/pet/[id]/historico", params: { id: "pet-1" } });
  });

  it("com mais de um pet, trocar o pet troca os dados da resposta", async () => {
    responderApi();
    render(<TelaAssistente />, { wrapper });

    fireEvent.press(await screen.findByText("Remédios de hoje"));
    expect(await screen.findByText("Sim: hoje Thor toma 1 remédio.")).toBeTruthy();

    // Os botões voltam quando os cuidados da Mia chegam
    fireEvent.press(screen.getByText("Mia"));
    fireEvent.press(await screen.findByText("Remédios de hoje"));

    expect(await screen.findByText("Hoje Mia não toma nenhum remédio.")).toBeTruthy();
    // A resposta anterior continua na conversa
    expect(screen.getByText("Sim: hoje Thor toma 1 remédio.")).toBeTruthy();

    fireEvent.press(screen.getByText("Adicionar remédio"));
    expect(router.push).toHaveBeenCalledWith({ pathname: "/pet/[id]/remedio", params: { id: "pet-2" } });
  });

  it("sem consulta agendada, o botão leva para as clínicas; 'Limpar conversa' apaga tudo", async () => {
    responderApi();
    render(<TelaAssistente />, { wrapper });

    fireEvent.press(await screen.findByText("Próxima consulta"));
    expect(await screen.findByText("Thor não tem nenhuma consulta agendada.")).toBeTruthy();

    fireEvent.press(screen.getByText("Agendar consulta"));
    expect(router.push).toHaveBeenCalledWith("/(tabs)/clinica");

    fireEvent.press(screen.getByText("Limpar conversa"));
    expect(screen.queryByText("Thor não tem nenhuma consulta agendada.")).toBeNull();
  });

  it("sem pet cadastrado, convida a cadastrar", async () => {
    responderApi({ pets: [] });
    render(<TelaAssistente />, { wrapper });

    expect(await screen.findByText("Cadastre um pet para começar")).toBeTruthy();
    fireEvent.press(screen.getByText("Cadastrar pet"));
    expect(router.push).toHaveBeenCalledWith("/pet/cadastrar");
    expect(screen.queryByText("Próxima vacina")).toBeNull();
  });

  it("se os cuidados não carregam, não responde no escuro: mostra o erro e 'Tentar novamente'", async () => {
    responderApi({ falharVacinas: true });
    render(<TelaAssistente />, { wrapper });

    expect(await screen.findByText("Não foi possível carregar os cuidados de Thor.")).toBeTruthy();
    expect(screen.queryByText("Próxima vacina")).toBeNull();

    responderApi();
    fireEvent.press(screen.getByText("Tentar novamente"));
    expect(await screen.findByText("Próxima vacina")).toBeTruthy();
  });
});
