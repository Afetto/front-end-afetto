import { cpfValido, dataValida } from "@/utils/validacao";
import { z } from "zod";

// "Esqueci a senha" sem e-mail: o tutor confirma e-mail, CPF e data de
// nascimento do cadastro e escolhe a senha nova (POST /senha/redefinir).
// Os nomes dos campos seguem os do cadastro (em inglês, como no formulário).
export const EsqueciSenhaSchema = z
  .object({
    // trim antes de validar: o teclado do celular costuma deixar um espaço no fim
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, "E-mail é obrigatório")
      .email("Informe um e-mail válido"),
    cpf: z
      .string()
      .min(1, "CPF é obrigatório")
      .refine(cpfValido, "CPF inválido"),
    birthDate: z
      .string()
      .min(1, "Data de nascimento é obrigatória")
      .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA")
      .refine(dataValida, "Data inválida"),
    password: z
      .string()
      .min(1, "Senha nova é obrigatória")
      .min(6, "Senha deve ter ao menos 6 caracteres")
      // Limite do BCrypt, igual ao da API
      .max(72, "Senha deve ter no máximo 72 caracteres"),
    confirmPassword: z.string().min(1, "Confirme a senha nova"),
  })
  .refine((dados) => dados.password === dados.confirmPassword, {
    message: "As senhas não são iguais",
    path: ["confirmPassword"],
  });

export type EsqueciSenhaInput = z.infer<typeof EsqueciSenhaSchema>;
