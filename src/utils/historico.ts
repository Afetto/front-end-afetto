import { Consulta, LABEL_TIPO_CONSULTA } from "@/schemas/consulta.schema";
import { Remedio } from "@/schemas/remedio.schema";
import { Vacina } from "@/schemas/vacina.schema";
import { normalizarData } from "@/utils/data";
import { descreverDose, descreverPeriodo, situacaoRemedio } from "@/utils/remedio";

export type TipoEventoHistorico = "vacina" | "remedio" | "consulta";

/** "atual" = remédio em uso; "futuro" = agendado/ainda vai começar; "passado" = já aconteceu. */
export type SituacaoEvento = "atual" | "futuro" | "passado";

export type EventoHistorico = {
  chave: string;
  tipo: TipoEventoHistorico;
  id: string;
  titulo: string;
  /** Data mostrada na linha do tempo (aplicação da vacina, início do remédio ou dia da consulta), YYYY-MM-DD. */
  data: string;
  situacao: SituacaoEvento;
  descricao: string;
  /** Fabricante/lote da vacina, dose/frequência do remédio ou observação da consulta. */
  extra?: string;
  /** Texto do selo do card (ex.: "VACINA", "REMÉDIO", "EXAME", "CANCELADA"). */
  selo: string;
  /** Consulta cancelada: fica no histórico, mas não pode mais ser editada. */
  cancelada: boolean;
  podeEditar: boolean;
  /** Só consulta agendada pode ser cancelada. */
  podeCancelar: boolean;
};

const PESO_SITUACAO: Record<SituacaoEvento, number> = { atual: 0, futuro: 1, passado: 2 };

function eventoDeVacina(vacina: Vacina, hoje: number): EventoHistorico {
  // Com a data de hoje a vacina ainda conta como "próxima" (mesma regra de antes)
  const futura = normalizarData(vacina.dataAplicacao).getTime() >= hoje;
  const extra = [
    vacina.fabricante && `Fabricante: ${vacina.fabricante}`,
    vacina.lote && `Lote: ${vacina.lote}`,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    chave: `vacina-${vacina.id}`,
    tipo: "vacina",
    id: vacina.id,
    titulo: vacina.nomeVacina,
    data: vacina.dataAplicacao,
    situacao: futura ? "futuro" : "passado",
    descricao:
      vacina.observacoes ||
      (futura ? "Próxima aplicação agendada." : "Aplicada — sem observações registradas."),
    extra: extra || undefined,
    selo: "VACINA",
    cancelada: false,
    podeEditar: true,
    podeCancelar: false,
  };
}

function eventoDeRemedio(remedio: Remedio, agora: Date): EventoHistorico {
  const situacao = situacaoRemedio(remedio, agora);
  const sufixo = situacao === "em_uso" ? " · em uso" : situacao === "futuro" ? " · ainda vai começar" : " · terminado";

  return {
    chave: `remedio-${remedio.id}`,
    tipo: "remedio",
    id: remedio.id,
    titulo: remedio.nomeRemedio,
    data: remedio.dataInicio,
    situacao: situacao === "em_uso" ? "atual" : situacao === "futuro" ? "futuro" : "passado",
    descricao: descreverPeriodo(remedio) + sufixo,
    extra: descreverDose(remedio) || undefined,
    selo: "REMÉDIO",
    cancelada: false,
    podeEditar: true,
    podeCancelar: false,
  };
}

const TEXTO_STATUS_CONSULTA: Record<Consulta["status"], string> = {
  AGENDADO: "Agendada",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Realizada",
  CANCELADO: "Cancelada",
};

function eventoDeConsulta(consulta: Consulta): EventoHistorico {
  // O status vem pronto da API (pela data); cancelada vai para o passado
  const situacao: SituacaoEvento =
    consulta.status === "AGENDADO" ? "futuro" : consulta.status === "EM_ANDAMENTO" ? "atual" : "passado";
  const cancelada = consulta.status === "CANCELADO";

  const descricao = [
    TEXTO_STATUS_CONSULTA[consulta.status],
    consulta.hora && `às ${consulta.hora}`,
    consulta.nomeClinica,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    chave: `consulta-${consulta.id}`,
    tipo: "consulta",
    id: consulta.id,
    titulo: consulta.descricao || LABEL_TIPO_CONSULTA[consulta.tipoEvento],
    data: consulta.data,
    situacao,
    descricao,
    extra: consulta.observacoes,
    selo: cancelada ? "CANCELADA" : LABEL_TIPO_CONSULTA[consulta.tipoEvento].toUpperCase(),
    cancelada,
    podeEditar: !cancelada,
    podeCancelar: consulta.status === "AGENDADO",
  };
}

/**
 * Junta vacinas, remédios e consultas numa linha do tempo só: primeiro o que
 * está em andamento (remédio em uso), depois o que vem pela frente (do mais
 * próximo ao mais distante) e por fim o que já passou (do mais recente ao
 * mais antigo).
 */
export function montarHistorico(
  vacinas: Vacina[],
  remedios: Remedio[],
  consultas: Consulta[] = [],
  agora: Date = new Date()
): EventoHistorico[] {
  const hoje = normalizarData(agora).getTime();

  const eventos = [
    ...vacinas.map((vacina) => eventoDeVacina(vacina, hoje)),
    ...remedios.map((remedio) => eventoDeRemedio(remedio, agora)),
    ...consultas.map(eventoDeConsulta),
  ];

  return eventos.sort((a, b) => {
    if (a.situacao !== b.situacao) return PESO_SITUACAO[a.situacao] - PESO_SITUACAO[b.situacao];

    const diferenca = normalizarData(a.data).getTime() - normalizarData(b.data).getTime();
    return a.situacao === "futuro" ? diferenca : -diferenca;
  });
}
