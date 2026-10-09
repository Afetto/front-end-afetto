import { cpfValido, dataValida } from "@/utils/validacao";
import { z } from "zod";

export const CadastroSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .trim(),
  cpf: z
    .string()
    .min(1, "CPF é obrigatório")
    .refine(cpfValido, "CPF inválido"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido")
    .toLowerCase()
    .trim(),
  phoneCode: z.string().min(1, "Código é obrigatório"),
  phone: z
    .string()
    .min(1, "Celular é obrigatório")
    .refine((v) => v.replace(/\D/g, "").length >= 9, "Número inválido"),
  birthDate: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA")
    .refine(dataValida, "Data inválida"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type CadastroInput = z.infer<typeof CadastroSchema>;
