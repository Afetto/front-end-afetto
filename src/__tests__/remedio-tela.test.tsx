import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaRemedio from "@/app/(app)/pet/[id]/remedio";
import { router } from "expo-router";

// Mocka só o HTTP: schema, formulário, hooks e service rodam de verdade
jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

let mockParametros: { id: string; remedioId?: string } = { id: "pet-1" };

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParametros,
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function preencher({ inicio = "08102026", fim = "15102026" } = {}) {
  fireEvent.changeText(screen.getByPlaceholderText("Amoxicilina, Vermífugo..."), "Amoxicilina");
  fireEvent.changeText(screen.getByPlaceholderText("1 comprimido, 5 gotas..."), "1 comprimido");
  fireEvent.changeText(screen.getByPlaceholderText("A cada 12 horas, 1 vez ao dia..."), "A cada 12 horas");
  const [campoInicio, campoFim] = screen.getAllByPlaceholderText("DD/MM/AAAA");
  fireEvent.changeText(campoInicio, inicio);
  fireEvent.changeText(campoFim, fim);
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParametros = { id: "pet-1" };
});

describe("TelaRemedio — adicionar e editar remédio (HTTP mockado)", () => {
  it("cria o remédio com as datas em ISO e volta para o histórico do pet", async () => {
    mockPost.mockResolvedValueOnce({
      data: { id: "rem-1", idPet: "pet-1", nomeRemedio: "Amoxicilina", dataInicio: "2026-10-08" },
    });

    render(<TelaRemedio />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Salvar"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/pet/pet-1/historico"));
    expect(mockPost).toHaveBeenCalledWith("/remedio", {
      nomeRemedio: "Amoxicilina",
      dosagem: "1 comprimido",
      frequencia: "A cada 12 horas",
      dataInicio: "2026-10-08",
      dataFim: "2026-10-15",
      observacoes: undefined,
      idPet: "pet-1",
    });
  });

  it("não deixa salvar com o fim antes do início", async () => {
    render(<TelaRemedio />, { wrapper });
    preencher({ inicio: "15102026", fim: "08102026" });
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("A data de fim não pode ser antes da data de início")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("mostra a mensagem da API quando ela recusa", async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { erro: "Pet não encontrado" } },
    });

    render(<TelaRemedio />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Pet não encontrado")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("ao editar, preenche com o remédio salvo e manda PUT", async () => {
    mockParametros = { id: "pet-1", remedioId: "rem-1" };
    mockGet.mockResolvedValueOnce({
      data: {
        id: "rem-1", idPet: "pet-1", nomeRemedio: "Amoxicilina", dosagem: "1 comprimido",
        frequencia: null, dataInicio: "2026-10-08", dataFim: null, observacoes: "Com comida",
      },
    });
    mockPut.mockResolvedValueOnce({ data: { id: "rem-1", idPet: "pet-1", nomeRemedio: "Amoxicilina", dataInicio: "2026-10-08" } });

    render(<TelaRemedio />, { wrapper });

    expect(await screen.findByDisplayValue("Amoxicilina")).toBeTruthy();
    expect(screen.getByDisplayValue("08/10/2026")).toBeTruthy();
    expect(screen.getByDisplayValue("Com comida")).toBeTruthy();
    expect(screen.queryByText("Remédio")).toBeNull(); // sem o seletor de tipo ao editar

    fireEvent.press(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/remedio/rem-1", expect.objectContaining({
        nomeRemedio: "Amoxicilina",
        dataInicio: "2026-10-08",
        dataFim: undefined,
        observacoes: "Com comida",
      }))
    );
  });
});
