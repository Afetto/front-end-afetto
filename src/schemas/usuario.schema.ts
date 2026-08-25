import z from "zod";

export const UsuarioSchema = z.object({
    id: z.number(),
    nome: z.string().min(3, "Nome deve ter ao menos 3 caracteres"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().min(10, "Telefone inválido"),
    cpf: z.string().length(14, "CPF inválido"),
});

export const UpdateUsuarioSchema = UsuarioSchema.omit({ id: true, cpf: true }).partial();

export type Usuario = z.infer<typeof UsuarioSchema>;
export type UpdateUsuarioInput = z.infer<typeof UpdateUsuarioSchema>;
