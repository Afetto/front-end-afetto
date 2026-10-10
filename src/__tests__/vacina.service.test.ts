import { api } from "@/api/api";
import { vacinaService } from "@/services/vacina.service";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn() },
}));

const mockGet = api.get as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("vacinaService.listarPorPet", () => {
  it("pede à API só as vacinas do pet e tira o id de cada vacina do link", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        content: [
          {
            nomeVacina: "V10",
            dataAplicacao: "2026-09-01",
            proximaDose: "2027-09-01",
            linkVacina: { rel: "Detalhes da vacina", href: "http://localhost:8080/vacina/vac-1" },
            linkPet: { rel: "Pet", href: "http://localhost:8080/pet/pet-1" },
          },
          {
            nomeVacina: "Antirrábica",
            dataAplicacao: "2026-08-01",
            proximaDose: null,
            linkVacina: { rel: "Detalhes da vacina", href: "http://localhost:8080/vacina/vac-2" },
            linkPet: { rel: "Pet", href: "http://localhost:8080/pet/pet-1" },
          },
        ],
      },
    });

    const vacinas = await vacinaService.listarPorPet("pet-1");

    expect(mockGet).toHaveBeenCalledWith("/vacina", { params: { idPet: "pet-1", page: 0, size: 200 } });
    expect(vacinas).toEqual([
      { id: "vac-1", nomeVacina: "V10", dataAplicacao: "2026-09-01", proximaDose: "2027-09-01", idPet: "pet-1" },
      { id: "vac-2", nomeVacina: "Antirrábica", dataAplicacao: "2026-08-01", proximaDose: undefined, idPet: "pet-1" },
    ]);
  });

  it("pet sem vacinas: lista vazia", async () => {
    mockGet.mockResolvedValueOnce({ data: { content: [] } });

    expect(await vacinaService.listarPorPet("pet-1")).toEqual([]);
  });
});
