import { normalizarData } from "@/utils/data";

/** Hora do dia (no fuso do aparelho) em que os lembretes de cuidados são entregues. */
export const HORA_LEMBRETE = 9;

type DatasVacina = {
  dataAplicacao: string; // YYYY-MM-DD
  proximaDose?: string; // YYYY-MM-DD
};

export type Lembrete = {
  /** Dia do cuidado: vacina (aplicação agendada ou próxima dose), início do remédio ou consulta. */
  dataCuidado: Date;
  /** Quando a notificação deve aparecer. `null` = imediatamente. */
  momento: Date | null;
  /** "amanha" se o aviso sai na véspera; "hoje" se sai no próprio dia do cuidado. */
  quando: "amanha" | "hoje";
};

/**
 * Próxima data em que a vacina pede uma ação do tutor, ou `null` se não há.
 *
 * - `dataAplicacao` só conta se for depois de hoje (vacina agendada). Com a
 *   data de hoje ela é o registro de uma aplicação que acabou de acontecer —
 *   não faz sentido lembrar.
 * - `proximaDose` conta de hoje em diante.
 */
export function proximaDataDoCuidado(vacina: DatasVacina, agora: Date): Date | null {
  const hoje = normalizarData(agora).getTime();
  const candidatas: Date[] = [];

  const aplicacao = normalizarData(vacina.dataAplicacao);
  if (aplicacao.getTime() > hoje) candidatas.push(aplicacao);

  if (vacina.proximaDose) {
    const proxima = normalizarData(vacina.proximaDose);
    if (proxima.getTime() >= hoje) candidatas.push(proxima);
  }

  if (candidatas.length === 0) return null;
  return candidatas.reduce((maisProxima, data) =>
    data.getTime() < maisProxima.getTime() ? data : maisProxima
  );
}

function noHorarioDoLembrete(dia: Date, deslocamentoEmDias: number): Date {
  const momento = new Date(dia);
  momento.setDate(momento.getDate() + deslocamentoEmDias);
  momento.setHours(HORA_LEMBRETE, 0, 0, 0);
  return momento;
}

/**
 * Decide quando lembrar o tutor de um cuidado no dia `dataCuidado`. Um lembrete por cuidado:
 * 1. na véspera do cuidado, às 9h;
 * 2. se a véspera às 9h já passou, no dia do cuidado, às 9h;
 * 3. se o cuidado é hoje e as 9h já passaram, imediatamente.
 */
export function calcularLembrete(dataCuidado: Date, agora: Date): Lembrete {
  const naVespera = noHorarioDoLembrete(dataCuidado, -1);
  if (naVespera.getTime() > agora.getTime()) {
    return { dataCuidado, momento: naVespera, quando: "amanha" };
  }

  const noDia = noHorarioDoLembrete(dataCuidado, 0);
  if (noDia.getTime() > agora.getTime()) {
    return { dataCuidado, momento: noDia, quando: "hoje" };
  }

  return { dataCuidado, momento: null, quando: "hoje" };
}

/** Lembrete de vacina: a data mais próxima entre a aplicação agendada e a próxima dose. Sem data futura, `null`. */
export function calcularLembreteVacina(vacina: DatasVacina, agora: Date): Lembrete | null {
  const dataCuidado = proximaDataDoCuidado(vacina, agora);
  return dataCuidado ? calcularLembrete(dataCuidado, agora) : null;
}

/**
 * Lembrete de remédio: o dia em que o tratamento começa. Tratamento que já
 * começou não tem o que lembrar (`null`).
 */
export function calcularLembreteRemedio(remedio: { dataInicio: string }, agora: Date): Lembrete | null {
  const inicio = normalizarData(remedio.dataInicio);
  if (Number.isNaN(inicio.getTime()) || inicio.getTime() < normalizarData(agora).getTime()) return null;
  return calcularLembrete(inicio, agora);
}

/**
 * Lembrete de consulta: o dia dela. Consulta cancelada, de um dia que já
 * passou ou de hoje num horário que já passou é só registro (`null`).
 */
export function calcularLembreteConsulta(
  consulta: { data: string; hora?: string; cancelada?: boolean },
  agora: Date
): Lembrete | null {
  if (consulta.cancelada) return null;
  const dia = normalizarData(consulta.data);
  if (Number.isNaN(dia.getTime()) || dia.getTime() < normalizarData(agora).getTime()) return null;

  const horario = /^(\d{2}):(\d{2})/.exec(consulta.hora ?? "");
  if (horario) {
    const momentoDaConsulta = new Date(dia);
    momentoDaConsulta.setHours(Number(horario[1]), Number(horario[2]), 0, 0);
    if (momentoDaConsulta.getTime() <= agora.getTime()) return null;
  }

  return calcularLembrete(dia, agora);
}
