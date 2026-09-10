import z from "zod";

// Enums conforme a API (https://java-afetto-fork.onrender.com)
export const ESPECIES_PET = [
    "CACHORRO",
    "GATO",
    "COELHO",
    "AVE",
    "REPTIL",
    "ROEDOR",
    "PORCO",
    "MACACO",
    "CAVALO",
    "PEIXE",
    "INSETO",
    "OUTRO",
] as const;

export const EspeciePetSchema = z.enum(ESPECIES_PET);
export const SexoPetSchema = z.enum(["MACHO", "FEMEA"]);

export const PetSchema = z.object({
    id: z.string(),
    nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    especie: EspeciePetSchema,
    raca: z.string().optional().default(""),
    sexo: SexoPetSchema,
    peso: z.number().nonnegative().optional(),
    dataNasc: z.string().optional().default(""), // YYYY-MM-DD
    descricao: z.string().optional().default(""),
    idUsuario: z.string(), // dono do pet (UUID)
});

export const CadastroPetSchema = PetSchema.omit({ id: true });

export type EspeciePet = z.infer<typeof EspeciePetSchema>;
export type SexoPet = z.infer<typeof SexoPetSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type DadosCadastroPet = z.infer<typeof CadastroPetSchema>;
