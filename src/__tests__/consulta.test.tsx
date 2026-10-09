import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaConsulta from "@/app/(app)/pet/[id]/consulta";
import { Consulta } from "@/schemas/consulta.schema";
import { proximosCuidados } from "@/utils/cuidados";
import { montarHistorico } from "@/utils/historico";
import { mascararHora } from "@/utils/mascaras";
import { router } from "expo-router";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
}));

let mockParametros: { id: string; consultaId?: string } = { id: "pet-1" };

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => mockParametros,
}));

const mockGet = api.get as jest.Mock;
const mockPost = api.post as jest.Mock;
const mockPut = api.put as jest.Mock;

const AGORA = new Date(2026, 9, 9, 15, 0);

function consulta(dados: Partial<Consulta> & { id: string; data: string }): Consulta {
  return { idPet: "pet-1", tipoEvento: "CONSULTA", descricao: `Consulta ${dados.id}`, status: "AGENDADO", ...dados };
}

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParametros = { id: "pet-1" };
});

describe("TelaConsulta — registrar e editar consulta (HTTP mockado)", () => {
  it("registra com tipo, data em ISO e hora, e volta para o histórico", async () => {
    mockPost.mockResolvedValueOnce({ data: { id: "con-1", idPet: "pet-1", data: "2026-10-15" } });

    render(<TelaConsulta />, { wrapper });
    fireEvent.press(screen.getByText("Exame"));
    fireEvent.changeText(screen.getByPlaceholderText("Check-up anual, vacina, retorno..."), "Hemograma");
    fireEvent.changeText(screen.getByPlaceholderText("DD/MM/AAAA"), "15102026");
    fireEvent.changeText(screen.getByPlaceholderText("HH:MM"), "0930");
    fireEvent.changeText(screen.getByPlaceholderText("Dra. Ana"), "Dra. Ana");
    fireEvent.press(screen.getByText("Salvar"));

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/pet/pet-1/historico"));
    expect(mockPost).toHaveBeenCalledWith("/consulta", {
      tipoEvento: "EXAME",
      descricao: "Hemograma",
      data: "2026-10-15",
      hora: "09:30",
      nomeVeterinario: "Dra. Ana",
      observacoes: undefined,
      idPet: "pet-1",
    });
  });

  it("não deixa salvar com hora inválida", async () => {
    render(<TelaConsulta />, { wrapper });
    fireEvent.changeText(screen.getByPlaceholderText("Check-up anual, vacina, retorno..."), "Check-up");
    fireEvent.changeText(screen.getByPlaceholderText("DD/MM/AAAA"), "15102026");
    fireEvent.changeText(screen.getByPlaceholderText("HH:MM"), "2575");
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Hora inválida (HH:MM)")).toBeTruthy();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("ao editar, preenche (hora sem segundos) e mostra o erro da API ao remarcar", async () => {
    mockParametros = { id: "pet-1", consultaId: "con-1" };
    mockGet.mockResolvedValueOnce({
      data: {
        id: "con-1", idPet: "pet-1", tipoEvento: "CONSULTA", descricao: "Check-up", data: "2026-10-15",
        hora: "10:00:00", status: "AGENDADO", idClinica: "cli-1", nomeClinica: "Clínica Bigode e Rabo",
      },
    });
    mockPut.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 409, data: { erro: "Esse horário já foi agendado. Escolha outro" } },
    });

    render(<TelaConsulta />, { wrapper });

    expect(await screen.findByDisplayValue("Check-up")).toBeTruthy();
    expect(screen.getByDisplayValue("10:00")).toBeTruthy();
    expect(screen.getByText(/Agendada na Clínica Bigode e Rabo/)).toBeTruthy();

    fireEvent.changeText(screen.getByPlaceholderText("HH:MM"), "1100");
    fireEvent.press(screen.getByText("Salvar"));

    expect(await screen.findByText("Esse horário já foi agendado. Escolha outro")).toBeTruthy();
    expect(mockPut).toHaveBeenCalledWith("/consulta/con-1", expect.objectContaining({ hora: "11:00" }));
  });
});

describe("consultas no histórico e nos próximos cuidados", () => {
  it("máscara de hora", () => {
    expect(mascararHora("0930")).toBe("09:30");
    expect(mascararHora("9")).toBe("9");
    expect(mascararHora("123456")).toBe("12:34");
  });

  it("histórico: agendada vai para o futuro, cancelada para o passado sem editar", () => {
    const eventos = montarHistorico(
      [],
      [],
      [
        consulta({ id: "agendada", data: "2026-10-20", hora: "14:00", nomeClinica: "Clínica X" }),
        consulta({ id: "cancelada", data: "2026-10-01", status: "CANCELADO" }),
        consulta({ id: "realizada", data: "2026-09-01", status: "CONCLUIDO", tipoEvento: "EXAME" }),
      ],
      AGORA
    );

    expect(eventos.map((evento) => [evento.id, evento.situacao, evento.selo])).toEqual([
      ["agendada", "futuro", "CONSULTA"],
      ["cancelada", "passado", "CANCELADA"],
      ["realizada", "passado", "EXAME"],
    ]);
    expect(eventos[0]).toEqual(
      expect.objectContaining({ descricao: "Agendada · às 14:00 · Clínica X", podeEditar: true, podeCancelar: true })
    );
    expect(eventos[1]).toEqual(expect.objectContaining({ podeEditar: false, podeCancelar: false }));
  });

  it("próximos cuidados: consulta de hoje primeiro e com destaque; cancelada e passada ficam de fora", () => {
    const cuidados = proximosCuidados(
      [],
      [],
      [
        consulta({ id: "semana", descricao: "Retorno", tipoEvento: "RETORNO", data: "2026-10-16", hora: "08:30" }),
        consulta({ id: "hoje", descricao: "Check-up", data: "2026-10-09", hora: "17:00" }),
        consulta({ id: "cancelada", data: "2026-10-12", status: "CANCELADO" }),
        consulta({ id: "passada", data: "2026-10-01", status: "CONCLUIDO" }),
      ],
      3,
      AGORA
    );

    expect(cuidados).toEqual([
      expect.objectContaining({ titulo: "Check-up", subtitulo: "Hoje às 17:00.", selo: "CONSULTA", destaque: true }),
      expect.objectContaining({ titulo: "Retorno", subtitulo: "Daqui 7 dias, às 08:30.", selo: "RETORNO", destaque: false }),
    ]);
  });
});
