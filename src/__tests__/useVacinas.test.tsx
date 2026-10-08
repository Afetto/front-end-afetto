import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import {
  useAtualizarVacina,
  useCriarVacina,
  useDeletarVacina,
} from "@/hooks/useVacinas";
import { notificacaoService } from "@/services/notificacao.service";

// Mocka as duas bordas: HTTP e notificação. O que se testa é a ligação entre
// elas — salvar/editar/excluir uma vacina é o evento que agenda, reagenda ou
// cancela o lembrete.
jest.mock("@/api/api", () => ({
  api: { post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/services/notificacao.service", () => ({
  notificacaoService: {
    agendarLembreteVacina: jest.fn(),
    cancelarLembreteVacina: jest.fn(),
  },
}));

const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;
const mockDelete = api.delete as jest.Mock;
const mockAgendar = notificacaoService.agendarLembreteVacina as jest.Mock;
const mockCancelar = notificacaoService.cancelarLembreteVacina as jest.Mock;

const DADOS = {
  nomeVacina: "V10",
  dataAplicacao: "2026-09-01",
  proximaDose: "2026-10-12",
  idPet: "pet-1",
};

function criarWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // O pet já foi carregado pela tela anterior: o nome vem do cache.
  queryClient.setQueryData(["pets", "pet-1"], {
    id: "pet-1",
    nome: "Jordan",
    especie: "CACHORRO",
  });

  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  mockAgendar.mockResolvedValue(null);
  mockCancelar.mockResolvedValue(undefined);
});

describe("hooks de vacina — lembretes", () => {
  it("criar uma vacina agenda o lembrete com o id devolvido pela API e o nome do pet", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "vac-1", ...DADOS } });

    const { result } = renderHook(() => useCriarVacina("pet-1"), { wrapper: criarWrapper() });
    result.current.mutate(DADOS);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAgendar).toHaveBeenCalledWith({
      idVacina: "vac-1",
      idPet: "pet-1",
      nomeVacina: "V10",
      nomePet: "Jordan",
      dataAplicacao: "2026-09-01",
      proximaDose: "2026-10-12",
    });
  });

  it("editar uma vacina reagenda o lembrete com as datas novas", async () => {
    mockPut.mockResolvedValueOnce({ data: { id: "vac-1", ...DADOS } });

    const { result } = renderHook(() => useAtualizarVacina("pet-1"), {
      wrapper: criarWrapper(),
    });
    result.current.mutate({ id: "vac-1", data: { ...DADOS, proximaDose: "2026-11-20" } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockAgendar).toHaveBeenCalledWith(
      expect.objectContaining({ idVacina: "vac-1", proximaDose: "2026-11-20" })
    );
  });

  it("excluir uma vacina cancela o lembrete dela", async () => {
    mockDelete.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDeletarVacina("pet-1"), {
      wrapper: criarWrapper(),
    });
    result.current.mutate("vac-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockCancelar).toHaveBeenCalledWith("vac-1");
  });

  it("não agenda nada quando a API recusa a vacina", async () => {
    mockPost.mockRejectedValueOnce(new Error("400"));

    const { result } = renderHook(() => useCriarVacina("pet-1"), { wrapper: criarWrapper() });
    result.current.mutate(DADOS);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(mockAgendar).not.toHaveBeenCalled();
  });

  it("uma falha ao agendar não transforma o salvamento em erro", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "vac-1", ...DADOS } });
    mockAgendar.mockRejectedValueOnce(new Error("sem permissão"));

    const { result } = renderHook(() => useCriarVacina("pet-1"), { wrapper: criarWrapper() });
    result.current.mutate(DADOS);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);
  });
});
