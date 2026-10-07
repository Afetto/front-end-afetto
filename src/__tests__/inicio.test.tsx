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

// Mocka o boundary HTTP: usePets -> petService.listar continuam rodando de verdade.
jest.mock("@/api/api", () => ({
  api: { get: jest.fn() },
}));

// Sessão fixa: o perfil ainda não foi completado, então o checklist aparece.
jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({
    sessao: {
      id: "usuario-1",
      email: "ana@afetto.com",
      nome: "Ana",
      progresso: { perfilCompleto: false },
    },
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

describe("TelaInicio — progresso vindo da API", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("mostra a quantidade de pets da API e conclui a etapa do pet sozinha", async () => {
    mockGet.mockResolvedValueOnce({ data: PETS_DA_API });

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("2 pets")).toBeTruthy();
    expect(screen.getByText("Etapa 2 de 2 — Finalize seu cadastro!")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/pet", expect.anything());
  });

  it("mantém a etapa do pet pendente quando a API não devolve nenhum pet", async () => {
    mockGet.mockResolvedValueOnce({ data: { content: [] } });

    render(<TelaInicio />, { wrapper });

    expect(await screen.findByText("Nenhum pet")).toBeTruthy();
    expect(screen.getByText("Etapa 1 de 2 — Finalize seu cadastro!")).toBeTruthy();
    expect(screen.getByText("Cadastrar seu Pet")).toBeTruthy();
  });

  it("não mostra checklist nem progresso antes de a API responder", () => {
    mockGet.mockReturnValueOnce(new Promise(() => {}));

    render(<TelaInicio />, { wrapper });

    expect(screen.queryByText("Sua configuração")).toBeNull();
    expect(screen.queryByText(/Etapa \d de \d/)).toBeNull();
    expect(screen.queryByText("Nenhum pet")).toBeNull();
  });

  it("mostra erro com 'Tentar novamente' quando a busca falha, e recupera ao tentar de novo", async () => {
    mockGet.mockRejectedValueOnce(new Error("falha de rede"));

    render(<TelaInicio />, { wrapper });

    expect(
      await screen.findByText("Não foi possível carregar seus pets.")
    ).toBeTruthy();
    expect(screen.queryByText("Sua configuração")).toBeNull();

    mockGet.mockResolvedValueOnce({ data: PETS_DA_API });
    fireEvent.press(screen.getByText("Tentar novamente"));

    await waitFor(() => expect(screen.getByText("2 pets")).toBeTruthy());
    expect(screen.queryByText("Não foi possível carregar seus pets.")).toBeNull();
  });
});
