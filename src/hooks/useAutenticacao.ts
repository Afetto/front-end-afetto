import { LoginInput } from "@/schemas/login.schema";
import { CadastroInput } from "@/schemas/cadastro.schema";
import { EsqueciSenhaInput } from "@/schemas/esqueci-senha.schema";
import {
  autenticar,
  cadastrar,
  redefinirSenha,
} from "@/services/autenticacao.service";
import { ResultadoCadastroComEntrada } from "@/types/autenticacao.types";
import { useMutation } from "@tanstack/react-query";

// O "Finalize seu cadastro" fica em usePerfilCompleto.ts.
// O logout não tem hook dedicado: chama `sair()` do SessaoContext direto em
// perfil.tsx — é uma chamada única, sem payload nem necessidade de isPending
// próprio (o botão já usa Alert.alert + await).

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
