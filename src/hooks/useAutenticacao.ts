import { LoginInput } from "@/schemas/login.schema";
import { CadastroInput } from "@/schemas/cadastro.schema";
import { EsqueciSenhaInput } from "@/schemas/esqueci-senha.schema";
import {
  autenticar,
  cadastrar,
  redefinirSenha,
} from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";

// O "Finalize seu cadastro" fica em usePerfilCompleto.ts.
// O logout não tem hook dedicado: chama `sair()` do SessaoContext direto em
// perfil.tsx — é uma chamada única, sem payload nem necessidade de isPending
// próprio (o botão já usa Alert.alert + await).

// ─── CADASTRO ────────────────────────────────────────────────────────────────

export function useCadastrar() {
    return useMutation({
        mutationFn: (data: CadastroInput) => cadastrar(data),
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
