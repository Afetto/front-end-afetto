// Contas do calendário do pet (funções puras, no fuso do aparelho)

export const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// A semana começa no domingo, como nos calendários brasileiros
export const INICIAIS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];

/** Um mês do calendário: `mes` de 0 (janeiro) a 11 (dezembro). */
export type MesCalendario = { ano: number; mes: number };

/** Date (dia local) → "YYYY-MM-DD", o formato da API. Não usa toISOString, que vai para UTC. */
export function formatarDataISO(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function mesDe(data: Date): MesCalendario {
  return { ano: data.getFullYear(), mes: data.getMonth() };
}

export function somarMeses({ ano, mes }: MesCalendario, quantidade: number): MesCalendario {
  const data = new Date(ano, mes + quantidade, 1);
  return mesDe(data);
}

/** Primeiro e último dia do mês, no formato da API (para ?inicio=&fim=). */
export function periodoDoMes({ ano, mes }: MesCalendario): { inicio: string; fim: string } {
  return {
    inicio: formatarDataISO(new Date(ano, mes, 1)),
    fim: formatarDataISO(new Date(ano, mes + 1, 0)),
  };
}

/**
 * Células da grade do mês, semana a semana: `null` nos dias antes do dia 1
 * (para ele cair na coluna certa) e "YYYY-MM-DD" em cada dia do mês.
 */
export function celulasDoMes({ ano, mes }: MesCalendario): (string | null)[] {
  const vazias = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();

  return [
    ...Array.from({ length: vazias }, () => null),
    ...Array.from({ length: totalDias }, (_, i) => formatarDataISO(new Date(ano, mes, i + 1))),
  ];
}

/** Agrupa itens pela data ("YYYY-MM-DD"), mantendo a ordem em que vieram. */
export function agruparPorData<T extends { data: string }>(itens: T[]): Record<string, T[]> {
  const grupos: Record<string, T[]> = {};
  for (const item of itens) {
    (grupos[item.data] ??= []).push(item);
  }
  return grupos;
}

/** Dia selecionado ao abrir um mês: hoje, se for o mês atual; senão o dia 1. */
export function diaInicial(mes: MesCalendario, hoje: Date = new Date()): string {
  const atual = mesDe(hoje);
  return atual.ano === mes.ano && atual.mes === mes.mes
    ? formatarDataISO(hoje)
    : periodoDoMes(mes).inicio;
}
