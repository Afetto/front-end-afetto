import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaEsqueciSenha from "@/app/(auth)/esqueci-senha";
import { router } from "expo-router";

// Mocka o boundary HTTP: schema -> react-hook-form -> useMutation -> service rodam de verdade
jest.mock("@/api/api", () => ({
  api: { post: jest.fn() },
}));

const mockPost = api.post as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function preencher({ confirmacao = "novaSenha123" } = {}) {
  fireEvent.changeText(screen.getByPlaceholderText("exemplo@email.com"), "  Ana@Afetto.com ");
  fireEvent.changeText(screen.getByPlaceholderText("000.000.000-00"), "52998224725");
  fireEvent.changeText(screen.getByPlaceholderText("DD/MM/AAAA"), "20051995");
  fireEvent.changeText(screen.getByPlaceholderText("Mínimo de 6 caracteres"), "novaSenha123");
  fireEvent.changeText(screen.getByPlaceholderText("Repita a senha nova"), confirmacao);
}

function erroDaApi(status: number, erro: string) {
  return { isAxiosError: true, response: { status, data: { erro } } };
}

describe("TelaEsqueciSenha — redefinir senha (HTTP mockado)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("manda e-mail, CPF só com dígitos, data em ISO e a senha nova; depois oferece voltar ao login", async () => {
    mockPost.mockResolvedValueOnce({ status: 204, data: "" });

    render(<TelaEsqueciSenha />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Redefinir senha"));

    expect(await screen.findByText("Senha alterada!")).toBeTruthy();
    expect(mockPost).toHaveBeenCalledWith("/senha/redefinir", {
      email: "ana@afetto.com",
      cpf: "52998224725",
      dataNascimento: "1995-05-20",
      novaSenha: "novaSenha123",
    });

    fireEvent.press(screen.getByText("Ir para o login"));
    expect(router.replace).toHaveBeenCalledWith("/login");
  });

  it("mostra a mensagem da API quando os dados não conferem (400)", async () => {
    mockPost.mockRejectedValueOnce(
      erroDaApi(400, "Os dados não conferem. Confira e-mail, CPF e data de nascimento")
    );

    render(<TelaEsqueciSenha />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Redefinir senha"));

    expect(
      await screen.findByText("Os dados não conferem. Confira e-mail, CPF e data de nascimento")
    ).toBeTruthy();
    expect(screen.queryByText("Senha alterada!")).toBeNull();
  });

  it("mostra o bloqueio quando há tentativas demais (429)", async () => {
    mockPost.mockRejectedValueOnce(erroDaApi(429, "Muitas tentativas. Tente de novo em 15 minutos"));

    render(<TelaEsqueciSenha />, { wrapper });
    preencher();
    fireEvent.press(screen.getByText("Redefinir senha"));

    expect(await screen.findByText("Muitas tentativas. Tente de novo em 15 minutos")).toBeTruthy();
  });

  it("não chama a API se a confirmação da senha for diferente", async () => {
    render(<TelaEsqueciSenha />, { wrapper });
    preencher({ confirmacao: "outraSenha" });
    fireEvent.press(screen.getByText("Redefinir senha"));

    expect(await screen.findByText("As senhas não são iguais")).toBeTruthy();
    await waitFor(() => expect(mockPost).not.toHaveBeenCalled());
  });
});
