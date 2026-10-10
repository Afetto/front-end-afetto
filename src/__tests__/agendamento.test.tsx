import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { Alert } from "react-native";

import { api } from "@/api/api";
import TelaAgendamento from "@/app/(app)/agendamento/[idClinica]";
import { petEhDoUsuario } from "@/utils/pet";
import { router } from "expo-router";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ idClinica: "cli-1" }),
}));

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" } }),
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// GET /pet traz pets de todas as contas: o Rex é de outra pessoa
const PETS = {
  content: [
    { id: "pet-1", nome: "Thor", especie: "CACHORRO", raca: "", linkUsuario: { href: "http://localhost:8080/usuario/usuario-1" } },
    { id: "pet-2", nome: "Rex", especie: "CACHORRO", raca: "", linkUsuario: { href: "http://localhost:8080/usuario/outro" } },
  ],
};

const AGENDA = {
  idClinica: "cli-1",
  nomeClinica: "Clínica Bigode e Rabo",
  duracaoMinutos: 30,
  dias: [
    { data: "2099-01-02", diaSemana: "sexta-feira", aberta: true, horarios: ["09:00", "09:30"] },
    { data: "2099-01-03", diaSemana: "sábado", aberta: true, horarios: [] },
    { data: "2099-01-04", diaSemana: "domingo", aberta: false, horarios: [] },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, "alert").mockImplementation(() => {});
  mockGet.mockImplementation((url: string) => {
    if (url === "/pet") return Promise.resolve({ data: PETS });
    if (url === "/clinica/cli-1/horarios") return Promise.resolve({ data: AGENDA });
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
});

describe("TelaAgendamento — agendar consulta na clínica (HTTP mockado)", () => {
  it("agenda para o pet da conta no horário escolhido e abre o histórico do pet", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "con-9", idPet: "pet-1" } });

    render(<TelaAgendamento />, { wrapper });

    expect(await screen.findByText("🐕 Thor")).toBeTruthy();
    expect(screen.queryByText("🐕 Rex")).toBeNull();
    expect(screen.getByText("Clínica Bigode e Rabo · 30 min")).toBeTruthy();
    expect(screen.getByText("2 livres")).toBeTruthy();
    expect(screen.getByText("lotado")).toBeTruthy();
    expect(screen.getByText("fechada")).toBeTruthy();

    fireEvent.press(screen.getByText("09:30"));
    fireEvent.changeText(screen.getByPlaceholderText("Check-up, vacina, retorno..."), "Check-up");
    fireEvent.press(screen.getByText("Confirmar agendamento"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/pet/pet-1/historico"));
    expect(mockPost).toHaveBeenCalledWith("/clinica/cli-1/agendamento", {
      idPet: "pet-1",
      data: "2099-01-02",
      hora: "09:30",
      descricao: "Check-up",
      observacoes: null,
    });
    expect(Alert.alert).toHaveBeenCalledWith("Consulta agendada!", expect.stringContaining("Thor · 02/01/2099 às 09:30"));
  });

  it("sem horário escolhido não envia; horário ocupado mostra a mensagem da API", async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 409, data: { erro: "Esse horário já foi agendado. Escolha outro" } },
    });

    render(<TelaAgendamento />, { wrapper });
    await screen.findByText("🐕 Thor");

    fireEvent.press(screen.getByText("Confirmar agendamento"));
    expect(await screen.findByText("Escolha um horário")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();

    fireEvent.press(screen.getByText("09:00"));
    fireEvent.press(screen.getByText("Confirmar agendamento"));

    expect(await screen.findByText("Esse horário já foi agendado. Escolha outro")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });
});

describe("petEhDoUsuario", () => {
  it("compara o id do dono no link; sem link, considera da conta", () => {
    expect(petEhDoUsuario({ linkUsuario: { href: "http://x/usuario/u-1" } }, "u-1")).toBe(true);
    expect(petEhDoUsuario({ linkUsuario: { href: "http://x/usuario/u-2" } }, "u-1")).toBe(false);
    expect(petEhDoUsuario({}, "u-1")).toBe(true);
  });
});
