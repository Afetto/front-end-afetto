import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  api,
  definirUrlDaApi,
  TEMPO_LIMITE_API_LOCAL_MS,
  TEMPO_LIMITE_API_REMOTA_MS,
  tempoLimiteDaApi,
} from "@/api/api";

// O Expo informa o endereço do computador que roda o Metro (hostUri)
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: "192.168.0.10:8081" } },
}));

const URL_DO_ENV = process.env.EXPO_PUBLIC_API_URL;

afterEach(() => {
  process.env.EXPO_PUBLIC_API_URL = URL_DO_ENV;
  jest.restoreAllMocks();
});

describe("definirUrlDaApi", () => {
  it("sem .env, usa a API no computador que roda o Expo, na porta 8080", () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(definirUrlDaApi()).toBe("http://192.168.0.10:8080");
  });

  it("sem o endereço do Expo, usa localhost:8080", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Constants, "expoConfig", null);

    expect(definirUrlDaApi()).toBe("http://localhost:8080");
  });

  it("no navegador, usa o mesmo endereço da página (para o cookie de sessão ir junto)", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Platform, "OS", "web");
    const locationOriginal = Object.getOwnPropertyDescriptor(globalThis, "location");
    Object.defineProperty(globalThis, "location", { value: { hostname: "127.0.0.1" }, configurable: true });

    try {
      expect(definirUrlDaApi()).toBe("http://127.0.0.1:8080");
    } finally {
      if (locationOriginal) Object.defineProperty(globalThis, "location", locationOriginal);
      else delete (globalThis as { location?: unknown }).location;
    }
  });

  it("EXPO_PUBLIC_API_URL no .env tem prioridade", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.0.5:8080";

    expect(definirUrlDaApi()).toBe("http://10.0.0.5:8080");
  });
});

describe("tempoLimiteDaApi", () => {
  it("API do Render (https) espera até 90 s: a instância gratuita leva cerca de 1 minuto para acordar", () => {
    expect(tempoLimiteDaApi("https://afetto.onrender.com")).toBe(90_000);
    expect(TEMPO_LIMITE_API_REMOTA_MS).toBe(90_000);
  });

  it("API local (http) continua com 10 s, para um endereço errado aparecer logo", () => {
    expect(tempoLimiteDaApi("http://192.168.0.10:8080")).toBe(10_000);
    expect(TEMPO_LIMITE_API_LOCAL_MS).toBe(10_000);
  });

  it("o cliente usa o limite do endereço configurado e passa pelo aviso de conexão lenta", () => {
    // jest.setup.js define EXPO_PUBLIC_API_URL=https://api.test.local
    expect(api.defaults.baseURL).toBe("https://api.test.local");
    expect(api.defaults.timeout).toBe(90_000);
    expect(typeof api.defaults.adapter).toBe("function");
  });
});
