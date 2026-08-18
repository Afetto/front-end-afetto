import z from "zod";

export const PetSchema = z.object({
    id: z.number(),
    nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
    especie: z.enum(["Cachorro", "Gato", "Coelho", "Pássaro", "Réptil", "Outro"]),
    raca: z.string().min(2, "Raça deve ter ao menos 2 caracteres"),
    sexo: z.enum(["M", "F"]),
    peso: z.string().min(1, "Informe o peso"),
    dataNascimento: z.string().min(1, "Informe a data de nascimento"),
});

export const CreatePetSchema = PetSchema.omit({ id: true });

export type Pet = z.infer<typeof PetSchema>;
export type CreatePetInput = z.infer<typeof CreatePetSchema>;
