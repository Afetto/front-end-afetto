import { converterDataParaISO } from "@/utils/data";
import { dataExiste } from "@/utils/validacao";
import z from "zod";

// Remédio de um pet, como o app usa (campos iguais aos da API: RemedioLista /
// RemedioResponse). Datas no formato da API: YYYY-MM-DD.
export type Remedio = {
  id: string;
  idPet: string;
  nomeRemedio: string;
  dosagem?: string;
  frequencia?: string;
  dataInicio: string;
  dataFim?: string;
  // Só vem no detalhe (GET /remedio/{id}); a listagem não traz
  observacoes?: string;
};

// Corpo do POST/PUT /remedio
export type DadosRemedio = {
  nomeRemedio: string;
  dosagem?: string;
  frequencia?: string;
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
  idPet: string;
};

// Formulário (react-hook-form): datas entram como DD/MM/AAAA e viram ISO no envio.
// Os limites de tamanho são os mesmos da API.
export const FormRemedioSchema = z
  .object({
    nomeRemedio: z
      .string()
      .trim()
      .min(2, "Informe o nome do remédio")
      .max(100, "Use no máximo 100 caracteres"),
    dosagem: z.string().trim().max(100, "Use no máximo 100 caracteres").optional(),
    frequencia: z.string().trim().max(100, "Use no máximo 100 caracteres").optional(),
    dataInicio: z
      .string()
      .trim()
      .min(1, "Informe a data de início")
      .refine(dataExiste, "Data inválida (DD/MM/AAAA)"),
    dataFim: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || dataExiste(v), "Data inválida (DD/MM/AAAA)"),
    observacoes: z.string().trim().optional(),
  })
  .refine(
    (form) =>
      !form.dataFim ||
      !dataExiste(form.dataInicio) ||
      !dataExiste(form.dataFim) ||
      converterDataParaISO(form.dataFim) >= converterDataParaISO(form.dataInicio),
    { message: "A data de fim não pode ser antes da data de início", path: ["dataFim"] }
  );

export type FormRemedio = z.infer<typeof FormRemedioSchema>;
