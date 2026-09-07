import { LoginInput } from "@/schemas/login.schema";
import { CadastroInput } from "@/schemas/cadastro.schema";
import { autenticar, cadastrar, sair } from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export function useEntrar() {
    return useMutation({
        mutationFn: ({ email, password }: LoginInput) =>
            autenticar(email, password),
        onSuccess: () => {
            router.replace("/(tabs)");
        },
    });
}

// ─── CADASTRO ────────────────────────────────────────────────────────────────

export function useCadastrar() {
    return useMutation({
        mutationFn: (data: CadastroInput) => cadastrar(data),
    });
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

export function useSair() {
    return useMutation({
        mutationFn: sair,
        onSuccess: () => {
            router.replace("/login");
        },
    });
}
