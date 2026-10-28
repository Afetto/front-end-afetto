import { LoginInput } from "@/schemas/login.schema";
import { CadastroInput } from "@/schemas/cadastro.schema";
import { EsqueciSenhaInput } from "@/schemas/esqueci-senha.schema";
import {
  autenticar,
  cadastrar,
  redefinirSenha,
  sair,
} from "@/services/autenticacao.service";
import { ResultadoCadastroComEntrada } from "@/types/autenticacao.types";
import { useMutation } from "@tanstack/react-query";

// O "Finalize seu cadastro" fica em usePerfilCompleto.ts.

/** Cache de GET /usuario/me: quem é o dono do cookie de sessão (revalidação no boot). */
export const CHAVE_USUARIO_LOGADO = ["usuario", "me"] as const;

// ─── CADASTRO ────────────────────────────────────────────────────────────────

/**
 * Cria a conta (POST /usuario) e já entra com o mesmo e-mail e senha
 * (POST /login + GET /usuario/me), para o tutor cair direto na Home sem
 * digitar tudo de novo. Se esse login falhar, a conta continua criada:
 * `usuario` volta `null` e a tela manda para o login normal.
 */
export function useCadastrar() {
  return useMutation({
    mutationFn: async (data: CadastroInput): Promise<ResultadoCadastroComEntrada> => {
      const cadastro = await cadastrar(data);
      if (!cadastro.ok) return cadastro;

      const entrada = await autenticar(data.email, data.password);
      return { ok: true, usuario: entrada.ok ? entrada.usuario : null };
    },
  });
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export function useEntrar() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => autenticar(email, password),
  });
}

// ─── ESQUECI A SENHA ─────────────────────────────────────────────────────────

export function useRedefinirSenha() {
  return useMutation({
    mutationFn: (data: EsqueciSenhaInput) => redefinirSenha(data),
  });
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

/**
 * Encerra a sessão na API (POST /logout). Usado pelo SessaoContext, que em
 * seguida limpa a sessão local e o cache — a tela chama só `sair()` do contexto.
 */
export function useEncerrarSessao() {
  return useMutation({
  mutationFn: () => sair(),
  });
}

