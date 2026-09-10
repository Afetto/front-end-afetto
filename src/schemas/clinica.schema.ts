import z from "zod";

// ⚠️ A API ainda não tem endpoint de clínica — o time do backend vai adicionar.
// O schema já usa ids em string (UUID) para ficar alinhado com o resto.
export const ClinicaSchema = z.object({
    id: z.string(),
    nome: z.string().min(2, "Nome inválido"),
    bairro: z.string(),
    cidade: z.string(),
    especialidade: z.string(),
    vinculada: z.boolean(),
});

export const VincularClinicaSchema = z.object({
    clinicaId: z.string(),
    usuarioId: z.string(),
});

export type Clinica = z.infer<typeof ClinicaSchema>;
export type DadosVincularClinica = z.infer<typeof VincularClinicaSchema>;
