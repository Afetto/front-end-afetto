import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaCadastro from "@/app/(auth)/cadastro";

// Mocka o boundary HTTP: tudo abaixo de `api.post` continua rodando de verdade
// (schema -> react-hook-form -> useMutation -> autenticacao.service -> mapeamento do payload).
jest.mock("@/api/api", () => ({
  api: { post: jest.fn() },
}));

const mockPost = api.post as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// Valores "crus" digitados pelo usuário — as máscaras formatam no onChange.
const ENTRADA_CRUA = {
  name: "Fulano de Tal",
  cpf: "52998224725",
  email: "teste@afetto.com",
  phone: "999998888",
  birthDate: "10051990",
  password: "123456",
};

// A API em produção espera CPF/telefone só com dígitos e data em ISO (YYYY-MM-DD).
const PAYLOAD_ESPERADO = {
  nome: "Fulano de Tal",
  cpf: "52998224725",
  email: "teste@afetto.com",
  senha: "123456",
  telefone: "55999998888",
  dataNascimento: "1990-05-10",
};

function preencherFormulario() {
  fireEvent.changeText(
    screen.getByPlaceholderText("Jack Sullivan"),
    ENTRADA_CRUA.name
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("000.000.000-00"),
    ENTRADA_CRUA.cpf
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("exemplo@email.com"),
    ENTRADA_CRUA.email
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("99999-9999"),
    ENTRADA_CRUA.phone
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("DD/MM/AAAA"),
    ENTRADA_CRUA.birthDate
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("••••••••"),
    ENTRADA_CRUA.password
  );
}

describe("TelaCadastro — cadastro end-to-end (HTTP mockado)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("faz POST /usuario com o payload mapeado e exibe o sucesso", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    render(<TelaCadastro />, { wrapper });
    preencherFormulario();
    fireEvent.press(screen.getByText("Fazer cadastro"));

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith("/usuario", PAYLOAD_ESPERADO);
    });

    expect(await screen.findByText("Conta criada!")).toBeTruthy();
  });

  it("mostra erro no campo e-mail quando a API responde 403", async () => {
    mockPost.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 403 },
    });

    render(<TelaCadastro />, { wrapper });
    preencherFormulario();
    fireEvent.press(screen.getByText("Fazer cadastro"));

    expect(
      await screen.findByText("Este e-mail já está cadastrado")
    ).toBeTruthy();
    expect(screen.queryByText("Conta criada!")).toBeNull();
  });

  it("não chama a API quando o formulário é inválido", async () => {
    render(<TelaCadastro />, { wrapper });

    fireEvent.press(screen.getByText("Fazer cadastro"));

    expect(await screen.findByText("Nome é obrigatório")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando o CPF é inválido", async () => {
    render(<TelaCadastro />, { wrapper });
    preencherFormulario();
    fireEvent.changeText(
      screen.getByPlaceholderText("000.000.000-00"),
      "11111111111"
    );
    fireEvent.press(screen.getByText("Fazer cadastro"));

    expect(await screen.findByText("CPF inválido")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });
});
