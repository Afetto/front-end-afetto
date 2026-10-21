import { Consulta } from "@/schemas/consulta.schema";
import { Remedio } from "@/schemas/remedio.schema";
import { Vacina } from "@/schemas/vacina.schema";
import { DadosDoPet, responder, situacaoDasVacinas } from "@/utils/assistente";

// "Agora": 21/10/2026, 10h, no fuso do aparelho
const AGORA = new Date(2026, 9, 21, 10, 0);

function vacina(nomeVacina: string, dataAplicacao: string, proximaDose?: string): Vacina {
  return { id: `${nomeVacina}-${dataAplicacao}`, idPet: "pet-1", nomeVacina, dataAplicacao, proximaDose };
}

function remedio(nomeRemedio: string, dataInicio: string, dataFim?: string): Remedio {
  return {
    id: nomeRemedio, idPet: "pet-1", nomeRemedio, dataInicio, dataFim,
    dosagem: "1 comprimido", frequencia: "A cada 12 horas",
  };
}

function consulta(dados: Partial<Consulta> & Pick<Consulta, "data" | "status">): Consulta {
  return { id: dados.data, idPet: "pet-1", tipoEvento: "CONSULTA", descricao: "", ...dados };
}

function dados(parcial: Partial<DadosDoPet> = {}): DadosDoPet {
  return { nomePet: "Thor", vacinas: [], remedios: [], consultas: [], ...parcial };
}

describe("Assistente — Quando é a próxima vacina?", () => {
  it("pega a data mais próxima entre aplicação agendada e próxima dose, e lista as seguintes", () => {
    const resposta = responder("proxima_vacina", dados({
      vacinas: [
        vacina("V10", "2026-01-10", "2027-01-10"),
        vacina("Antirrábica", "2025-11-05", "2026-11-05"),
        vacina("Giárdia", "2026-12-01"),
        vacina("Gripe", "2025-01-01", "2025-06-01"), // já passou: não conta
      ],
    }), AGORA);

    expect(resposta.texto).toBe("A próxima vacina de Thor é Antirrábica (próxima dose), em 05/11/2026.");
    expect(resposta.detalhes).toEqual([
      "Depois: Giárdia (aplicação agendada), em 01/12/2026",
      "Depois: V10 (próxima dose), em 10/01/2027",
    ]);
    expect(resposta.acao).toEqual({ rotulo: "Ver vacinas no histórico", destino: "historico" });
  });

  it("diz 'amanhã' e 'hoje' em vez da data", () => {
    expect(responder("proxima_vacina", dados({ vacinas: [vacina("V10", "2026-10-22")] }), AGORA).texto)
      .toBe("A próxima vacina de Thor é V10 (aplicação agendada), amanhã.");
    expect(responder("proxima_vacina", dados({ vacinas: [vacina("V10", "2025-10-21", "2026-10-21")] }), AGORA).texto)
      .toBe("A próxima vacina de Thor é V10 (próxima dose), hoje.");
  });

  it("sem vacina nenhuma ou sem nada marcado, oferece registrar", () => {
    const semNenhuma = responder("proxima_vacina", dados(), AGORA);
    expect(semNenhuma.texto).toBe("Ainda não há vacinas registradas para Thor.");
    expect(semNenhuma.acao.destino).toBe("nova_vacina");

    expect(responder("proxima_vacina", dados({ vacinas: [vacina("V10", "2026-01-10")] }), AGORA).texto)
      .toBe("Thor não tem nenhuma vacina marcada daqui para a frente.");
  });
});

describe("Assistente — Tem remédio para dar hoje?", () => {
  it("lista os remédios em uso com dose e até quando", () => {
    const resposta = responder("remedios_hoje", dados({
      remedios: [
        remedio("Amoxicilina", "2026-10-15", "2026-10-25"),
        remedio("Ômega 3", "2026-09-01"),
        remedio("Antipulgas", "2026-08-01", "2026-08-10"), // terminou
      ],
    }), AGORA);

    expect(resposta.texto).toBe("Sim: hoje Thor toma 2 remédios.");
    expect(resposta.detalhes).toEqual([
      "Amoxicilina — 1 comprimido · A cada 12 horas (até 25/10/2026)",
      "Ômega 3 — 1 comprimido · A cada 12 horas (sem data de fim)",
    ]);
    expect(resposta.acao.destino).toBe("historico");
  });

  it("sem remédio hoje, avisa do próximo que vai começar", () => {
    const resposta = responder("remedios_hoje", dados({ remedios: [remedio("Vermífugo", "2026-11-02", "2026-11-03")] }), AGORA);

    expect(resposta.texto).toBe("Hoje Thor não toma remédio. O próximo, Vermífugo, começa em 02/11/2026.");
    expect(resposta.acao).toEqual({ rotulo: "Adicionar remédio", destino: "novo_remedio" });
  });

  it("sem remédio nenhum", () => {
    expect(responder("remedios_hoje", dados(), AGORA).texto).toBe("Hoje Thor não toma nenhum remédio.");
  });
});

describe("Assistente — Qual a próxima consulta?", () => {
  it("a agendada mais próxima (data e hora), com motivo e clínica; ignora canceladas e passadas", () => {
    const resposta = responder("proxima_consulta", dados({
      consultas: [
        consulta({ data: "2026-11-10", hora: "09:00", status: "AGENDADO", descricao: "Retorno" }),
        consulta({ data: "2026-10-28", hora: "15:00", status: "AGENDADO", descricao: "Check-up", nomeClinica: "Clínica Bigode e Rabo" }),
        consulta({ data: "2026-10-28", hora: "14:00", status: "CANCELADO", descricao: "Cancelada" }),
        consulta({ data: "2026-10-01", hora: "10:00", status: "AGENDADO", descricao: "Passada" }),
      ],
    }), AGORA);

    expect(resposta.texto).toBe("A próxima consulta de Thor é Check-up, em 28/10/2026 às 15:00, na Clínica Bigode e Rabo.");
    expect(resposta.acao.destino).toBe("historico");
  });

  it("sem motivo, usa o tipo da consulta", () => {
    const resposta = responder("proxima_consulta", dados({
      consultas: [consulta({ data: "2026-10-22", status: "AGENDADO", tipoEvento: "EXAME" })],
    }), AGORA);

    expect(resposta.texto).toBe("A próxima consulta de Thor é Exame, amanhã.");
  });

  it("sem consulta agendada, oferece agendar", () => {
    const resposta = responder("proxima_consulta", dados(), AGORA);

    expect(resposta.texto).toBe("Thor não tem nenhuma consulta agendada.");
    expect(resposta.acao).toEqual({ rotulo: "Agendar consulta", destino: "agendar" });
  });
});

describe("Assistente — A vacinação está em dia?", () => {
  it("vale o registro mais recente de cada vacina: dose antiga vencida não conta se já foi renovada", () => {
    const situacoes = situacaoDasVacinas([
      vacina("V10", "2025-01-10", "2026-01-10"),
      vacina("v10 ", "2026-01-12", "2027-01-12"),
    ], AGORA);

    expect(situacoes).toEqual([{ tipo: "em_dia", nome: "v10 " }]);
  });

  it("atrasada: avisa e oferece agendar consulta", () => {
    const resposta = responder("vacinacao", dados({
      vacinas: [
        vacina("Antirrábica", "2025-09-01", "2026-09-01"),
        vacina("V10", "2026-01-10", "2026-11-05"),
      ],
    }), AGORA);

    expect(resposta.texto).toBe("Atenção: Thor tem 1 vacina atrasada.");
    expect(resposta.detalhes).toEqual([
      "Antirrábica: atrasada desde 01/09/2026",
      "V10: vence em 05/11/2026",
    ]);
    expect(resposta.acao).toEqual({ rotulo: "Agendar consulta", destino: "agendar" });
  });

  it("vencendo em até 30 dias: em dia, com aviso", () => {
    const resposta = responder("vacinacao", dados({ vacinas: [vacina("V10", "2026-01-10", "2026-11-05")] }), AGORA);

    expect(resposta.texto).toBe("Está em dia, mas 1 vacina vence nos próximos 30 dias.");
  });

  it("tudo em dia (aplicação agendada aparece nos detalhes)", () => {
    const resposta = responder("vacinacao", dados({
      vacinas: [vacina("V10", "2026-01-10", "2027-01-10"), vacina("Giárdia", "2026-12-01")],
    }), AGORA);

    expect(resposta.texto).toBe("Sim! A vacinação de Thor está em dia.");
    expect(resposta.detalhes).toEqual(["Giárdia: aplicação agendada para 01/12/2026"]);
  });

  it("em dia sem detalhes: diz quantas vacinas há", () => {
    expect(responder("vacinacao", dados({ vacinas: [vacina("V10", "2026-01-10", "2027-01-10")] }), AGORA).detalhes)
      .toEqual(["1 vacina registrada, nenhuma vencida."]);
  });

  it("sem vacinas, não diz que está em dia", () => {
    const resposta = responder("vacinacao", dados(), AGORA);

    expect(resposta.texto).toBe("Ainda não há vacinas registradas para Thor, então não dá para dizer se está em dia.");
    expect(resposta.acao.destino).toBe("nova_vacina");
  });
});
