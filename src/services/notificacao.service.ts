import {
  calcularLembreteVacina,
  HORA_LEMBRETE,
  LembreteVacina,
} from "@/utils/lembrete";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Notificações LOCAIS: o próprio app agenda no aparelho, sem servidor de push.
// Este é o único arquivo que fala com `expo-notifications` para agendar,
// cancelar e pedir permissão — telas e hooks de dados usam só as funções daqui.

const CANAL_LEMBRETES = "lembretes-vacina";
const TIPO_LEMBRETE_VACINA = "lembrete-vacina";

// `expo-notifications` não agenda notificações locais no navegador: na web
// todas as funções abaixo viram no-op em vez de lançar erro.
const DISPONIVEL = Platform.OS !== "web";

export type DadosLembreteVacina = {
  /** Id da vacina na API — vira o identificador do lembrete, para reagendar/cancelar depois. */
  idVacina?: string;
  idPet: string;
  nomeVacina: string;
  /** Opcional: sem ele o texto sai sem o nome do pet. */
  nomePet?: string;
  dataAplicacao: string; // YYYY-MM-DD
  proximaDose?: string; // YYYY-MM-DD
};

function identificadorDoLembrete(idVacina: string): string {
  return `vacina-${idVacina}`;
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
    name: "Lembretes de vacina",
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

  /**
   * Agenda (ou reagenda) o lembrete de uma vacina. Regra de quando lembrar em
   * `utils/lembrete.ts`. Devolve o lembrete criado, ou `null` se não havia o
   * que lembrar ou se o usuário negou a permissão.
   *
   * Quando o lembrete fica para depois, dispara também uma confirmação
   * imediata dizendo o dia do aviso.
   */
  agendarLembreteVacina: async (
    dados: DadosLembreteVacina,
    agora: Date = new Date()
  ): Promise<LembreteVacina | null> => {
    if (!DISPONIVEL) return null;

    // Sempre começa limpando o lembrete anterior da mesma vacina: se a data
    // foi editada para o passado, ele precisa sumir mesmo sem um novo.
    if (dados.idVacina) {
      await Notifications.cancelScheduledNotificationAsync(
        identificadorDoLembrete(dados.idVacina)
      );
    }

    const lembrete = calcularLembreteVacina(dados, agora);
    if (!lembrete) return null;

    if (!(await garantirPermissao())) return null;

    // `data` viaja com a notificação: é o que diz qual pet abrir no toque.
    const data = { tipo: TIPO_LEMBRETE_VACINA, idPet: dados.idPet };
    const quando = lembrete.quando === "amanha" ? "amanhã" : "hoje";

    await Notifications.scheduleNotificationAsync({
      identifier: dados.idVacina ? identificadorDoLembrete(dados.idVacina) : undefined,
      content: {
        title: comNomeDoPet(dados.nomePet, `${dados.nomeVacina} é ${quando}`),
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
      const dia = formatarDiaMes(lembrete.momento);

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Lembrete agendado",
          body: comNomeDoPet(
            dados.nomePet,
            `${dados.nomeVacina} — aviso em ${dia} às ${HORA_LEMBRETE}h.`
          ),
          data,
        },
        trigger: gatilhoImediato(),
      });
    }

    return lembrete;
  },

  /** Cancela o lembrete de uma vacina excluída. */
  cancelarLembreteVacina: async (idVacina: string): Promise<void> => {
    if (!DISPONIVEL) return;
    await Notifications.cancelScheduledNotificationAsync(identificadorDoLembrete(idVacina));
  },

  /** Cancela os lembretes de todas as vacinas de um pet excluído. */
  cancelarLembretesDoPet: async (idPet: string): Promise<void> => {
    if (!DISPONIVEL) return;

    const agendadas = await Notifications.getAllScheduledNotificationsAsync();
    const doPet = agendadas.filter(
      (item) =>
        item.content.data?.tipo === TIPO_LEMBRETE_VACINA &&
        item.content.data?.idPet === idPet
    );

    await Promise.all(
      doPet.map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  },

  /** Lê, de um toque em notificação, o pet cujo histórico deve abrir (ou `null`). */
  idPetDoToque: (resposta: Notifications.NotificationResponse): string | null => {
    const data = resposta.notification.request.content.data;
    if (data?.tipo !== TIPO_LEMBRETE_VACINA) return null;
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
