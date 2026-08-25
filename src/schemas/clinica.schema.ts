import z from "zod";

export const ClinicaSchema = z.object({
    id: z.number(),
    nome: z.string().min(2, "Nome inválido"),
    bairro: z.string(),
    cidade: z.string(),
    especialidade: z.string(),
    vinculada: z.boolean(),
});

export const VincularClinicaSchema = z.object({
    clinicaId: z.number(),
    usuarioId: z.number(),
});

export type Clinica = z.infer<typeof ClinicaSchema>;
export type VincularClinicaInput = z.infer<typeof VincularClinicaSchema>;
