import Constants from "expo-constants";
import { Platform } from "react-native";

import { definirUrlDaApi } from "@/api/api";

// O Expo informa o endereço do computador que roda o Metro (hostUri)
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { hostUri: "192.168.0.10:8082" } },
}));

const URL_DO_ENV = process.env.EXPO_PUBLIC_API_URL;

afterEach(() => {
  process.env.EXPO_PUBLIC_API_URL = URL_DO_ENV;
  jest.restoreAllMocks();
});

describe("definirUrlDaApi", () => {
  it("sem .env, usa a API no computador que roda o Expo, na porta 8081", () => {
    delete process.env.EXPO_PUBLIC_API_URL;

    expect(definirUrlDaApi()).toBe("http://192.168.0.10:8081");
  });

  it("sem o endereço do Expo, usa localhost:8081", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Constants, "expoConfig", null);

    expect(definirUrlDaApi()).toBe("http://localhost:8081");
  });

  it("no navegador, usa o mesmo endereço da página (para o cookie de sessão ir junto)", () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.replaceProperty(Platform, "OS", "web");
    const locationOriginal = Object.getOwnPropertyDescriptor(globalThis, "location");
    Object.defineProperty(globalThis, "location", { value: { hostname: "127.0.0.1" }, configurable: true });

    try {
      expect(definirUrlDaApi()).toBe("http://127.0.0.1:8081");
    } finally {
      if (locationOriginal) Object.defineProperty(globalThis, "location", locationOriginal);
      else delete (globalThis as { location?: unknown }).location;
    }
  });

  it("EXPO_PUBLIC_API_URL no .env tem prioridade", () => {
    process.env.EXPO_PUBLIC_API_URL = "http://10.0.0.5:8081";

    expect(definirUrlDaApi()).toBe("http://10.0.0.5:8081");
  });
});
