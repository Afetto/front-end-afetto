import { z } from 'zod';

export const CompleteProfileSchema = z.object({
    // Informações adicionais
    birthDate: z.string().min(10, 'Data inválida'),
    tipoMoradia: z.enum(['casa', 'apartamento'], {
        errorMap: () => ({ message: 'Selecione o tipo de moradia' }),
    }),
    telaTroteção: z.enum(['sim', 'nao'], {
        errorMap: () => ({ message: 'Selecione uma opção' }),
    }),
    quantidadePets: z
        .string()
        .min(1, 'Informe a quantidade')
        .refine((v) => Number(v) >= 1, { message: 'Mínimo 1 pet' }),

    // Endereço
    cep: z.string().length(9, 'CEP inválido'),
    logradouro: z.string().min(3, 'Logradouro inválido'),
    numero: z.string().min(1, 'Informe o número'),
    complemento: z.string().optional(),
    bairro: z.string().min(2, 'Bairro inválido'),
    cidade: z.string().min(2, 'Cidade inválida'),
    estado: z.string().length(2, 'Estado inválido'),
});

export type CompleteProfileInput = z.infer<typeof CompleteProfileSchema>;
