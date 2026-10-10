import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";

import { api } from "@/api/api";
import TelaCalendarioPet from "@/app/(app)/pet/[id]/calendario";
import {
  agruparPorData,
  celulasDoMes,
  diaInicial,
  mesDe,
  periodoDoMes,
  somarMeses,
} from "@/utils/calendario";
import { router } from "expo-router";

jest.mock("@/api/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({ id: "pet-1" }),
}));

const mockGet = api.get as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("contas do calendário", () => {
  it("outubro de 2026 começa numa quinta: 4 espaços antes do dia 1", () => {
    const celulas = celulasDoMes({ ano: 2026, mes: 9 });
    expect(celulas.slice(0, 5)).toEqual([null, null, null, null, "2026-10-01"]);
    expect(celulas).toHaveLength(4 + 31);
    expect(celulas[celulas.length - 1]).toBe("2026-10-31");
  });

  it("período do mês considera ano bissexto, e trocar de mês vira o ano", () => {
    expect(periodoDoMes({ ano: 2028, mes: 1 })).toEqual({ inicio: "2028-02-01", fim: "2028-02-29" });
    expect(somarMeses({ ano: 2026, mes: 11 }, 1)).toEqual({ ano: 2027, mes: 0 });
    expect(somarMeses({ ano: 2026, mes: 0 }, -1)).toEqual({ ano: 2025, mes: 11 });
  });

  it("dia inicial: hoje no mês atual, dia 1 nos outros meses", () => {
    const hoje = new Date(2026, 9, 9, 15, 0);
    expect(diaInicial({ ano: 2026, mes: 9 }, hoje)).toBe("2026-10-09");
    expect(diaInicial({ ano: 2026, mes: 10 }, hoje)).toBe("2026-11-01");
  });

  it("agrupa pela data mantendo a ordem", () => {
    const grupos = agruparPorData([
      { data: "2026-10-15", n: 1 },
      { data: "2026-10-16", n: 2 },
      { data: "2026-10-15", n: 3 },
    ]);
    expect(grupos["2026-10-15"].map((item) => item.n)).toEqual([1, 3]);
    expect(grupos["2026-10-16"]).toHaveLength(1);
  });
});

describe("TelaCalendarioPet (HTTP mockado)", () => {
  // Datas montadas a partir do mês atual: o teste não depende do dia em que roda
  const mesAtual = mesDe(new Date());
  const { inicio, fim } = periodoDoMes(mesAtual);
  const dia15 = `${inicio.slice(0, 8)}15`;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string, config?: { params?: { inicio?: string } }) => {
      if (url === "/pet/pet-1") {
        return Promise.resolve({ data: { id: "pet-1", nome: "Thor", especie: "CACHORRO", raca: "" } });
      }
      if (url === "/calendario") {
        const doMesAtual = config?.params?.inicio === inicio;
        return Promise.resolve({
          data: {
            inicio,
            fim,
            totalEventos: doMesAtual ? 2 : 0,
            eventos: doMesAtual
              ? [
                  {
                    tipo: "CONSULTA", titulo: "Check-up", detalhe: "Clínica X", data: dia15, hora: "10:00",
                    status: "AGENDADO", idReferencia: "con-1", idPet: "pet-1", nomePet: "Thor",
                  },
                  {
                    tipo: "REMEDIO", titulo: "Amoxicilina", detalhe: "1 comprimido", data: dia15, hora: null,
                    status: null, idReferencia: "rem-1", idPet: "pet-1", nomePet: "Thor",
                  },
                ]
              : [],
          },
        });
      }
      return Promise.reject(new Error(`URL inesperada: ${url}`));
    });
  });

  it("busca o mês do pet, mostra os cuidados do dia escolhido e abre a edição ao tocar", async () => {
    render(<TelaCalendarioPet />, { wrapper });

    expect(await screen.findByText("Cuidados de Thor")).toBeTruthy();
    expect(mockGet).toHaveBeenCalledWith("/calendario", { params: { inicio, fim, idPet: "pet-1" } });

    fireEvent.press(screen.getByText("15"));

    expect(await screen.findByText("Check-up")).toBeTruthy();
    expect(screen.getByText("às 10:00 · Clínica X · agendada")).toBeTruthy();
    expect(screen.getByText("Amoxicilina")).toBeTruthy();

    fireEvent.press(screen.getByText("Check-up"));
    expect(router.push).toHaveBeenCalledWith("/pet/pet-1/consulta?consultaId=con-1");
  });

  it("navega para o próximo mês e busca o período dele", async () => {
    render(<TelaCalendarioPet />, { wrapper });
    await screen.findByText("Cuidados de Thor");

    fireEvent.press(screen.getByLabelText("Próximo mês"));

    const proximo = periodoDoMes(somarMeses(mesAtual, 1));
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith("/calendario", { params: { ...proximo, idPet: "pet-1" } })
    );
    expect(await screen.findByText("Nenhum cuidado neste dia.")).toBeTruthy();
  });
});
