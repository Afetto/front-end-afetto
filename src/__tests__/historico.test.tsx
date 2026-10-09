import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaHistorico from "@/app/(app)/pet/[id]/historico";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn(), delete: jest.fn(), patch: jest.fn() },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: "pet-1" }),
}));

jest.mock("@/context/SessaoContext", () => ({
  useSessao: () => ({ sessao: { id: "usuario-1", email: "ana@afetto.com", nome: "Ana" } }),
}));

const mockGet = api.get as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  mockGet.mockReset();
  mockGet.mockImplementation((url: string) => {
    if (url === "/pet/pet-1") {
      return Promise.resolve({ data: { id: "pet-1", nome: "Thor", especie: "CACHORRO", raca: "" } });
    }
    if (url === "/vacina") {
      return Promise.resolve({
        data: {
          content: [
            { nomeVacina: "V10", dataAplicacao: "2026-09-01", linkVacina: { href: "/vacina/vac-1" } },
          ],
        },
      });
    }
    if (url === "/remedio") {
      return Promise.resolve({
        data: {
          content: [
            {
              id: "rem-1", idPet: "pet-1", nomeRemedio: "Amoxicilina", dosagem: "1 comprimido",
              frequencia: "A cada 12 horas", dataInicio: "2026-09-10", dataFim: "2026-09-20",
            },
          ],
        },
      });
    }
    if (url === "/consulta") {
      return Promise.resolve({
        data: {
          content: [
            {
              id: "con-1", idPet: "pet-1", tipoEvento: "EXAME", descricao: "Hemograma",
              data: "2099-01-15", hora: "10:00:00", status: "AGENDADO", nomeClinica: "Clínica Bigode e Rabo",
            },
            {
              id: "con-2", idPet: "pet-1", tipoEvento: "CONSULTA", descricao: "Check-up",
              data: "2026-08-01", hora: null, status: "CANCELADO",
            },
          ],
        },
      });
    }
    return Promise.reject(new Error(`URL inesperada: ${url}`));
  });
});

describe("TelaHistorico — vacinas, remédios e consultas na mesma linha do tempo", () => {
  it("mostra vacinas e remédios do pet, e o filtro Remédios esconde as vacinas", async () => {
    render(<TelaHistorico />, { wrapper });

    expect(await screen.findByText("Amoxicilina")).toBeTruthy();
    expect(screen.getByText("V10")).toBeTruthy();
    expect(screen.getByText("1 comprimido · A cada 12 horas")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/remedio", { params: { idPet: "pet-1", page: 0, size: 200 } });

    fireEvent.press(screen.getByText("Remédios"));

    expect(screen.getByText("Amoxicilina")).toBeTruthy();
    expect(screen.queryByText("V10")).toBeNull();
  });

  it("o filtro Consultas mostra agendadas e canceladas; cancelada não tem Editar", async () => {
    render(<TelaHistorico />, { wrapper });

    expect(await screen.findByText("Hemograma")).toBeTruthy();
    fireEvent.press(screen.getByText("Consultas"));

    expect(screen.getByText("Hemograma")).toBeTruthy();
    expect(screen.getByText("Agendada · às 10:00 · Clínica Bigode e Rabo")).toBeTruthy();
    expect(screen.getByText("EXAME")).toBeTruthy();
    expect(screen.getByText("CANCELADA")).toBeTruthy();
    expect(screen.queryByText("V10")).toBeNull();
    expect(screen.queryByText("Amoxicilina")).toBeNull();

    // Agendada: Editar + Cancelar + Excluir; cancelada: só Excluir
    expect(screen.getAllByText("Editar")).toHaveLength(1);
    expect(screen.getAllByText("Cancelar")).toHaveLength(1);
    expect(screen.getAllByText("Excluir")).toHaveLength(2);
  });
});
