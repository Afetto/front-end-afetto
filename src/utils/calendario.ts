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

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** "Hoje", "Amanhã" ou "seg 13/10" para uma data "YYYY-MM-DD". */
export function rotuloDia(dataIso: string, hoje: Date = new Date()): string {
  const [ano, mes, dia] = dataIso.split("-").map(Number);
  const data = new Date(ano, mes - 1, dia);
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const diferenca = Math.round((data.getTime() - base.getTime()) / 86_400_000);

  if (diferenca === 0) return "Hoje";
  if (diferenca === 1) return "Amanhã";
  return `${DIAS_CURTOS[data.getDay()]} ${String(dia).padStart(2, "0")}/${String(mes).padStart(2, "0")}`;
}

type EventoDaAgenda = {
  tipo: string;
  data: string;
  hora?: string;
  idReferencia: string;
};

/**
 * Agenda da Home: os próximos compromissos (consultas, vacinas e próximas
 * doses, em ordem de data e hora) e os remédios em tratamento hoje — o
 * calendário manda um evento por dia de remédio, então cada um aparece uma vez só.
 */
export function resumirAgenda<T extends EventoDaAgenda>(
  eventos: T[],
  hoje: string,
  limite = 5
): { proximos: T[]; emTratamento: T[] } {
  const proximos = eventos
    .filter((evento) => evento.tipo !== "REMEDIO" && evento.data >= hoje)
    .sort((a, b) => (a.data + (a.hora ?? "")).localeCompare(b.data + (b.hora ?? "")))
    .slice(0, limite);

  const vistos = new Set<string>();
  const emTratamento = eventos.filter((evento) => {
    if (evento.tipo !== "REMEDIO" || evento.data !== hoje || vistos.has(evento.idReferencia)) return false;
    vistos.add(evento.idReferencia);
    return true;
  });

  return { proximos, emTratamento };
}
