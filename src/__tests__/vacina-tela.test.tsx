import { QueryClientProvider } from "@tanstack/react-query";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaCuidados from "@/app/(app)/pet/[id]/cuidados";

// Mocka só o HTTP: schema, formulário compartilhado, hooks e service rodam de verdade
jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

let mockParametros: { id: string; vacinaId?: string } = { id: "pet-1" };

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParametros,
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = criarClienteDeTeste();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const VACINA_DA_API = {
  id: "vac-1", nomeVacina: "V10", dataAplicacao: "2026-09-01", proximaDose: "2027-09-01",
  fabricante: "Zoetis", lote: null, observacoes: "Sem reação", linkPet: { href: "/pet/pet-1" },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockParametros = { id: "pet-1" };
});

describe("TelaCuidados — adicionar e editar vacina (HTTP mockado)", () => {
  it("cria a vacina com as datas em ISO, sem campos vazios, e volta para o histórico", async () => {
    mockPost.mockResolvedValueOnce({ data: { ...VACINA_DA_API } });

    render(<TelaCuidados />, { wrapper });
    expect(screen.getByText("Adicionar cuidado")).toBeTruthy();
    expect(screen.getByText("Remédio")).toBeTruthy(); // seletor de tipo ao adicionar

    fireEvent.changeText(screen.getByPlaceholderText("V10, Antirrábica..."), "V10");
    const [aplicacao, proximaDose] = screen.getAllByPlaceholderText("DD/MM/AAAA");
    fireEvent.changeText(aplicacao, "01092026");
    fireEvent.changeText(proximaDose, "01092027");
    fireEvent.press(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({ pathname: "/pet/[id]/historico", params: { id: "pet-1" } })
    );
    expect(mockPost).toHaveBeenCalledWith("/vacina", {
      nomeVacina: "V10",
      dataAplicacao: "2026-09-01",
      proximaDose: "2027-09-01",
      fabricante: undefined,
      lote: undefined,
      observacoes: undefined,
      idPet: "pet-1",
    });
  });

  it("valida no schema: sem nome e sem data não chama a API", async () => {
    render(<TelaCuidados />, { wrapper });
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Informe o nome da vacina")).toBeTruthy();
    expect(screen.getByText("Informe a data de aplicação")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("mostra a mensagem da API quando ela recusa", async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 404, data: { erro: "Pet não encontrado" } },
    });

    render(<TelaCuidados />, { wrapper });
    fireEvent.changeText(screen.getByPlaceholderText("V10, Antirrábica..."), "V10");
    fireEvent.changeText(screen.getAllByPlaceholderText("DD/MM/AAAA")[0], "01092026");
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Pet não encontrado")).toBeTruthy();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("ao editar, preenche com a vacina salva (datas em DD/MM/AAAA) e manda PUT", async () => {
    mockParametros = { id: "pet-1", vacinaId: "vac-1" };
    mockGet.mockResolvedValueOnce({ data: VACINA_DA_API });
    mockPut.mockResolvedValueOnce({ data: VACINA_DA_API });

    render(<TelaCuidados />, { wrapper });

    expect(await screen.findByDisplayValue("V10")).toBeTruthy();
    expect(screen.getByText("Editar vacina")).toBeTruthy();
    expect(screen.getByDisplayValue("01/09/2026")).toBeTruthy();
    expect(screen.getByDisplayValue("01/09/2027")).toBeTruthy();
    expect(screen.getByDisplayValue("Zoetis")).toBeTruthy();
    expect(screen.queryByText("Remédio")).toBeNull(); // sem o seletor de tipo ao editar
    expect(mockGet).toHaveBeenCalledWith("/vacina/vac-1");

    fireEvent.press(screen.getByText("Salvar"));

    await waitFor(() =>
      expect(mockPut).toHaveBeenCalledWith("/vacina/vac-1", expect.objectContaining({
        nomeVacina: "V10",
        dataAplicacao: "2026-09-01",
        proximaDose: "2027-09-01",
        fabricante: "Zoetis",
        observacoes: "Sem reação",
        idPet: "pet-1",
      }))
    );
  });

  it("se a vacina não carrega ao editar, mostra o erro (não um formulário vazio) e tenta de novo", async () => {
    mockParametros = { id: "pet-1", vacinaId: "vac-1" };
    mockGet.mockRejectedValueOnce(new Error("falha de rede"));

    render(<TelaCuidados />, { wrapper });

    expect(await screen.findByText("Não foi possível carregar a vacina.")).toBeTruthy();
    expect(screen.queryByText("Salvar")).toBeNull();

    mockGet.mockResolvedValueOnce({ data: VACINA_DA_API });
    fireEvent.press(screen.getByText("Tentar novamente"));

    expect(await screen.findByDisplayValue("V10")).toBeTruthy();
  });
});
