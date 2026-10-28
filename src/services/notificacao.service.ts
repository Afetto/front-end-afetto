import {
  calcularLembreteConsulta,
  calcularLembreteRemedio,
  calcularLembreteVacina,
  HORA_LEMBRETE,
  Lembrete,
} from "@/utils/lembrete";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Notificações LOCAIS: o próprio app agenda no aparelho, sem servidor de push.
// Este é o único arquivo que fala com `expo-notifications` para agendar,
// cancelar e pedir permissão — telas e hooks de dados usam só as funções daqui.

// O id do canal continua o da primeira versão (só de vacina): trocar criaria
// um canal novo nos aparelhos que já têm o app.
const CANAL_LEMBRETES = "lembretes-vacina";

type TipoCuidado = "vacina" | "remedio" | "consulta";

/** `data.tipo` das notificações: "lembrete-vacina", "lembrete-remedio" ou "lembrete-consulta". */
function tipoDoLembrete(cuidado: TipoCuidado): string {
  return `lembrete-${cuidado}`;
}

function ehLembrete(tipo: unknown): boolean {
  return typeof tipo === "string" && tipo.startsWith("lembrete-");
}

// `expo-notifications` não agenda notificações locais no navegador: na web
// todas as funções abaixo viram no-op em vez de lançar erro.
const DISPONIVEL = Platform.OS !== "web";

type DadosComuns = {
  idPet: string;
  /** Opcional: sem ele o texto sai sem o nome do pet. */
  nomePet?: string;
};

export type DadosLembreteVacina = DadosComuns & {
  /** Id da vacina na API — vira o identificador do lembrete, para reagendar/cancelar depois. */
  idVacina?: string;
  nomeVacina: string;
  dataAplicacao: string; // YYYY-MM-DD
  proximaDose?: string; // YYYY-MM-DD
};

export type DadosLembreteRemedio = DadosComuns & {
  idRemedio?: string;
  nomeRemedio: string;
  dataInicio: string; // YYYY-MM-DD
};

export type DadosLembreteConsulta = DadosComuns & {
  idConsulta?: string;
  /** Motivo da consulta (ex.: "Check-up anual"). */
  descricao: string;
  data: string; // YYYY-MM-DD
  hora?: string; // HH:MM
};

function identificadorDoLembrete(cuidado: TipoCuidado, id: string): string {
  return `${cuidado}-${id}`;
}

function doisDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}

function formatarDiaMes(data: Date): string {
  return `${doisDigitos(data.getDate())}/${doisDigitos(data.getMonth() + 1)}`;
}

function comNomeDoPet(nomePet: string | undefined, texto: string): string {
  return nomePet ? `${nomePet}: ${texto}` : texto;
}

/** No Android, a notificação imediata precisa dizer em qual canal sai; no iOS o gatilho é `null`. */
function gatilhoImediato(): Notifications.NotificationTriggerInput {
  return Platform.OS === "android" ? { channelId: CANAL_LEMBRETES } : null;
}

async function criarCanal(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CANAL_LEMBRETES, {
    name: "Lembretes de cuidados",
    importance: Notifications.AndroidImportance.HIGH,
  });
}

async function garantirPermissao(): Promise<boolean> {
  // Android 13+: o sistema só mostra o pedido de permissão se já existir um canal.
  await criarCanal();

  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;

  const resposta = await Notifications.requestPermissionsAsync();
  return resposta.granted;
}

type LembreteDoCuidado = DadosComuns & {
  cuidado: TipoCuidado;
  id?: string;
  /** Nome que aparece no aviso (vacina, remédio ou motivo da consulta). */
  nome: string;
  /** Texto do aviso a partir de "amanhã"/"hoje" (ex.: "V10 é amanhã"). */
  titulo: (quando: string) => string;
  lembrete: Lembrete | null;
};

/**
 * Agenda (ou reagenda) o lembrete de um cuidado. Sempre começa cancelando o
 * anterior do mesmo cuidado: se a data foi editada para o passado, ele
 * precisa sumir mesmo sem um novo. Quando o lembrete fica para depois,
 * dispara também uma confirmação imediata dizendo o dia do aviso.
 */
async function agendar(dados: LembreteDoCuidado): Promise<Lembrete | null> {
  if (!DISPONIVEL) return null;

  if (dados.id) {
    await Notifications.cancelScheduledNotificationAsync(identificadorDoLembrete(dados.cuidado, dados.id));
  }

  const { lembrete } = dados;
  if (!lembrete) return null;

  if (!(await garantirPermissao())) return null;

  // `data` viaja com a notificação: é o que diz qual pet abrir no toque.
  const data = { tipo: tipoDoLembrete(dados.cuidado), idPet: dados.idPet };
  const quando = lembrete.quando === "amanha" ? "amanhã" : "hoje";

  await Notifications.scheduleNotificationAsync({
    identifier: dados.id ? identificadorDoLembrete(dados.cuidado, dados.id) : undefined,
    content: {
      title: comNomeDoPet(dados.nomePet, dados.titulo(quando)),
      body: "Toque para ver o histórico de cuidados.",
      data,
    },
    trigger: lembrete.momento
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: lembrete.momento,
          channelId: CANAL_LEMBRETES,
        }
      : gatilhoImediato(),
  });

  if (lembrete.momento) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Lembrete agendado",
        body: comNomeDoPet(
          dados.nomePet,
          `${dados.nome} — aviso em ${formatarDiaMes(lembrete.momento)} às ${HORA_LEMBRETE}h.`
        ),
        data,
      },
      trigger: gatilhoImediato(),
    });
  }

  return lembrete;
}

async function cancelar(cuidado: TipoCuidado, id: string): Promise<void> {
  if (!DISPONIVEL) return;
  await Notifications.cancelScheduledNotificationAsync(identificadorDoLembrete(cuidado, id));
}

export const notificacaoService = {
  /** Roda uma vez na abertura do app: como exibir com o app aberto + canal do Android. */
  configurar: async (): Promise<void> => {
    if (!DISPONIVEL) return;

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        // No Android, sem som o banner não desce com o app aberto.
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    await criarCanal();
  },

  // Agendar devolve o lembrete criado, ou `null` se não havia o que lembrar
  // ou se o usuário negou a permissão.
  /** Vacina: lembra da aplicação agendada ou da próxima dose (regra em `utils/lembrete.ts`). */
  agendarLembreteVacina: (dados: DadosLembreteVacina, agora: Date = new Date()): Promise<Lembrete | null> =>
    agendar({
      ...dados,
      cuidado: "vacina",
      id: dados.idVacina,
      nome: dados.nomeVacina,
      titulo: (quando) => `${dados.nomeVacina} é ${quando}`,
      lembrete: calcularLembreteVacina(dados, agora),
    }),

  /** Remédio: lembra do dia em que o tratamento começa. */
  agendarLembreteRemedio: (dados: DadosLembreteRemedio, agora: Date = new Date()): Promise<Lembrete | null> =>
    agendar({
      ...dados,
      cuidado: "remedio",
      id: dados.idRemedio,
      nome: dados.nomeRemedio,
      titulo: (quando) => `${dados.nomeRemedio} começa ${quando}`,
      lembrete: calcularLembreteRemedio(dados, agora),
    }),

  /** Consulta: lembra na véspera (ou no dia) da consulta agendada. */
  agendarLembreteConsulta: (dados: DadosLembreteConsulta, agora: Date = new Date()): Promise<Lembrete | null> =>
    agendar({
      ...dados,
      cuidado: "consulta",
      id: dados.idConsulta,
      nome: dados.descricao,
      titulo: (quando) => `${dados.descricao} é ${quando}${dados.hora ? ` às ${dados.hora}` : ""}`,
      lembrete: calcularLembreteConsulta(dados, agora),
    }),

  /** Cancela o lembrete de uma vacina excluída. */
  cancelarLembreteVacina: (idVacina: string): Promise<void> => cancelar("vacina", idVacina),

  /** Cancela o lembrete de um remédio excluído. */
  cancelarLembreteRemedio: (idRemedio: string): Promise<void> => cancelar("remedio", idRemedio),

  /** Cancela o lembrete de uma consulta cancelada ou excluída. */
  cancelarLembreteConsulta: (idConsulta: string): Promise<void> => cancelar("consulta", idConsulta),

  /** Cancela os lembretes de todos os cuidados de um pet excluído. */
  cancelarLembretesDoPet: async (idPet: string): Promise<void> => {
    if (!DISPONIVEL) return;

    const agendadas = await Notifications.getAllScheduledNotificationsAsync();
    const doPet = agendadas.filter(
      (item) => ehLembrete(item.content.data?.tipo) && item.content.data?.idPet === idPet
    );

    await Promise.all(
      doPet.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  },

  /** Lê, de um toque em notificação, o pet cujo histórico deve abrir (ou `null`). */
  idPetDoToque: (resposta: Notifications.NotificationResponse): string | null => {
    const data = resposta.notification.request.content.data;
    if (!ehLembrete(data?.tipo)) return null;
    return typeof data.idPet === "string" ? data.idPet : null;
  },

  /** Marca o último toque como tratado, para não reabrir a tela na próxima abertura do app. */
  limparUltimoToque: (): void => {
    if (!DISPONIVEL) return;
    try {
      Notifications.clearLastNotificationResponse();
    } catch {
      // Ambiente sem suporte a limpar o toque: quem chama já evita tratar o
      // mesmo toque duas vezes (ver useNotificacoes).
    }
  },
};
