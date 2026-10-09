import { normalizarData } from "@/utils/data";

/** Hora do dia (no fuso do aparelho) em que os lembretes de vacina são entregues. */
export const HORA_LEMBRETE = 9;

type DatasVacina = {
  dataAplicacao: string; // YYYY-MM-DD
  proximaDose?: string; // YYYY-MM-DD
};

export type LembreteVacina = {
  /** Dia do cuidado: aplicação agendada ou próxima dose. */
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
 * Decide se e quando lembrar o tutor de uma vacina. Um lembrete por vacina:
 * 1. na véspera do cuidado, às 9h;
 * 2. se a véspera às 9h já passou, no dia do cuidado, às 9h;
 * 3. se o cuidado é hoje e as 9h já passaram, imediatamente.
 * Sem data futura, não há lembrete (`null`).
 */
export function calcularLembreteVacina(
  vacina: DatasVacina,
  agora: Date
): LembreteVacina | null {
  const dataCuidado = proximaDataDoCuidado(vacina, agora);
  if (!dataCuidado) return null;

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
