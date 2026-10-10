import { render, screen } from "@testing-library/react-native";
import Constants from "expo-constants";

import TelaSobre from "@/app/(app)/sobre";
import { versaoDoApp } from "@/utils/versao";
import configDoApp, { infoDoCommit } from "../../app.config";

// O manifesto do app (Constants.expoConfig) é trocado em cada teste
jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: null },
}));

const HASH = "66df52342d36b01ebd359505967d0ddf5659559f";

afterEach(() => {
  jest.restoreAllMocks();
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
