import z from "zod";

// Schema conforme o OpenAPI real da API (GET /v3/api-docs, schemas
// VacinaRequest/VacinaResponse). Campos como o front pediu inicialmente
// ("dose") não existem no backend — os campos reais são `lote`, `fabricante`
// e `proximaDose`. GET /vacina também não filtra por pet nem devolve
// `idPet` como campo direto: o vínculo vem embutido no link HATEOAS
// `linkPet.href` (ex.: ".../pet/{id}"). Ver `vacina.service.ts` para o
// contorno dessa lacuna.
export const VacinaSchema = z.object({
  id: z.string(),
  nomeVacina: z.string(),
  dataAplicacao: z.string(), // YYYY-MM-DD
  proximaDose: z.string().optional(),
  fabricante: z.string().optional(),
  lote: z.string().optional(),
  observacoes: z.string().optional(),
  idPet: z.string(),
});

// Corpo do POST/PUT /vacina.
export type DadosVacina = {
  nomeVacina: string;
  dataAplicacao: string;
  idPet: string;
  proximaDose?: string;
  fabricante?: string;
  lote?: string;
  observacoes?: string;
};

// Schema do formulário da tela "Cuidados" (react-hook-form): datas entram
// como texto DD/MM/AAAA e são convertidas para ISO no envio.
export const FormCuidadoSchema = z.object({
  nomeVacina: z
    .string()
    .min(2, "Informe o nome da vacina ou medicamento")
    .trim(),
  dataAplicacao: z
    .string()
    .trim()
    .min(1, "Informe a data de aplicação")
    .refine((v) => /^\d{2}\/\d{2}\/\d{4}$/.test(v), "Use o formato DD/MM/AAAA"),
  proximaDose: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^\d{2}\/\d{2}\/\d{4}$/.test(v),
      "Use o formato DD/MM/AAAA"
    ),
  fabricante: z.string().trim().optional(),
  lote: z.string().trim().optional(),
  observacoes: z.string().trim().optional(),
});

export type Vacina = z.infer<typeof VacinaSchema>;
export type FormCuidado = z.infer<typeof FormCuidadoSchema>;
