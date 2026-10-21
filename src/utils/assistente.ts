import { Consulta, LABEL_TIPO_CONSULTA } from "@/schemas/consulta.schema";
import { Remedio } from "@/schemas/remedio.schema";
import { Vacina } from "@/schemas/vacina.schema";
import { formatarDataISO, rotuloDia } from "@/utils/calendario";
import { converterDataParaBR, normalizarData } from "@/utils/data";
import { proximaDataDoCuidado } from "@/utils/lembrete";
import { descreverDose, situacaoRemedio } from "@/utils/remedio";

/*
 * Assistente da aba "Assistente": responde perguntas prontas com os dados
 * reais do pet que a API já devolve (vacinas, remédios e consultas). Não há IA
 * nem texto livre — cada resposta sai destas funções puras, a partir das listas
 * carregadas pelos hooks de dados.
 */

export type IdPergunta = "proxima_vacina" | "remedios_hoje" | "proxima_consulta" | "vacinacao";

// `rotulo` vai no botão; `texto` é a pergunta inteira, que aparece na conversa
export const PERGUNTAS: { id: IdPergunta; rotulo: string; texto: string }[] = [
  { id: "proxima_vacina", rotulo: "Próxima vacina", texto: "Quando é a próxima vacina?" },
  { id: "remedios_hoje", rotulo: "Remédios de hoje", texto: "Tem remédio para dar hoje?" },
  { id: "proxima_consulta", rotulo: "Próxima consulta", texto: "Qual a próxima consulta?" },
  { id: "vacinacao", rotulo: "Vacinação em dia?", texto: "A vacinação está em dia?" },
];

/** Para onde o botão da resposta leva (a tela resolve a rota com o id do pet). */
export type DestinoResposta = "historico" | "nova_vacina" | "novo_remedio" | "agendar";

export type Resposta = {
  texto: string;
  /** Linhas extras (uma por vacina, remédio...). */
  detalhes: string[];
  acao: { rotulo: string; destino: DestinoResposta };
};

export type DadosDoPet = {
  nomePet: string;
  vacinas: Vacina[];
  remedios: Remedio[];
  consultas: Consulta[];
};

// Vacina que vence em até este número de dias aparece como "vence em breve"
// (o mesmo limite do GET /pet/{id}/status-vacinacao da API).
export const DIAS_VACINA_VENCENDO = 30;

const DIA_MS = 86_400_000;

function quandoFica(dataIso: string, agora: Date): string {
  const rotulo = rotuloDia(dataIso, agora);
  // rotuloDia devolve "Hoje"/"Amanhã" ou "seg 13/10"; aqui vai no meio da frase
  return rotulo === "Hoje" || rotulo === "Amanhã" ? rotulo.toLowerCase() : `em ${converterDataParaBR(dataIso)}`;
}

function plural(quantidade: number, singular: string, varios: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

// ─── "Quando é a próxima vacina?" ────────────────────────────────────────────

function responderProximaVacina({ nomePet, vacinas }: DadosDoPet, agora: Date): Resposta {
  const proximas = vacinas
    .map((vacina) => ({ vacina, data: proximaDataDoCuidado(vacina, agora) }))
    .filter((item): item is { vacina: Vacina; data: Date } => item.data !== null)
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  if (proximas.length === 0) {
    return {
      texto: vacinas.length === 0
        ? `Ainda não há vacinas registradas para ${nomePet}.`
        : `${nomePet} não tem nenhuma vacina marcada daqui para a frente.`,
      detalhes: [],
      acao: { rotulo: "Registrar vacina", destino: "nova_vacina" },
    };
  }

  const descrever = ({ vacina, data }: { vacina: Vacina; data: Date }) => {
    const iso = formatarDataISO(data);
    const tipo = iso === vacina.dataAplicacao ? "aplicação agendada" : "próxima dose";
    return { iso, texto: `${vacina.nomeVacina} (${tipo})` };
  };

  const primeira = descrever(proximas[0]);
  return {
    texto: `A próxima vacina de ${nomePet} é ${primeira.texto}, ${quandoFica(primeira.iso, agora)}.`,
    detalhes: proximas.slice(1, 3).map((item) => {
      const { iso, texto } = descrever(item);
      return `Depois: ${texto}, em ${converterDataParaBR(iso)}`;
    }),
    acao: { rotulo: "Ver vacinas no histórico", destino: "historico" },
  };
}

// ─── "Tem remédio para dar hoje?" ────────────────────────────────────────────

function responderRemediosDeHoje({ nomePet, remedios }: DadosDoPet, agora: Date): Resposta {
  const emUso = remedios.filter((remedio) => situacaoRemedio(remedio, agora) === "em_uso");

  if (emUso.length === 0) {
    const proximo = remedios
      .filter((remedio) => situacaoRemedio(remedio, agora) === "futuro")
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))[0];

    return {
      texto: proximo
        ? `Hoje ${nomePet} não toma remédio. O próximo, ${proximo.nomeRemedio}, começa ${quandoFica(proximo.dataInicio, agora)}.`
        : `Hoje ${nomePet} não toma nenhum remédio.`,
      detalhes: [],
      acao: { rotulo: "Adicionar remédio", destino: "novo_remedio" },
    };
  }

  return {
    texto: `Sim: hoje ${nomePet} toma ${plural(emUso.length, "remédio", "remédios")}.`,
    detalhes: emUso.map((remedio) => {
      const dose = descreverDose(remedio);
      const ate = remedio.dataFim ? `até ${converterDataParaBR(remedio.dataFim)}` : "sem data de fim";
      return `${remedio.nomeRemedio}${dose ? ` — ${dose}` : ""} (${ate})`;
    }),
    acao: { rotulo: "Ver remédios no histórico", destino: "historico" },
  };
}

// ─── "Qual a próxima consulta?" ──────────────────────────────────────────────

function responderProximaConsulta({ nomePet, consultas }: DadosDoPet, agora: Date): Resposta {
  const hoje = normalizarData(agora).getTime();
  const proxima = consultas
    .filter((consulta) => consulta.status === "AGENDADO" && normalizarData(consulta.data).getTime() >= hoje)
    .sort((a, b) => `${a.data} ${a.hora ?? ""}`.localeCompare(`${b.data} ${b.hora ?? ""}`))[0];

  if (!proxima) {
    return {
      texto: `${nomePet} não tem nenhuma consulta agendada.`,
      detalhes: [],
      acao: { rotulo: "Agendar consulta", destino: "agendar" },
    };
  }

  const motivo = proxima.descricao || LABEL_TIPO_CONSULTA[proxima.tipoEvento];
  const hora = proxima.hora ? ` às ${proxima.hora}` : "";
  const local = proxima.nomeClinica ? `, na ${proxima.nomeClinica}` : "";
  return {
    texto: `A próxima consulta de ${nomePet} é ${motivo}, ${quandoFica(proxima.data, agora)}${hora}${local}.`,
    detalhes: [],
    acao: { rotulo: "Ver no histórico", destino: "historico" },
  };
}

// ─── "A vacinação está em dia?" ──────────────────────────────────────────────

export type SituacaoVacina =
  | { tipo: "atrasada"; nome: string; data: string }
  | { tipo: "vencendo"; nome: string; data: string }
  | { tipo: "agendada"; nome: string; data: string }
  | { tipo: "em_dia"; nome: string };

function doTipo<T extends SituacaoVacina["tipo"]>(situacoes: SituacaoVacina[], tipo: T) {
  return situacoes.filter((s): s is Extract<SituacaoVacina, { tipo: T }> => s.tipo === tipo);
}

/**
 * A situação de cada vacina vem do registro mais recente com aquele nome: uma
 * dose antiga vencida não conta como atraso se já houve uma aplicação depois.
 */
export function situacaoDasVacinas(vacinas: Vacina[], agora: Date = new Date()): SituacaoVacina[] {
  const hoje = normalizarData(agora).getTime();
  const limiteVencendo = hoje + DIAS_VACINA_VENCENDO * DIA_MS;

  const maisRecente = new Map<string, Vacina>();
  for (const vacina of vacinas) {
    const chave = vacina.nomeVacina.trim().toLowerCase();
    const atual = maisRecente.get(chave);
    if (!atual || vacina.dataAplicacao > atual.dataAplicacao) maisRecente.set(chave, vacina);
  }

  return [...maisRecente.values()].map((vacina): SituacaoVacina => {
    const nome = vacina.nomeVacina;
    if (normalizarData(vacina.dataAplicacao).getTime() > hoje) {
      return { tipo: "agendada", nome, data: vacina.dataAplicacao };
    }
    if (!vacina.proximaDose) return { tipo: "em_dia", nome };

    const proxima = normalizarData(vacina.proximaDose).getTime();
    if (proxima < hoje) return { tipo: "atrasada", nome, data: vacina.proximaDose };
    if (proxima <= limiteVencendo) return { tipo: "vencendo", nome, data: vacina.proximaDose };
    return { tipo: "em_dia", nome };
  });
}

function responderVacinacao({ nomePet, vacinas }: DadosDoPet, agora: Date): Resposta {
  if (vacinas.length === 0) {
    return {
      texto: `Ainda não há vacinas registradas para ${nomePet}, então não dá para dizer se está em dia.`,
      detalhes: [],
      acao: { rotulo: "Registrar vacina", destino: "nova_vacina" },
    };
  }

  const situacoes = situacaoDasVacinas(vacinas, agora);
  const atrasadas = doTipo(situacoes, "atrasada");
  const vencendo = doTipo(situacoes, "vencendo");
  const agendadas = doTipo(situacoes, "agendada");

  const detalhes = [
    ...atrasadas.map((s) => `${s.nome}: atrasada desde ${converterDataParaBR(s.data)}`),
    ...vencendo.map((s) => `${s.nome}: vence em ${converterDataParaBR(s.data)}`),
    ...agendadas.map((s) => `${s.nome}: aplicação agendada para ${converterDataParaBR(s.data)}`),
  ];

  if (atrasadas.length > 0) {
    return {
      texto: `Atenção: ${nomePet} tem ${plural(atrasadas.length, "vacina atrasada", "vacinas atrasadas")}.`,
      detalhes,
      acao: { rotulo: "Agendar consulta", destino: "agendar" },
    };
  }

  if (vencendo.length > 0) {
    return {
      texto: `Está em dia, mas ${plural(vencendo.length, "vacina vence", "vacinas vencem")} nos próximos ${DIAS_VACINA_VENCENDO} dias.`,
      detalhes,
      acao: { rotulo: "Ver vacinas no histórico", destino: "historico" },
    };
  }

  return {
    texto: `Sim! A vacinação de ${nomePet} está em dia.`,
    detalhes: detalhes.length > 0 ? detalhes : [`${plural(situacoes.length, "vacina registrada", "vacinas registradas")}, nenhuma vencida.`],
    acao: { rotulo: "Ver vacinas no histórico", destino: "historico" },
  };
}

/** Resposta à pergunta escolhida, com os dados do pet carregados da API. */
export function responder(pergunta: IdPergunta, dados: DadosDoPet, agora: Date = new Date()): Resposta {
  switch (pergunta) {
    case "proxima_vacina":
      return responderProximaVacina(dados, agora);
    case "remedios_hoje":
      return responderRemediosDeHoje(dados, agora);
    case "proxima_consulta":
      return responderProximaConsulta(dados, agora);
    case "vacinacao":
      return responderVacinacao(dados, agora);
  }
}
