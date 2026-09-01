import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import RegisterScreen from "@/app/register";

// Mocka o boundary HTTP: tudo abaixo de `api.post` continua rodando de verdade
// (schema -> react-hook-form -> useMutation -> auth.service -> mapeamento do payload).
jest.mock("@/api/api", () => ({
  api: { post: jest.fn() },
}));

const postMock = api.post as jest.Mock;

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
const RAW_INPUT = {
  name: "Fulano de Tal",
  cpf: "52998224725",
  email: "teste@afetto.com",
  phone: "999998888",
  birthDate: "10051990",
  password: "123456",
};

const EXPECTED_PAYLOAD = {
  nome: "Fulano de Tal",
  email: "teste@afetto.com",
  cpf: "529.982.247-25",
  telefone: "+55 99999-8888",
  dataNascimento: "10/05/1990",
  senha: "123456",
};

function fillForm() {
  fireEvent.changeText(
    screen.getByPlaceholderText("Jack Sullivan"),
    RAW_INPUT.name
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("000.000.000-00"),
    RAW_INPUT.cpf
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("exemplo@email.com"),
    RAW_INPUT.email
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("99999-9999"),
    RAW_INPUT.phone
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("DD/MM/AAAA"),
    RAW_INPUT.birthDate
  );
  fireEvent.changeText(
    screen.getByPlaceholderText("••••••••"),
    RAW_INPUT.password
  );
}

describe("RegisterScreen — cadastro end-to-end (HTTP mockado)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("faz POST /usuarios com o payload mapeado e exibe o sucesso", async () => {
    postMock.mockResolvedValueOnce({ data: {} });

    render(<RegisterScreen />, { wrapper });
    fillForm();
    fireEvent.press(screen.getByText("Criar Conta"));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith("/usuarios", EXPECTED_PAYLOAD);
    });

    expect(await screen.findByText("Conta criada!")).toBeTruthy();
  });

  it("mostra erro no campo e-mail quando a API responde 409", async () => {
    postMock.mockRejectedValueOnce({ response: { status: 409 } });

    render(<RegisterScreen />, { wrapper });
    fillForm();
    fireEvent.press(screen.getByText("Criar Conta"));

    expect(
      await screen.findByText("Este e-mail já está cadastrado")
    ).toBeTruthy();
    expect(screen.queryByText("Conta criada!")).toBeNull();
  });

  it("não chama a API quando o formulário é inválido", async () => {
    render(<RegisterScreen />, { wrapper });

    fireEvent.press(screen.getByText("Criar Conta"));

    expect(await screen.findByText("Nome é obrigatório")).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });

  it("bloqueia o envio quando o CPF é inválido", async () => {
    render(<RegisterScreen />, { wrapper });
    fillForm();
    fireEvent.changeText(
      screen.getByPlaceholderText("000.000.000-00"),
      "11111111111"
    );
    fireEvent.press(screen.getByText("Criar Conta"));

    expect(await screen.findByText("CPF inválido")).toBeTruthy();
    expect(postMock).not.toHaveBeenCalled();
  });
});
