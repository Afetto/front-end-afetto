import { converterDataParaBR, normalizarData } from "@/utils/data";

type PeriodoRemedio = {
  dataInicio: string; // YYYY-MM-DD
  dataFim?: string; // YYYY-MM-DD
};

/** Onde o remédio está hoje: ainda vai começar, em uso ou já terminou. */
export type SituacaoRemedio = "futuro" | "em_uso" | "terminado";

export function situacaoRemedio(remedio: PeriodoRemedio, agora: Date = new Date()): SituacaoRemedio {
  const hoje = normalizarData(agora).getTime();

  if (normalizarData(remedio.dataInicio).getTime() > hoje) return "futuro";
  if (remedio.dataFim && normalizarData(remedio.dataFim).getTime() < hoje) return "terminado";
  return "em_uso";
}

/** "De 08/10/2026 até 15/10/2026" ou "Desde 08/10/2026, sem data de fim". */
export function descreverPeriodo(remedio: PeriodoRemedio): string {
  const inicio = converterDataParaBR(remedio.dataInicio);
  return remedio.dataFim
    ? `De ${inicio} até ${converterDataParaBR(remedio.dataFim)}`
    : `Desde ${inicio}, sem data de fim`;
}

/** "1 comprimido · A cada 12 horas" (só o que foi preenchido). */
export function descreverDose(remedio: { dosagem?: string; frequencia?: string }): string {
  return [remedio.dosagem, remedio.frequencia].filter(Boolean).join(" · ");
}
