import { act, render, screen } from "@testing-library/react-native";
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";

import {
  acompanharChamada,
  comAvisoDeConexaoLenta,
  haConexaoLenta,
  TEMPO_PARA_AVISO_MS,
} from "@/api/conexaoLenta";
import { AvisoConexaoLenta } from "@/components/AvisoConexaoLenta";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

const CONFIG = { url: "/pet", headers: {} } as unknown as InternalAxiosRequestConfig;

describe("acompanharChamada", () => {
  it("só conta como lenta depois do tempo do aviso, e deixa de contar quando termina", () => {
    const terminar = acompanharChamada();

    jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS - 1);
    expect(haConexaoLenta()).toBe(false);

    jest.advanceTimersByTime(1);
    expect(haConexaoLenta()).toBe(true);

    terminar();
    expect(haConexaoLenta()).toBe(false);
  });

  it("chamada rápida nunca liga o aviso", () => {
    const terminar = acompanharChamada();
    jest.advanceTimersByTime(500);
    terminar();

    jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS * 2);
    expect(haConexaoLenta()).toBe(false);
  });

  it("com duas chamadas lentas, o aviso só sai quando as duas terminam (e terminar duas vezes não desconta de novo)", () => {
    const terminarA = acompanharChamada();
    const terminarB = acompanharChamada();
    jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS);

    terminarA();
    terminarA();
    expect(haConexaoLenta()).toBe(true);

    terminarB();
    expect(haConexaoLenta()).toBe(false);
  });
});

describe("comAvisoDeConexaoLenta (adaptador do axios)", () => {
  it("devolve a resposta do adaptador original e desliga o aviso no fim", async () => {
    let responder: (resposta: AxiosResponse) => void = () => {};
    const original = jest.fn(
      () => new Promise<AxiosResponse>((resolve) => { responder = resolve; })
    );
    const adaptador = comAvisoDeConexaoLenta(original);

    const chamada = adaptador(CONFIG);
    jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS);
    expect(haConexaoLenta()).toBe(true);

    const resposta = { data: { ok: true }, status: 200 } as AxiosResponse;
    responder(resposta);

    await expect(chamada).resolves.toBe(resposta);
    expect(original).toHaveBeenCalledWith(CONFIG);
    expect(haConexaoLenta()).toBe(false);
  });

  it("também desliga o aviso quando a chamada falha (ex.: tempo esgotado)", async () => {
    let falhar: (erro: Error) => void = () => {};
    const adaptador = comAvisoDeConexaoLenta(
      () => new Promise<AxiosResponse>((_, reject) => { falhar = reject; })
    );

    const chamada = adaptador(CONFIG);
    jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS);
    expect(haConexaoLenta()).toBe(true);

    falhar(new Error("timeout of 90000ms exceeded"));

    await expect(chamada).rejects.toThrow("timeout");
    expect(haConexaoLenta()).toBe(false);
  });
});

describe("AvisoConexaoLenta", () => {
  it("aparece enquanto uma chamada demora e some quando ela termina", () => {
    render(<AvisoConexaoLenta />);
    expect(screen.queryByText("Conectando ao servidor…")).toBeNull();

    const terminar = acompanharChamada();
    act(() => {
      jest.advanceTimersByTime(TEMPO_PARA_AVISO_MS);
    });

    expect(screen.getByText("Conectando ao servidor…")).toBeTruthy();
    expect(screen.getByText("Se ele estava parado, leva cerca de 1 minuto para acordar.")).toBeTruthy();

    act(() => {
      terminar();
    });
    expect(screen.queryByText("Conectando ao servidor…")).toBeNull();
  });
});
