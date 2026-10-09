import { Consulta, LABEL_TIPO_CONSULTA } from "@/schemas/consulta.schema";
import { Remedio } from "@/schemas/remedio.schema";
import { Vacina } from "@/schemas/vacina.schema";
import { converterDataParaBR, normalizarData } from "@/utils/data";
import { situacaoRemedio } from "@/utils/remedio";

// Cuidados que vencem em até este número de dias entram como "Urgente"
// (destaque visual) — não existe campo de urgência na API, é derivado da data.
export const LIMITE_DIAS_URGENTE = 25;

export type ProximoCuidado = {
  chave: string;
  titulo: string;
  subtitulo: string;
  /** Dias até o cuidado; 0 para remédio em uso ou consulta hoje. */
  dias: number;
  /** "URGENTE", "VACINA", "EM USO", "REMÉDIO" ou o tipo da consulta ("CONSULTA", "EXAME"...). */
  selo: string;
  /** Fundo âmbar (urgente, em uso ou consulta hoje) em vez de verde. */
  destaque: boolean;
};

function diasAte(dataIso: string, hoje: Date): number {
  return Math.round((normalizarData(dataIso).getTime() - hoje.getTime()) / 86_400_000);
}

function textoDias(dias: number): string {
  return `${dias} ${dias === 1 ? "dia" : "dias"}`;
}

/**
 * "Próximos cuidados" do detalhe do pet: vacinas agendadas (data de aplicação
 * no futuro), remédios em uso, remédios que ainda vão começar e consultas
 * agendadas. Do mais próximo ao mais distante (em uso e hoje primeiro).
 */
export function proximosCuidados(
  vacinas: Vacina[],
  remedios: Remedio[],
  consultas: Consulta[] = [],
  limite = 3,
  agora: Date = new Date()
): ProximoCuidado[] {
  const hoje = normalizarData(agora);

  const daVacina: ProximoCuidado[] = vacinas
    .map((vacina) => ({ vacina, dias: diasAte(vacina.dataAplicacao, hoje) }))
    .filter(({ dias }) => dias > 0)
    .map(({ vacina, dias }) => {
      const urgente = dias <= LIMITE_DIAS_URGENTE;
      return {
        chave: `vacina-${vacina.id}`,
        titulo: vacina.nomeVacina,
        subtitulo: `Daqui ${textoDias(dias)}.`,
        dias,
        selo: urgente ? "URGENTE" : "VACINA",
        destaque: urgente,
      };
    });

  const doRemedio: ProximoCuidado[] = remedios.flatMap((remedio): ProximoCuidado[] => {
    const situacao = situacaoRemedio(remedio, agora);
    if (situacao === "terminado") return [];

    if (situacao === "em_uso") {
      return [
        {
          chave: `remedio-${remedio.id}`,
          titulo: remedio.nomeRemedio,
          subtitulo: remedio.dataFim
            ? `Em uso até ${converterDataParaBR(remedio.dataFim)}.`
            : "Em uso, sem data de fim.",
          dias: 0,
          selo: "EM USO",
          destaque: true,
        },
      ];
    }

    const dias = diasAte(remedio.dataInicio, hoje);
    return [
      {
        chave: `remedio-${remedio.id}`,
        titulo: remedio.nomeRemedio,
        subtitulo: `Começa daqui ${textoDias(dias)}.`,
        dias,
        selo: "REMÉDIO",
        destaque: false,
      },
    ];
  });

  const daConsulta: ProximoCuidado[] = consultas
    .filter((consulta) => consulta.status === "AGENDADO")
    .map((consulta) => ({ consulta, dias: diasAte(consulta.data, hoje) }))
    .filter(({ dias }) => dias >= 0)
    .map(({ consulta, dias }) => {
      const hora = consulta.hora ? ` às ${consulta.hora}` : "";
      return {
        chave: `consulta-${consulta.id}`,
        titulo: consulta.descricao || LABEL_TIPO_CONSULTA[consulta.tipoEvento],
        subtitulo: dias === 0 ? `Hoje${hora}.` : `Daqui ${textoDias(dias)}${hora ? `,${hora}` : ""}.`,
        dias,
        selo: LABEL_TIPO_CONSULTA[consulta.tipoEvento].toUpperCase(),
        destaque: dias === 0,
      };
    });

  return [...doRemedio, ...daConsulta, ...daVacina].sort((a, b) => a.dias - b.dias).slice(0, limite);
}
