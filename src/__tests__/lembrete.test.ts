import { calcularLembreteVacina, proximaDataDoCuidado } from "@/utils/lembrete";

// "Agora" fixo: quarta, 07/10/2026, 20h.
const AGORA_NOITE = new Date(2026, 9, 7, 20, 0);

function diaEHora(data: Date | null | undefined) {
  if (!data) return data;
  return {
    dia: data.getDate(),
    mes: data.getMonth() + 1,
    hora: data.getHours(),
    minuto: data.getMinutes(),
  };
}

describe("proximaDataDoCuidado", () => {
  it("usa a próxima dose quando a aplicação já aconteceu", () => {
    const data = proximaDataDoCuidado(
      { dataAplicacao: "2026-09-01", proximaDose: "2026-10-20" },
      AGORA_NOITE
    );

    expect(diaEHora(data)).toMatchObject({ dia: 20, mes: 10 });
  });

  it("usa a aplicação quando ela está agendada para o futuro", () => {
    const data = proximaDataDoCuidado({ dataAplicacao: "2026-10-15" }, AGORA_NOITE);

    expect(diaEHora(data)).toMatchObject({ dia: 15, mes: 10 });
  });

  it("escolhe a data mais próxima quando as duas são futuras", () => {
    const data = proximaDataDoCuidado(
      { dataAplicacao: "2026-10-15", proximaDose: "2026-11-15" },
      AGORA_NOITE
    );

    expect(diaEHora(data)).toMatchObject({ dia: 15, mes: 10 });
  });

  it("ignora aplicação registrada com a data de hoje", () => {
    expect(proximaDataDoCuidado({ dataAplicacao: "2026-10-07" }, AGORA_NOITE)).toBeNull();
  });

  it("não devolve nada quando todas as datas já passaram", () => {
    expect(
      proximaDataDoCuidado(
        { dataAplicacao: "2026-01-10", proximaDose: "2026-02-10" },
        AGORA_NOITE
      )
    ).toBeNull();
  });
});

describe("calcularLembreteVacina", () => {
  it("lembra na véspera às 9h quando o cuidado é daqui a alguns dias", () => {
    const lembrete = calcularLembreteVacina(
      { dataAplicacao: "2026-09-01", proximaDose: "2026-10-12" },
      AGORA_NOITE
    );

    expect(lembrete?.quando).toBe("amanha");
    expect(diaEHora(lembrete?.momento)).toEqual({ dia: 11, mes: 10, hora: 9, minuto: 0 });
  });

  it("lembra no próprio dia às 9h quando a véspera às 9h já passou", () => {
    const lembrete = calcularLembreteVacina(
      { dataAplicacao: "2026-09-01", proximaDose: "2026-10-08" },
      AGORA_NOITE
    );

    expect(lembrete?.quando).toBe("hoje");
    expect(diaEHora(lembrete?.momento)).toEqual({ dia: 8, mes: 10, hora: 9, minuto: 0 });
  });

  it("lembra na hora quando a próxima dose é hoje e as 9h já passaram", () => {
    const lembrete = calcularLembreteVacina(
      { dataAplicacao: "2026-09-01", proximaDose: "2026-10-07" },
      AGORA_NOITE
    );

    expect(lembrete).toMatchObject({ quando: "hoje", momento: null });
  });

  it("agenda para as 9h de hoje quando a próxima dose é hoje e ainda é cedo", () => {
    const cedo = new Date(2026, 9, 7, 7, 30);
    const lembrete = calcularLembreteVacina(
      { dataAplicacao: "2026-09-01", proximaDose: "2026-10-07" },
      cedo
    );

    expect(lembrete?.quando).toBe("hoje");
    expect(diaEHora(lembrete?.momento)).toEqual({ dia: 7, mes: 10, hora: 9, minuto: 0 });
  });

  it("não cria lembrete para vacina sem data futura", () => {
    expect(calcularLembreteVacina({ dataAplicacao: "2026-10-07" }, AGORA_NOITE)).toBeNull();
    expect(calcularLembreteVacina({ dataAplicacao: "2026-03-01" }, AGORA_NOITE)).toBeNull();
  });

  it("não cria lembrete para data inválida", () => {
    expect(
      calcularLembreteVacina({ dataAplicacao: "sem data", proximaDose: "??" }, AGORA_NOITE)
    ).toBeNull();
  });
});
