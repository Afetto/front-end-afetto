import { consultaService } from "@/services/consulta.service";
import { petService } from "@/services/pet.service";
import { remedioService } from "@/services/remedio.service";
import { vacinaService } from "@/services/vacina.service";

// Conversões formulário ⇄ API (nos services): no formulário as datas são
// DD/MM/AAAA; na API, YYYY-MM-DD. Campo vazio não vai no corpo.
jest.mock("@/api/api", () => ({ api: {} }));

describe("vacinaService — formulário ⇄ API", () => {
  it("vacina salva vira formulário com datas DD/MM/AAAA e opcionais vazios", () => {
    expect(
      vacinaService.paraFormulario({ id: "v1", idPet: "p1", nomeVacina: "V10", dataAplicacao: "2026-09-01" })
    ).toEqual({
      nomeVacina: "V10", dataAplicacao: "01/09/2026", proximaDose: "", fabricante: "", lote: "", observacoes: "",
    });
  });

  it("formulário vira corpo com datas ISO; texto só com espaços não vai", () => {
    expect(
      vacinaService.doFormulario(
        { nomeVacina: "V10", dataAplicacao: "01/09/2026", proximaDose: "01/09/2027", fabricante: "  ", lote: "L1", observacoes: "" },
        "p1"
      )
    ).toEqual({
      nomeVacina: "V10", dataAplicacao: "2026-09-01", proximaDose: "2027-09-01",
      fabricante: undefined, lote: "L1", observacoes: undefined, idPet: "p1",
    });
  });
});

describe("remedioService — formulário ⇄ API", () => {
  it("ida e volta mantêm as datas", () => {
    const form = remedioService.paraFormulario({
      id: "r1", idPet: "p1", nomeRemedio: "Amoxicilina", dataInicio: "2026-10-08", dataFim: "2026-10-15",
    });
    expect(form).toMatchObject({ dataInicio: "08/10/2026", dataFim: "15/10/2026", dosagem: "" });

    expect(remedioService.doFormulario(form, "p1")).toEqual({
      nomeRemedio: "Amoxicilina", dosagem: undefined, frequencia: undefined,
      dataInicio: "2026-10-08", dataFim: "2026-10-15", observacoes: undefined, idPet: "p1",
    });
  });

  it("sem data de fim (uso contínuo), o fim não vai", () => {
    const dados = remedioService.doFormulario(
      { nomeRemedio: "Ômega 3", dosagem: "", frequencia: "", dataInicio: "01/09/2026", dataFim: "", observacoes: "" },
      "p1"
    );
    expect(dados.dataFim).toBeUndefined();
  });
});

describe("consultaService — formulário ⇄ API", () => {
  it("ida e volta mantêm data, hora e tipo", () => {
    const form = consultaService.paraFormulario({
      id: "c1", idPet: "p1", tipoEvento: "EXAME", descricao: "Hemograma", data: "2026-10-15", hora: "09:30",
      status: "AGENDADO",
    });
    expect(form).toEqual({
      tipoEvento: "EXAME", descricao: "Hemograma", data: "15/10/2026", hora: "09:30", nomeVeterinario: "", observacoes: "",
    });

    expect(consultaService.doFormulario(form, "p1")).toEqual({
      tipoEvento: "EXAME", descricao: "Hemograma", data: "2026-10-15", hora: "09:30",
      nomeVeterinario: undefined, observacoes: undefined, idPet: "p1",
    });
  });
});

describe("petService — formulário ⇄ API (cadastrar e editar pet)", () => {
  it("formulário vira corpo com data ISO, peso com ponto e o dono", () => {
    expect(
      petService.doFormulario(
        { nome: "Thor", especie: "CACHORRO", sexo: "MACHO", raca: " Vira-lata ", peso: "12,5", dataNasc: "10/03/2022", descricao: "" },
        "usuario-1"
      )
    ).toEqual({
      nome: "Thor", especie: "CACHORRO", sexo: "MACHO", raca: "Vira-lata", peso: 12.5,
      dataNasc: "2022-03-10", descricao: "", idUsuario: "usuario-1",
    });
  });

  it("pet salvo vira formulário com peso em texto e data DD/MM/AAAA", () => {
    expect(
      petService.paraFormulario({
        id: "pet-1", nome: "Thor", especie: "CACHORRO", sexo: "MACHO", peso: 12.5, dataNasc: "2022-03-10",
      } as Parameters<typeof petService.paraFormulario>[0])
    ).toEqual({
      nome: "Thor", especie: "CACHORRO", sexo: "MACHO", raca: "", peso: "12.5", dataNasc: "10/03/2022", descricao: "",
    });
  });
});
