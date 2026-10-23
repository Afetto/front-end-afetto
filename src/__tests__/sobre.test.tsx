import { render, screen } from "@testing-library/react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

import TelaSobre from "@/app/(app)/sobre";
import { buildDoApp, versaoDoApp } from "@/utils/versao";
import configDoApp, { infoDoCommit } from "../../app.config";

// O manifesto do app (Constants.expoConfig) é trocado em cada teste
jest.mock("expo-constants", () => ({
  __esModule: true,
  ExecutionEnvironment: { Bare: "bare", Standalone: "standalone", StoreClient: "storeClient" },
  default: { expoConfig: null, executionEnvironment: "standalone" },
}));

// Número do build lido do APK instalado (no aparelho vem do versionCode do EAS)
jest.mock("expo-application", () => ({ nativeBuildVersion: "3" }));

const HASH = "66df52342d36b01ebd359505967d0ddf5659559f";

const AMBIENTE_DO_ENV = process.env.EXPO_PUBLIC_APP_ENV;

afterEach(() => {
  jest.restoreAllMocks();
  process.env.EXPO_PUBLIC_APP_ENV = AMBIENTE_DO_ENV;
});

describe("versaoDoApp — o que a tela mostra", () => {
  it("versão do app.json, hash curto e completo e a data do commit em DD/MM/AAAA", () => {
    expect(
      versaoDoApp({
        version: "1.0.0",
        extra: { commitHash: HASH, commitData: "2026-10-10", commitComAlteracoes: false },
      })
    ).toEqual({
      versao: "1.0.0",
      commitCurto: "66df523",
      commitCompleto: HASH,
      dataCommit: "10/10/2026",
      comAlteracoes: false,
    });
  });

  it("sem hash válido não inventa valor (o Expo manda {} quando falta um campo)", () => {
    const versao = versaoDoApp({ version: "1.0.0", extra: { commitHash: {}, commitData: {} } });

    expect(versao.commitCurto).toBeNull();
    expect(versao.commitCompleto).toBeNull();
    expect(versao.dataCommit).toBeNull();
    expect(versaoDoApp(null).versao).toBe("—");
  });
});

describe("buildDoApp — número do build e ambiente", () => {
  it("no APK do Firebase: o número que o EAS deu ao build e o ambiente do perfil", () => {
    expect(buildDoApp({ numeroNativo: "3", noExpoGo: false, ambiente: "preview" })).toEqual({
      numero: "3",
      ambiente: "preview",
    });
  });

  it("no Expo Go não mostra o número (seria o do próprio Expo Go)", () => {
    expect(buildDoApp({ numeroNativo: "254", noExpoGo: true, ambiente: undefined })).toEqual({
      numero: null,
      ambiente: "desenvolvimento",
    });
  });

  it("sem número nativo (navegador) não inventa valor", () => {
    expect(buildDoApp({ numeroNativo: null, noExpoGo: false, ambiente: " " }).numero).toBeNull();
    expect(buildDoApp({ numeroNativo: null, noExpoGo: false, ambiente: " " }).ambiente).toBe("desenvolvimento");
  });
});

describe("app.config.ts — hash injetado na hora do build", () => {
  it("no EAS usa EAS_BUILD_GIT_COMMIT_HASH e não marca alterações locais", () => {
    const git = jest.fn((argumentos: string[]) => (argumentos[0] === "log" ? "2026-10-10" : " M arquivo.ts"));

    expect(infoDoCommit({ EAS_BUILD_GIT_COMMIT_HASH: HASH }, git)).toEqual({
      commitHash: HASH,
      commitData: "2026-10-10",
      commitComAlteracoes: false,
    });
    expect(git).not.toHaveBeenCalledWith(["rev-parse", "HEAD"]);
  });

  it("no computador pergunta ao git e avisa quando há mudança fora do commit", () => {
    const respostas: Record<string, string> = {
      "rev-parse HEAD": HASH,
      [`log -1 --format=%cd --date=short ${HASH}`]: "2026-10-10",
      "status --porcelain": " M src/app/(app)/sobre.tsx",
    };

    expect(infoDoCommit({}, (argumentos) => respostas[argumentos.join(" ")])).toEqual({
      commitHash: HASH,
      commitData: "2026-10-10",
      commitComAlteracoes: true,
    });
  });

  it("sem git, não inventa hash nem data", () => {
    expect(infoDoCommit({}, () => undefined)).toEqual({ commitComAlteracoes: false });
  });

  it("mantém o app.json e soma o commit em `extra`", () => {
    const anterior = process.env.EAS_BUILD_GIT_COMMIT_HASH;
    process.env.EAS_BUILD_GIT_COMMIT_HASH = HASH;
    try {
      const resultado = configDoApp({
        config: { name: "challenge-afetto", slug: "challenge-afetto", version: "1.0.0", extra: { router: {} } },
        projectRoot: ".",
        staticConfigPath: null,
        packageJsonPath: null,
      });

      expect(resultado.version).toBe("1.0.0");
      expect(resultado.extra).toMatchObject({ router: {}, commitHash: HASH, commitComAlteracoes: false });
    } finally {
      process.env.EAS_BUILD_GIT_COMMIT_HASH = anterior;
    }
  });
});

describe("TelaSobre (/sobre)", () => {
  it("mostra a versão, o commit curto, a data e o hash completo", async () => {
    jest.replaceProperty(Constants, "expoConfig", {
      name: "challenge-afetto",
      slug: "challenge-afetto",
      version: "1.0.0",
      extra: { commitHash: HASH, commitData: "2026-10-10", commitComAlteracoes: false },
    });

    render(<TelaSobre />);

    expect(await screen.findByText("Sobre o App")).toBeTruthy();
    expect(screen.getByText("1.0.0")).toBeTruthy();
    expect(screen.getByText("66df523")).toBeTruthy();
    expect(screen.getByText("10/10/2026")).toBeTruthy();
    expect(screen.getByText(HASH)).toBeTruthy();
    expect(screen.queryByText(/ainda não estão em nenhum commit/)).toBeNull();
  });

  it("mostra o número do build lido do APK e o ambiente do perfil do EAS", async () => {
    process.env.EXPO_PUBLIC_APP_ENV = "preview";
    jest.replaceProperty(Constants, "expoConfig", {
      name: "Afetto",
      slug: "challenge-afetto",
      version: "1.0.0",
      extra: { commitHash: HASH, commitComAlteracoes: false },
    });

    render(<TelaSobre />);

    expect(await screen.findByText("Build")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("Ambiente")).toBeTruthy();
    expect(screen.getByText("preview")).toBeTruthy();
  });

  it("no Expo Go esconde o número do build e mostra o ambiente de desenvolvimento", async () => {
    delete process.env.EXPO_PUBLIC_APP_ENV;
    jest.replaceProperty(Constants, "executionEnvironment", ExecutionEnvironment.StoreClient);
    jest.replaceProperty(Constants, "expoConfig", {
      name: "Afetto",
      slug: "challenge-afetto",
      version: "1.0.0",
      extra: { commitHash: HASH, commitComAlteracoes: false },
    });

    render(<TelaSobre />);

    expect(await screen.findByText("desenvolvimento")).toBeTruthy();
    expect(screen.queryByText("Build")).toBeNull();
  });

  it("avisa quando o app foi gerado com alterações fora do commit", async () => {
    jest.replaceProperty(Constants, "expoConfig", {
      name: "challenge-afetto",
      slug: "challenge-afetto",
      version: "1.0.0",
      extra: { commitHash: HASH, commitComAlteracoes: true },
    });

    render(<TelaSobre />);

    expect(await screen.findByText(/ainda não estão em nenhum commit/)).toBeTruthy();
  });

  it("sem hash no build, mostra 'não informado' em vez de um valor inventado", async () => {
    jest.replaceProperty(Constants, "expoConfig", {
      name: "challenge-afetto",
      slug: "challenge-afetto",
      version: "1.0.0",
      extra: {},
    });

    render(<TelaSobre />);

    expect(await screen.findByText("não informado")).toBeTruthy();
    expect(screen.getByText(/lido do git na hora do build/)).toBeTruthy();
  });
});
