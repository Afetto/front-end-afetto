import { api } from "@/api/api";
import { atualizarSenha, atualizarUsuario, autenticar, buscarUsuarioLogado } from "@/services/autenticacao.service";

// Mocka só o boundary HTTP: o service roda de verdade.
jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;

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

  it("senha errada ou conta inexistente que a API devolve como 403 vira 'E-mail ou senha incorretos'", async () => {
    mockPost.mockRejectedValueOnce(erroHttp(403));

    const resultado = await autenticar("ana@afetto.com", "errada");

    expect(resultado).toEqual({ ok: false, motivo: "credenciais_invalidas" });
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("sem conexão com a API, avisa que é rede (não credencial)", async () => {
    mockPost.mockRejectedValueOnce(erroHttp());

    const resultado = await autenticar("ana@afetto.com", "senha123");

    expect(resultado).toEqual({ ok: false, motivo: "rede" });
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

describe("atualizarUsuario", () => {
  it("não manda senha no PUT /usuario/{id} (editar os dados não mexe mais na senha)", async () => {
    mockGet.mockResolvedValueOnce({ data: USUARIO_DA_API });
    mockPut.mockResolvedValueOnce({ data: {} });

    const resultado = await atualizarUsuario("usuario-1", { nome: "Ana Paula" });

    expect(resultado).toEqual({ ok: true, novoEmail: "ana@afetto.com" });
    const [url, corpo] = mockPut.mock.calls[0];
    expect(url).toBe("/usuario/usuario-1");
    expect(corpo).not.toHaveProperty("senha");
    expect(corpo).toMatchObject({ nome: "Ana Paula", cpf: "12345678909", dataNascimento: "1995-05-20" });
  });
});

describe("atualizarSenha", () => {
  it("manda a senha atual e a nova para PUT /usuario/me/senha", async () => {
    mockPut.mockResolvedValueOnce({ data: undefined });

    expect(await atualizarSenha("senha123", "outra456")).toEqual({ ok: true });
    expect(mockPut).toHaveBeenCalledWith("/usuario/me/senha", { senhaAtual: "senha123", novaSenha: "outra456" });
  });

  it("senha atual errada: devolve a mensagem da API", async () => {
    mockPut.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 400, data: { erro: "A senha atual está incorreta" } },
    });

    expect(await atualizarSenha("chute123", "outra456")).toEqual({
      ok: false,
      mensagem: "A senha atual está incorreta",
    });
  });
});
