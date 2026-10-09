import { api } from "@/api/api";
import { perfilCompletoService } from "@/services/perfil-completo.service";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), put: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPut = api.put as jest.Mock;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("perfilCompletoService", () => {
  it("converte o perfil da API para os valores do formulário", async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        perfilCompleto: true,
        tipoMoradia: "APARTAMENTO",
        telaProtecao: true,
        quantidadePets: 3,
        endereco: {
          cep: "01001-000", logradouro: "Praça da Sé", numero: "1", complemento: null,
          bairro: "Sé", cidade: "São Paulo", estado: "SP",
        },
      },
    });

    expect(await perfilCompletoService.buscar()).toEqual({
      perfilCompleto: true,
      tipoMoradia: "apartamento",
      telaProtecao: "sim",
      quantidadePets: 3,
      endereco: {
        cep: "01001-000", logradouro: "Praça da Sé", numero: "1", complemento: undefined,
        bairro: "Sé", cidade: "São Paulo", estado: "SP",
      },
    });
    expect(mockGet).toHaveBeenCalledWith("/usuario/me/perfil");
  });

  it("perfil ainda não finalizado: sem moradia, tela nem endereço", async () => {
    mockGet.mockResolvedValueOnce({
      data: { perfilCompleto: false, tipoMoradia: null, telaProtecao: null, quantidadePets: 1, endereco: null },
    });

    expect(await perfilCompletoService.buscar()).toEqual({
      perfilCompleto: false,
      tipoMoradia: undefined,
      telaProtecao: undefined,
      quantidadePets: 1,
      endereco: undefined,
    });
  });

  it("erro de validação da API (400 com mensagem por campo): devolve a mensagem do campo", async () => {
    mockPut.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { "endereco.estado": "Informe a UF com 2 letras" } },
    });

    const resultado = await perfilCompletoService.salvar({
      tipoMoradia: "apartamento",
      telaProtecao: "sim",
      quantidadePets: 1,
      endereco: { cep: "01001-000", logradouro: "Praça da Sé", numero: "1", bairro: "Sé", cidade: "São Paulo", estado: "S" },
    });

    expect(resultado).toEqual({ ok: false, mensagem: "Informe a UF com 2 letras" });
  });
});
