import { dataExiste } from "@/utils/validacao";
import z from "zod";

// Consulta do pet (/consulta). Campos iguais aos da API; datas YYYY-MM-DD e
// hora HH:MM. O status é calculado pela API: data futura = AGENDADO, passada =
// CONCLUIDO; CANCELADO só quando o tutor cancela.
export const TIPOS_CONSULTA = ["CONSULTA", "RETORNO", "EXAME", "CIRURGIA", "EMERGENCIA", "OUTRO"] as const;
export type TipoConsulta = (typeof TIPOS_CONSULTA)[number];

export const LABEL_TIPO_CONSULTA: Record<TipoConsulta, string> = {
  CONSULTA: "Consulta",
  RETORNO: "Retorno",
  EXAME: "Exame",
  CIRURGIA: "Cirurgia",
  EMERGENCIA: "Emergência",
  OUTRO: "Outro",
};

export type StatusConsulta = "AGENDADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";

export type Consulta = {
  id: string;
  idPet: string;
  tipoEvento: TipoConsulta;
  // Motivo (ex.: "Check-up anual")
  descricao: string;
  data: string;
  hora?: string;
  status: StatusConsulta;
  // Preenchidos quando foi agendada numa clínica parceira
  idClinica?: string;
  nomeClinica?: string;
  // Só vêm no detalhe (GET /consulta/{id})
  nomeVeterinario?: string;
  observacoes?: string;
};

// Corpo do POST/PUT /consulta
export type DadosConsulta = {
  tipoEvento: TipoConsulta;
  descricao: string;
  data: string;
  hora?: string;
  nomeVeterinario?: string;
  observacoes?: string;
  idPet: string;
};

function horaValida(hora: string) {
  const partes = /^(\d{2}):(\d{2})$/.exec(hora);
  return !!partes && Number(partes[1]) <= 23 && Number(partes[2]) <= 59;
}

// Formulário: data DD/MM/AAAA e hora HH:MM (opcional). Limites iguais aos da API.
export const FormConsultaSchema = z.object({
  tipoEvento: z.enum(TIPOS_CONSULTA, { message: "Escolha o tipo" }),
  descricao: z
    .string()
    .trim()
    .min(2, "Informe o motivo")
    .max(255, "Use no máximo 255 caracteres"),
  data: z
    .string()
    .trim()
    .min(1, "Informe a data")
    .refine(dataExiste, "Data inválida (DD/MM/AAAA)"),
  hora: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || horaValida(v), "Hora inválida (HH:MM)"),
  nomeVeterinario: z.string().trim().max(100, "Use no máximo 100 caracteres").optional(),
  observacoes: z.string().trim().max(255, "Use no máximo 255 caracteres").optional(),
});

export type FormConsulta = z.infer<typeof FormConsultaSchema>;
