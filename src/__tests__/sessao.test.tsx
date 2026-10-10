import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import { SessaoProvider, useSessao } from "@/context/SessaoContext";
import { buscarUsuarioLogado } from "@/services/autenticacao.service";

// AsyncStorage em memória (mock oficial da biblioteca)
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// A sessão é revalidada no boot com GET /usuario/me (buscarUsuarioLogado)
jest.mock("@/services/autenticacao.service", () => ({
  buscarUsuarioLogado: jest.fn(),
  sair: jest.fn(),
}));

jest.mock("@/api/api", () => ({
  definirTratadorSessaoExpirada: jest.fn(),
}));

const mockBuscarUsuarioLogado = buscarUsuarioLogado as jest.Mock;

const CHAVE_SESSAO = "@afetto:session";

const SESSAO_SALVA = {
  id: "usuario-1",
  email: "ana@afetto.com",
  nome: "Ana",
  progresso: { perfilCompleto: false },
};

function usuarioDaApi(id: string, nome = "Ana") {
  return { id, nome, email: "ana@afetto.com", cpf: "", telefone: "", dataNascimento: "" };
}

let sessaoAtual: ReturnType<typeof useSessao>;

function MostrarSessao() {
  sessaoAtual = useSessao();
  const { sessao, carregando } = sessaoAtual;
  if (carregando) return <Text>carregando</Text>;
  return <Text>{sessao ? `logada: ${sessao.nome}` : "sem sessão"}</Text>;
}

let queryClient: QueryClient;

async function abrirApp() {
  queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <SessaoProvider>
        <MostrarSessao />
      </SessaoProvider>
    </QueryClientProvider>
  );
  await screen.findByText(/logada|sem sessão/);
}

beforeEach(async () => {
  // Só este mock: resetAllMocks apagaria também as funções do mock do AsyncStorage
  mockBuscarUsuarioLogado.mockReset();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(SESSAO_SALVA));
});

describe("SessaoProvider — revalidação no boot do app", () => {
  it("mantém a sessão quando GET /usuario/me confirma o mesmo usuário (e atualiza o nome)", async () => {
    mockBuscarUsuarioLogado.mockResolvedValueOnce(usuarioDaApi("usuario-1", "Ana Paula"));

    await abrirApp();

    expect(screen.getByText("logada: Ana Paula")).toBeTruthy();
    const salva = JSON.parse((await AsyncStorage.getItem(CHAVE_SESSAO)) ?? "{}");
    expect(salva.nome).toBe("Ana Paula");
  });

  it("descarta a sessão quando o cookie não vale mais", async () => {
    mockBuscarUsuarioLogado.mockResolvedValueOnce(null);

    await abrirApp();

    expect(screen.getByText("sem sessão")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_SESSAO)).toBeNull();
  });

  it("descarta a sessão quando o cookie é de outra conta", async () => {
    mockBuscarUsuarioLogado.mockResolvedValueOnce(usuarioDaApi("outro-usuario"));

    await abrirApp();

    expect(screen.getByText("sem sessão")).toBeTruthy();
    expect(await AsyncStorage.getItem(CHAVE_SESSAO)).toBeNull();
  });
});

describe("SessaoProvider — troca de conta", () => {
  it("entrar com outra conta e sair limpam o cache (nada da conta anterior aparece na nova)", async () => {
    mockBuscarUsuarioLogado.mockResolvedValueOnce(usuarioDaApi("usuario-1"));
    await abrirApp();

    // Algo que a conta anterior carregou (ex.: a lista de pets)
    queryClient.setQueryData(["pets"], [{ id: "pet-da-ana" }]);

    await act(() => sessaoAtual.entrar({ id: "usuario-2", email: "bruno@afetto.com", nome: "Bruno" }));
    expect(queryClient.getQueryData(["pets"])).toBeUndefined();

    queryClient.setQueryData(["pets"], [{ id: "pet-do-bruno" }]);
    await act(() => sessaoAtual.sair());
    expect(queryClient.getQueryData(["pets"])).toBeUndefined();
  });
});
