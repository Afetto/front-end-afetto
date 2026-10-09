import { api } from "@/api/api";
import { autenticar, buscarUsuarioLogado } from "@/services/autenticacao.service";

// Mocka só o boundary HTTP: o service roda de verdade.
jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;

const USUARIO_DA_API = {
  id: "usuario-1",
  nome: "Ana",
  email: "ana@afetto.com",
  cpf: "12345678909",
  telefone: "11999999999",
  dataNascimento: "1995-05-20",
};

// Erro do axios: com status = a API respondeu; sem status = sem conexão
function erroHttp(status?: number) {
  return status
    ? { isAxiosError: true, response: { status } }
    : { isAxiosError: true, code: "ERR_NETWORK" };
}

beforeEach(() => {
  jest.resetAllMocks();
});

describe("autenticar", () => {
  it("depois do login, descobre quem entrou em GET /usuario/me (sem varrer a lista de usuários)", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    mockGet.mockResolvedValueOnce({ data: USUARIO_DA_API });

    const resultado = await autenticar("  Ana@Afetto.com ", "senha123");

    expect(mockPost).toHaveBeenCalledWith("/login", { email: "ana@afetto.com", senha: "senha123" });
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith("/usuario/me");
    expect(resultado).toEqual({ ok: true, usuario: USUARIO_DA_API });
  });

  it("senha errada não chega a chamar GET /usuario/me", async () => {
    mockPost.mockRejectedValueOnce(erroHttp(401));

    const resultado = await autenticar("ana@afetto.com", "errada");

    expect(resultado).toEqual({ ok: false, motivo: "credenciais_invalidas" });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("se GET /usuario/me falhar, não entra com uma sessão sem id", async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    mockGet.mockRejectedValueOnce(erroHttp());

    const resultado = await autenticar("ana@afetto.com", "senha123");

    expect(resultado).toEqual({ ok: false, motivo: "rede" });
  });
});

describe("buscarUsuarioLogado", () => {
  it("devolve o usuário da sessão", async () => {
    mockGet.mockResolvedValueOnce({ data: USUARIO_DA_API });

    expect(await buscarUsuarioLogado()).toEqual(USUARIO_DA_API);
    expect(mockGet).toHaveBeenCalledWith("/usuario/me");
  });

  it("devolve null quando a sessão não vale mais", async () => {
    mockGet.mockRejectedValueOnce(erroHttp(403));

    expect(await buscarUsuarioLogado()).toBeNull();
  });
});
