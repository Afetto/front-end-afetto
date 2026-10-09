import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { notificacaoService } from "@/services/notificacao.service";

// Mocka a biblioteca nativa: o que se testa aqui é o que o service pede a ela
// (o quê agendar, quando, com qual identificador) — a regra de datas em si
// está em lembrete.test.ts.
jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 6 },
  SchedulableTriggerInputTypes: { DATE: "date" },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  clearLastNotificationResponse: jest.fn(),
}));

const mockAgendar = Notifications.scheduleNotificationAsync as jest.Mock;
const mockCancelar = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const mockPermissaoAtual = Notifications.getPermissionsAsync as jest.Mock;
const mockPedirPermissao = Notifications.requestPermissionsAsync as jest.Mock;
const mockListarAgendadas = Notifications.getAllScheduledNotificationsAsync as jest.Mock;
const mockCriarCanal = Notifications.setNotificationChannelAsync as jest.Mock;

// Quarta, 07/10/2026, 20h.
const AGORA = new Date(2026, 9, 7, 20, 0);

const VACINA = {
  idVacina: "vac-1",
  idPet: "pet-1",
  nomeVacina: "V10",
  nomePet: "Jordan",
  dataAplicacao: "2026-09-01",
  proximaDose: "2026-10-12",
};

beforeEach(() => {
  jest.resetAllMocks();
  mockPermissaoAtual.mockResolvedValue({ granted: true, canAskAgain: true });
  mockAgendar.mockResolvedValue("id-gerado");
  mockCancelar.mockResolvedValue(undefined);
  mockCriarCanal.mockResolvedValue(null);
});

describe("notificacaoService.agendarLembreteVacina", () => {
  it("agenda o lembrete para a véspera às 9h, com o id da vacina e o pet no payload", async () => {
    const lembrete = await notificacaoService.agendarLembreteVacina(VACINA, AGORA);

    expect(lembrete?.quando).toBe("amanha");

    const [lembreteAgendado] = mockAgendar.mock.calls[0];
    expect(lembreteAgendado.identifier).toBe("vacina-vac-1");
    expect(lembreteAgendado.content.title).toBe("Jordan: V10 é amanhã");
    expect(lembreteAgendado.content.data).toEqual({ tipo: "lembrete-vacina", idPet: "pet-1" });
    expect(lembreteAgendado.trigger.type).toBe("date");
    expect(lembreteAgendado.trigger.date).toEqual(new Date(2026, 9, 11, 9, 0));
  });

  it("dispara na hora uma confirmação dizendo o dia do aviso", async () => {
    await notificacaoService.agendarLembreteVacina(VACINA, AGORA);

    expect(mockAgendar).toHaveBeenCalledTimes(2);
    const [confirmacao] = mockAgendar.mock.calls[1];
    expect(confirmacao.content.title).toBe("Lembrete agendado");
    expect(confirmacao.content.body).toBe("Jordan: V10 — aviso em 11/10 às 9h.");
    expect(confirmacao.content.data).toEqual({ tipo: "lembrete-vacina", idPet: "pet-1" });
    expect(confirmacao.trigger).toBeNull(); // imediata
  });

  it("avisa na hora, sem confirmação, quando a próxima dose é hoje", async () => {
    await notificacaoService.agendarLembreteVacina(
      { ...VACINA, proximaDose: "2026-10-07" },
      AGORA
    );

    expect(mockAgendar).toHaveBeenCalledTimes(1);
    const [lembrete] = mockAgendar.mock.calls[0];
    expect(lembrete.content.title).toBe("Jordan: V10 é hoje");
    expect(lembrete.trigger).toBeNull();
  });

  it("cancela o lembrete anterior antes de reagendar (edição da vacina)", async () => {
    await notificacaoService.agendarLembreteVacina(VACINA, AGORA);

    expect(mockCancelar).toHaveBeenCalledWith("vacina-vac-1");
    expect(mockCancelar.mock.invocationCallOrder[0]).toBeLessThan(
      mockAgendar.mock.invocationCallOrder[0]
    );
  });

  it("só cancela o anterior quando a vacina ficou sem data futura", async () => {
    const lembrete = await notificacaoService.agendarLembreteVacina(
      { ...VACINA, proximaDose: undefined },
      AGORA
    );

    expect(lembrete).toBeNull();
    expect(mockCancelar).toHaveBeenCalledWith("vacina-vac-1");
    expect(mockAgendar).not.toHaveBeenCalled();
  });

  it("pede a permissão na primeira vez e não agenda se o usuário negar", async () => {
    mockPermissaoAtual.mockResolvedValue({ granted: false, canAskAgain: true });
    mockPedirPermissao.mockResolvedValue({ granted: false, canAskAgain: false });

    const lembrete = await notificacaoService.agendarLembreteVacina(VACINA, AGORA);

    expect(mockPedirPermissao).toHaveBeenCalledTimes(1);
    expect(lembrete).toBeNull();
    expect(mockAgendar).not.toHaveBeenCalled();
  });

  it("monta o texto sem o nome do pet quando ele não está disponível", async () => {
    await notificacaoService.agendarLembreteVacina({ ...VACINA, nomePet: undefined }, AGORA);

    expect(mockAgendar.mock.calls[0][0].content.title).toBe("V10 é amanhã");
    expect(mockAgendar.mock.calls[1][0].content.body).toBe("V10 — aviso em 11/10 às 9h.");
  });

  it("no Android, cria o canal e manda as duas notificações por ele", async () => {
    const plataforma = jest.replaceProperty(Platform, "OS", "android");
    try {
      await notificacaoService.agendarLembreteVacina(VACINA, AGORA);

      expect(mockCriarCanal).toHaveBeenCalledWith(
        "lembretes-vacina",
        expect.objectContaining({ importance: 6 })
      );
      expect(mockAgendar.mock.calls[0][0].trigger.channelId).toBe("lembretes-vacina");
      expect(mockAgendar.mock.calls[1][0].trigger).toEqual({ channelId: "lembretes-vacina" });
    } finally {
      plataforma.restore();
    }
  });
});

describe("notificacaoService — cancelamento e toque", () => {
  it("cancela o lembrete de uma vacina excluída", async () => {
    await notificacaoService.cancelarLembreteVacina("vac-9");

    expect(mockCancelar).toHaveBeenCalledWith("vacina-vac-9");
  });

  it("cancela só os lembretes do pet excluído", async () => {
    mockListarAgendadas.mockResolvedValue([
      { identifier: "vacina-a", content: { data: { tipo: "lembrete-vacina", idPet: "pet-1" } } },
      { identifier: "vacina-b", content: { data: { tipo: "lembrete-vacina", idPet: "pet-2" } } },
      { identifier: "outra", content: { data: null } },
    ]);

    await notificacaoService.cancelarLembretesDoPet("pet-1");

    expect(mockCancelar).toHaveBeenCalledTimes(1);
    expect(mockCancelar).toHaveBeenCalledWith("vacina-a");
  });

  it("lê do toque qual pet abrir, e ignora notificações de outro tipo", () => {
    const toque = (data: unknown) =>
      ({ notification: { request: { content: { data } } } }) as Notifications.NotificationResponse;

    expect(
      notificacaoService.idPetDoToque(toque({ tipo: "lembrete-vacina", idPet: "pet-1" }))
    ).toBe("pet-1");
    expect(notificacaoService.idPetDoToque(toque({ tipo: "outro", idPet: "pet-1" }))).toBeNull();
    expect(notificacaoService.idPetDoToque(toque(null))).toBeNull();
  });
});
