import { LoginInput } from "@/schemas/login.schema";
import { CadastroInput } from "@/schemas/cadastro.schema";
import {
  autenticar,
  cadastrar,
  completarPerfil,
  DadosPerfilCompleto,
} from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";

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

// ─── COMPLETAR PERFIL ────────────────────────────────────────────────────────

export function useCompletarPerfil() {
    return useMutation({
        mutationFn: (data: DadosPerfilCompleto) => completarPerfil(data),
    });
}
