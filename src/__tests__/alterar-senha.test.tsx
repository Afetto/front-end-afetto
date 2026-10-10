import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import { useAlterarSenha } from "@/hooks/perfil/useAlterarSenha";

// "Alterar senha" do Perfil: a API confere a senha atual (PUT /usuario/me/senha)
jest.mock("@/api/api", () => ({
  api: { put: jest.fn() },
}));

const mockPut = api.put as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

type Hook = { current: ReturnType<typeof useAlterarSenha> };

function preencher(result: Hook, atual: string, nova: string, confirmar: string) {
  act(() => {
    result.current.abrirModal();
    result.current.setSenhaAtual(atual);
    result.current.setNovaSenha(nova);
    result.current.setConfirmarSenha(confirmar);
  });
}

async function salvar(result: Hook) {
  let deuCerto = false;
  await act(async () => {
    deuCerto = await result.current.alterarSenha();
  });
  return deuCerto;
}

beforeEach(() => {
  mockPut.mockReset();
});

describe("useAlterarSenha — Alterar senha do Perfil", () => {
  it("manda a senha atual e a nova para PUT /usuario/me/senha e fecha o modal", async () => {
    mockPut.mockResolvedValueOnce({ data: undefined });
    const { result } = renderHook(() => useAlterarSenha(), { wrapper });

    preencher(result, "senha123", "outra456", "outra456");

    expect(await salvar(result)).toBe(true);
    expect(mockPut).toHaveBeenCalledWith("/usuario/me/senha", { senhaAtual: "senha123", novaSenha: "outra456" });
    expect(result.current.mostrarModal).toBe(false);
  });

  it("senha atual errada: mostra a mensagem da API e o modal continua aberto", async () => {
    mockPut.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { erro: "A senha atual está incorreta" } },
    });
    const { result } = renderHook(() => useAlterarSenha(), { wrapper });

    preencher(result, "chute123", "outra456", "outra456");

    expect(await salvar(result)).toBe(false);
    expect(result.current.erroSenha).toBe("A senha atual está incorreta");
    expect(result.current.mostrarModal).toBe(true);
  });

  it("não chama a API quando a confirmação é diferente ou a nova é igual à atual", async () => {
    const { result } = renderHook(() => useAlterarSenha(), { wrapper });

    preencher(result, "senha123", "outra456", "outra999");
    expect(await salvar(result)).toBe(false);
    expect(result.current.erroSenha).toBe("As senhas não coincidem.");

    preencher(result, "senha123", "senha123", "senha123");
    expect(await salvar(result)).toBe(false);
    expect(result.current.erroSenha).toBe("A nova senha precisa ser diferente da atual.");

    expect(mockPut).not.toHaveBeenCalled();
  });
});
