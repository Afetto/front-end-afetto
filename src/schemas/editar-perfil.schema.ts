import { z } from "zod";

export const EditarPerfilSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(3, "Nome deve ter ao menos 3 caracteres")
    .trim(),
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido")
    .toLowerCase()
    .trim(),
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  dataNascimento: z
    .string()
    .min(1, "Data de nascimento é obrigatória")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use o formato DD/MM/AAAA"),
  // A API exige a senha atual em toda atualização de usuário (mesmo sem
  // trocar a senha) — ver comentário em `autenticacao.service.ts#atualizarUsuario`.
  senha: z.string().min(1, "Confirme sua senha atual para salvar"),
});

export type EditarPerfilInput = z.infer<typeof EditarPerfilSchema>;
