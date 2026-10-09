import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaCompletarPerfil from "@/app/(app)/completar-perfil";
import { cepService } from "@/services/cep.service";
import { router } from "expo-router";

// Mocka as bordas: API do Afetto e ViaCEP. Schema, formulário, hooks e o
// service do perfil rodam de verdade.
jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), put: jest.fn() },
}));

jest.mock("@/services/cep.service", () => ({
  cepService: { buscarPorCep: jest.fn() },
}));

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" } }),
}));

const mockGet = api.get as jest.Mock;
const mockPut = api.put as jest.Mock;
const mockBuscarCep = cepService.buscarPorCep as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const PERFIL_INCOMPLETO = {
  perfilCompleto: false,
  tipoMoradia: null,
  telaProtecao: null,
  quantidadePets: 0,
  endereco: null,
};

const PERFIL_SALVO = {
  perfilCompleto: true,
  tipoMoradia: "CASA",
  telaProtecao: false,
  quantidadePets: 2,
  endereco: {
    cep: "05422-001", logradouro: "Rua dos Pinheiros", numero: "500", complemento: null,
    bairro: "Pinheiros", cidade: "São Paulo", estado: "SP",
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockBuscarCep.mockResolvedValue({
    logradouro: "Rua dos Pinheiros",
    bairro: "Pinheiros",
    cidade: "São Paulo",
    estado: "SP",
  });
});

async function preencherFormulario() {
  fireEvent.press(await screen.findByText(/Casa$/));
  fireEvent.press(screen.getByText(/Não$/));
  fireEvent.changeText(screen.getByPlaceholderText("1"), "2");
  fireEvent.changeText(screen.getByPlaceholderText("00000-000"), "05422001");
  // O ViaCEP (mockado) preenche logradouro, bairro, cidade e UF
  expect(await screen.findByDisplayValue("Rua dos Pinheiros")).toBeTruthy();
  fireEvent.changeText(screen.getByPlaceholderText("123"), "500");
}

describe("TelaCompletarPerfil — PUT /usuario/me/perfil (HTTP mockado)", () => {
  it("manda CASA/APARTAMENTO e a tela de proteção como true/false, e volta para a Home", async () => {
    mockGet.mockResolvedValueOnce({ data: PERFIL_INCOMPLETO });
    mockPut.mockResolvedValueOnce({ data: PERFIL_SALVO });

    render(<TelaCompletarPerfil />, { wrapper });
    await preencherFormulario();
    fireEvent.press(screen.getByText("Concluir"));

    await waitFor(() => expect(router.back).toHaveBeenCalled());
    expect(mockPut).toHaveBeenCalledWith("/usuario/me/perfil", {
      tipoMoradia: "CASA",
      telaProtecao: false,
      quantidadePets: 2,
      endereco: {
        cep: "05422-001",
        logradouro: "Rua dos Pinheiros",
        numero: "500",
        complemento: null,
        bairro: "Pinheiros",
        cidade: "São Paulo",
        estado: "SP",
      },
    });
  });

  it("quem já finalizou o cadastro vê os dados salvos no formulário", async () => {
    mockGet.mockResolvedValueOnce({ data: PERFIL_SALVO });

    render(<TelaCompletarPerfil />, { wrapper });

    expect(await screen.findByDisplayValue("Rua dos Pinheiros")).toBeTruthy();
    expect(screen.getByDisplayValue("500")).toBeTruthy();
    expect(screen.getByDisplayValue("05422-001")).toBeTruthy();
    expect(screen.getByDisplayValue("2")).toBeTruthy();
  });

  it("mostra a mensagem da API quando ela recusa o endereço", async () => {
    mockGet.mockResolvedValueOnce({ data: PERFIL_INCOMPLETO });
    mockPut.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { erro: "UF inválida: XX" } },
    });

    render(<TelaCompletarPerfil />, { wrapper });
    await preencherFormulario();
    fireEvent.press(screen.getByText("Concluir"));

    expect(await screen.findByText("UF inválida: XX")).toBeTruthy();
    expect(router.back).not.toHaveBeenCalled();
  });
});
