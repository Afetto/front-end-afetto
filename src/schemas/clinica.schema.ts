import z from "zod";

// Clínicas parceiras (/clinica) e avaliações (/clinica/{id}/avaliacao), com os
// mesmos campos da API.

export type EnderecoClinica = {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
};

export type ClinicaResumo = {
  id: string;
  nome: string;
  imagemUrl?: string;
  endereco?: EnderecoClinica;
  // Em km; sem valor quando não há localização para comparar
  distanciaKm?: number;
  // Até 5 km, ou na mesma cidade quando não dá para medir
  perto: boolean;
  favorita: boolean;
  // Média de 1 a 5; sem valor quando ainda não há avaliações
  notaMedia?: number;
  totalAvaliacoes: number;
};

export type Turno = "MANHA" | "TARDE" | "NOITE" | "INTEGRAL";

export type Veterinario = { nome: string; especialidade?: string; turno?: Turno };

// Ex.: { diaSemana: "segunda-feira", abertura: "08:00", fechamento: "18:00" }
export type Expediente = { diaSemana: string; abertura: string; fechamento: string };

export type ClinicaDetalhe = ClinicaResumo & {
  descricao?: string;
  telefone?: string;
  email?: string;
  site?: string;
  veterinarios: Veterinario[];
  expediente: Expediente[];
};

export type Avaliacao = {
  id: string;
  nota: number;
  comentario?: string;
  // Só o primeiro nome e a inicial (ex.: "Ana S.")
  autor: string;
  // Data e hora da última alteração (YYYY-MM-DD e HH:mm)
  data: string;
  hora?: string;
  // É a avaliação do usuário logado
  minha: boolean;
};

// Formulário "Sua avaliação": nota obrigatória de 1 a 5 e comentário opcional
export const FormAvaliacaoSchema = z.object({
  nota: z.number({ message: "Escolha de 1 a 5 estrelas" }).int().min(1, "Escolha de 1 a 5 estrelas").max(5),
  comentario: z.string().trim().max(500, "Use no máximo 500 caracteres").optional(),
});

export type FormAvaliacao = z.infer<typeof FormAvaliacaoSchema>;

// Agendamento (GET /clinica/{id}/horarios e POST /clinica/{id}/agendamento)

export type DiaDisponivel = {
  data: string; // YYYY-MM-DD
  diaSemana: string; // ex.: "segunda-feira"
  // A clínica abre nesse dia da semana
  aberta: boolean;
  // Horários livres "HH:mm" (sem os que já passaram ou já foram agendados)
  horarios: string[];
};

export type HorariosClinica = {
  nomeClinica: string;
  duracaoMinutos: number;
  dias: DiaDisponivel[];
};

export const FormAgendamentoSchema = z.object({
  idPet: z.string({ message: "Escolha o pet" }).min(1, "Escolha o pet"),
  data: z.string({ message: "Escolha o dia" }).min(1, "Escolha o dia"),
  hora: z.string({ message: "Escolha um horário" }).min(1, "Escolha um horário"),
  descricao: z.string().trim().max(255, "Use no máximo 255 caracteres").optional(),
  observacoes: z.string().trim().max(255, "Use no máximo 255 caracteres").optional(),
});

export type FormAgendamento = z.infer<typeof FormAgendamentoSchema>;
