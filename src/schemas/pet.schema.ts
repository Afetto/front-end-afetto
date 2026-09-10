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

// Resposta da API. A listagem GET /pet traz só id/nome/especie/raca; o detalhe
// GET /pet/{id} traz o resto. Por isso quase tudo é opcional na leitura.
export const PetSchema = z.object({
    id: z.string(),
    nome: z.string(),
    especie: EspeciePetSchema,
    raca: z.string().optional().default(""),
    sexo: SexoPetSchema.optional(),
    peso: z.number().nonnegative().optional(),
    dataNasc: z.string().optional().default(""), // YYYY-MM-DD
    descricao: z.string().optional().default(""),
});

// Corpo do POST/PUT /pet.
export type DadosCadastroPet = {
    nome: string;
    especie: EspeciePet;
    sexo: SexoPet;
    raca?: string;
    peso?: number;
    dataNasc?: string;
    descricao?: string;
    idUsuario: string; // dono do pet (UUID)
};

// Schema do formulário (react-hook-form): campos numéricos/datas entram como
// texto e a espécie/sexo podem estar indefinidos até o usuário escolher.
export const FormCadastroPetSchema = z.object({
    nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres").trim(),
    especie: z.enum(ESPECIES_PET, { message: "Selecione a espécie" }),
    sexo: z.enum(["MACHO", "FEMEA"], { message: "Selecione o sexo" }),
    raca: z.string().trim().optional(),
    peso: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || !Number.isNaN(Number(v.replace(",", "."))),
            "Peso inválido"
        ),
    dataNasc: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || /^\d{2}\/\d{2}\/\d{4}$/.test(v),
            "Use o formato DD/MM/AAAA"
        ),
    descricao: z.string().trim().optional(),
});

export type EspeciePet = z.infer<typeof EspeciePetSchema>;
export type SexoPet = z.infer<typeof SexoPetSchema>;
export type Pet = z.infer<typeof PetSchema>;
export type FormCadastroPet = z.infer<typeof FormCadastroPetSchema>;
