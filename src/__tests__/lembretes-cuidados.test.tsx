import { QueryClientProvider } from "@tanstack/react-query";
import { criarClienteDeTeste } from "@/testes/clienteDeTeste";
import { renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import { useAgendarConsulta } from "@/hooks/useClinicas";
import { useCancelarConsulta, useCriarConsulta } from "@/hooks/useConsultas";
import { useAtualizarRemedio, useCriarRemedio, useDeletarRemedio } from "@/hooks/useRemedios";
import { notificacaoService } from "@/services/notificacao.service";

// Salvar, editar, cancelar ou excluir remédio e consulta é o evento que agenda,
// reagenda ou cancela o lembrete. HTTP e notificação ficam mockados.
jest.mock("@/api/api", () => ({
  api: { post: jest.fn(), put: jest.fn(), patch: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/services/notificacao.service", () => ({
  notificacaoService: {
    agendarLembreteRemedio: jest.fn(),
    cancelarLembreteRemedio: jest.fn(),
    agendarLembreteConsulta: jest.fn(),
    cancelarLembreteConsulta: jest.fn(),
  },
}));

const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;
const mockPatch = api.patch as jest.Mock;
const mockDelete = api.delete as jest.Mock;
const mocks = notificacaoService as jest.Mocked<typeof notificacaoService>;

const REMEDIO = { nomeRemedio: "Amoxicilina", dataInicio: "2026-11-02", idPet: "pet-1" };
const CONSULTA = {
  tipoEvento: "CONSULTA" as const,
  descricao: "",
  data: "2026-11-05",
  hora: "15:00",
  idPet: "pet-1",
};

function criarWrapper() {
  const queryClient = criarClienteDeTeste();
  queryClient.setQueryData(["pets", "pet-1"], { id: "pet-1", nome: "Jordan", especie: "CACHORRO" });
  return function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  jest.resetAllMocks();
  mocks.agendarLembreteRemedio.mockResolvedValue(null);
  mocks.cancelarLembreteRemedio.mockResolvedValue(undefined);
  mocks.agendarLembreteConsulta.mockResolvedValue(null);
  mocks.cancelarLembreteConsulta.mockResolvedValue(undefined);
});

describe("lembretes de remédio", () => {
  it("criar um remédio agenda o lembrete do início, com o id da API e o nome do pet", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "rem-1", ...REMEDIO } });
    const { result } = renderHook(() => useCriarRemedio("pet-1"), { wrapper: criarWrapper() });

    result.current.mutate(REMEDIO);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.agendarLembreteRemedio).toHaveBeenCalledWith({
      idRemedio: "rem-1",
      idPet: "pet-1",
      nomePet: "Jordan",
      nomeRemedio: "Amoxicilina",
      dataInicio: "2026-11-02",
    });
  });

  it("editar reagenda com a data nova e excluir cancela", async () => {
    mockPut.mockResolvedValueOnce({ data: { id: "rem-1", ...REMEDIO } });
    mockDelete.mockResolvedValueOnce({});
    const wrapper = criarWrapper();
    const editar = renderHook(() => useAtualizarRemedio("pet-1"), { wrapper });
    const excluir = renderHook(() => useDeletarRemedio("pet-1"), { wrapper });

    editar.result.current.mutate({ id: "rem-1", dados: { ...REMEDIO, dataInicio: "2026-11-10" } });
    await waitFor(() => expect(editar.result.current.isSuccess).toBe(true));
    expect(mocks.agendarLembreteRemedio).toHaveBeenCalledWith(
      expect.objectContaining({ idRemedio: "rem-1", dataInicio: "2026-11-10" })
    );

    excluir.result.current.mutate("rem-1");
    await waitFor(() => expect(excluir.result.current.isSuccess).toBe(true));
    expect(mocks.cancelarLembreteRemedio).toHaveBeenCalledWith("rem-1");
  });
});

describe("lembretes de consulta", () => {
  it("registrar uma consulta agenda o lembrete; sem motivo, o nome é o tipo", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "con-1", ...CONSULTA, status: "AGENDADO" } });
    const { result } = renderHook(() => useCriarConsulta("pet-1"), { wrapper: criarWrapper() });

    result.current.mutate(CONSULTA);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.agendarLembreteConsulta).toHaveBeenCalledWith({
      idConsulta: "con-1",
      idPet: "pet-1",
      nomePet: "Jordan",
      descricao: "Consulta",
      data: "2026-11-05",
      hora: "15:00",
    });
  });

  it("cancelar a consulta cancela o lembrete", async () => {
    mockPatch.mockResolvedValueOnce({ data: { id: "con-1", ...CONSULTA, status: "CANCELADO" } });
    const { result } = renderHook(() => useCancelarConsulta("pet-1"), { wrapper: criarWrapper() });

    result.current.mutate("con-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.cancelarLembreteConsulta).toHaveBeenCalledWith("con-1");
  });

  it("agendar numa clínica parceira também agenda o lembrete", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "con-2", idPet: "pet-1" } });
    const { result } = renderHook(() => useAgendarConsulta("cli-1"), { wrapper: criarWrapper() });

    result.current.mutate({ idPet: "pet-1", data: "2026-11-06", hora: "10:30", descricao: "Vacinação" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.agendarLembreteConsulta).toHaveBeenCalledWith({
      idConsulta: "con-2",
      idPet: "pet-1",
      nomePet: "Jordan",
      descricao: "Vacinação",
      data: "2026-11-06",
      hora: "10:30",
    });
  });
});
