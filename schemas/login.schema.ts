import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
