import { LoginInput } from "@/schemas/login.schema";
import { RegisterInput } from "@/schemas/register.schema";
import { authenticate, register, logout } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

// ─── LOGIN ───────────────────────────────────────────────────────────────────

export function useLogin() {
    return useMutation({
        mutationFn: ({ email, password }: LoginInput) =>
            authenticate(email, password),
        onSuccess: () => {
            router.replace("/(tabs)");
        },
    });
}

// ─── REGISTER ────────────────────────────────────────────────────────────────

export function useRegister() {
    return useMutation({
        mutationFn: (data: RegisterInput) => register(data),
    });
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────

export function useLogout() {
    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            router.replace("/login");
        },
    });
}