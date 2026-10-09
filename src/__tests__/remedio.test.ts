import { Remedio } from "@/schemas/remedio.schema";
import { Vacina } from "@/schemas/vacina.schema";
import { proximosCuidados } from "@/utils/cuidados";
import { montarHistorico } from "@/utils/historico";
import { descreverDose, descreverPeriodo, situacaoRemedio } from "@/utils/remedio";

// "Hoje" fixo: 09/10/2026, no meio do dia (fuso do jest.config: São Paulo)
const AGORA = new Date(2026, 9, 9, 15, 0);

function remedio(dados: Partial<Remedio> & { id: string; dataInicio: string }): Remedio {
  return { idPet: "pet-1", nomeRemedio: `Remédio ${dados.id}`, ...dados };
}

function vacina(dados: Partial<Vacina> & { id: string; dataAplicacao: string }): Vacina {
  return { idPet: "pet-1", nomeVacina: `Vacina ${dados.id}`, ...dados };
}

describe("situacaoRemedio", () => {
  it("em uso entre o início e o fim, incluindo os dois dias", () => {
    expect(situacaoRemedio({ dataInicio: "2026-10-09", dataFim: "2026-10-09" }, AGORA)).toBe("em_uso");
    expect(situacaoRemedio({ dataInicio: "2026-10-01", dataFim: "2026-10-15" }, AGORA)).toBe("em_uso");
  });

  it("sem data de fim, continua em uso", () => {
    expect(situacaoRemedio({ dataInicio: "2026-01-01" }, AGORA)).toBe("em_uso");
  });

  it("começa amanhã: futuro; terminou ontem: terminado", () => {
    expect(situacaoRemedio({ dataInicio: "2026-10-10" }, AGORA)).toBe("futuro");
    expect(situacaoRemedio({ dataInicio: "2026-10-01", dataFim: "2026-10-08" }, AGORA)).toBe("terminado");
  });
});

describe("textos do remédio", () => {
  it("período com e sem data de fim", () => {
    expect(descreverPeriodo({ dataInicio: "2026-10-08", dataFim: "2026-10-15" })).toBe(
      "De 08/10/2026 até 15/10/2026"
    );
    expect(descreverPeriodo({ dataInicio: "2026-10-08" })).toBe("Desde 08/10/2026, sem data de fim");
  });

  it("dose mostra só o que foi preenchido", () => {
    expect(descreverDose({ dosagem: "1 comprimido", frequencia: "A cada 12 horas" })).toBe(
      "1 comprimido · A cada 12 horas"
    );
    expect(descreverDose({ frequencia: "1 vez ao dia" })).toBe("1 vez ao dia");
    expect(descreverDose({})).toBe("");
  });
});

describe("montarHistorico", () => {
  it("remédios em uso primeiro, depois o futuro (mais próximo antes) e por fim o passado (mais recente antes)", () => {
    const eventos = montarHistorico(
      [
        vacina({ id: "v-passada-antiga", dataAplicacao: "2025-01-10" }),
        vacina({ id: "v-futura-longe", dataAplicacao: "2026-12-01" }),
        vacina({ id: "v-passada-recente", dataAplicacao: "2026-09-01" }),
      ],
      [
        remedio({ id: "r-em-uso", dataInicio: "2026-10-05", dataFim: "2026-10-20" }),
        remedio({ id: "r-futuro-perto", dataInicio: "2026-10-12" }),
        remedio({ id: "r-terminado", dataInicio: "2026-08-01", dataFim: "2026-08-10" }),
      ],
      [],
      AGORA
    );

    expect(eventos.map((evento) => evento.chave)).toEqual([
      "remedio-r-em-uso",
      "remedio-r-futuro-perto",
      "vacina-v-futura-longe",
      "vacina-v-passada-recente",
      "remedio-r-terminado",
      "vacina-v-passada-antiga",
    ]);
    expect(eventos[0].descricao).toBe("De 05/10/2026 até 20/10/2026 · em uso");
  });
});

describe("proximosCuidados", () => {
  it("junta remédios em uso, remédios que vão começar e vacinas agendadas, no máximo 3", () => {
    const cuidados = proximosCuidados(
      [
        vacina({ id: "v10", nomeVacina: "V10", dataAplicacao: "2026-10-19" }),
        vacina({ id: "raiva", nomeVacina: "Antirrábica", dataAplicacao: "2027-03-01" }),
        vacina({ id: "aplicada", dataAplicacao: "2026-09-01" }),
      ],
      [
        remedio({ id: "amox", nomeRemedio: "Amoxicilina", dataInicio: "2026-10-08", dataFim: "2026-10-15" }),
        remedio({ id: "vermifugo", nomeRemedio: "Vermífugo", dataInicio: "2026-10-12" }),
        remedio({ id: "antigo", dataInicio: "2026-08-01", dataFim: "2026-08-10" }),
      ],
      [],
      3,
      AGORA
    );

    expect(cuidados).toEqual([
      expect.objectContaining({ titulo: "Amoxicilina", selo: "EM USO", subtitulo: "Em uso até 15/10/2026.", dias: 0 }),
      expect.objectContaining({ titulo: "Vermífugo", selo: "REMÉDIO", subtitulo: "Começa daqui 3 dias.", dias: 3 }),
      expect.objectContaining({ titulo: "V10", selo: "URGENTE", subtitulo: "Daqui 10 dias.", dias: 10 }),
    ]);
  });
});
