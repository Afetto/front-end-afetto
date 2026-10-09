import { z } from 'zod';

// "Finalize seu cadastro" (PUT /usuario/me/perfil). A data de nascimento não
// fica aqui: ela já vem do cadastro e é editada em /perfil.
export const CompletarPerfilSchema = z.object({
    // Sobre o lar
    tipoMoradia: z.enum(['casa', 'apartamento'], {
        message: 'Selecione o tipo de moradia',
    }),
    telaProtecao: z.enum(['sim', 'nao'], {
        message: 'Selecione uma opção',
    }),
    quantidadePets: z
        .string()
        .min(1, 'Informe a quantidade')
        .refine((v) => Number(v) >= 1, { message: 'Mínimo 1 pet' })
        // Limite da API
        .refine((v) => Number(v) <= 50, { message: 'Máximo 50 pets' }),

    // Endereço
    cep: z.string().length(9, 'CEP inválido'),
    logradouro: z.string().min(3, 'Logradouro inválido'),
    numero: z.string().min(1, 'Informe o número'),
    complemento: z.string().optional(),
    bairro: z.string().min(2, 'Bairro inválido'),
    cidade: z.string().min(2, 'Cidade inválida'),
    estado: z.string().length(2, 'Estado inválido'),
});

export type CompletarPerfilInput = z.infer<typeof CompletarPerfilSchema>;
