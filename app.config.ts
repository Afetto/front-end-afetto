import { execFileSync } from "child_process";
import type { ConfigContext, ExpoConfig } from "expo/config";

/*
 * Identificação da versão para a tela "Sobre o App": o hash do commit é lido
 * na hora do build — nunca fica escrito à mão no código.
 * - Build no EAS (o que vai para o Firebase App Distribution): o EAS informa o
 *   commit na variável EAS_BUILD_GIT_COMMIT_HASH.
 * - No computador (npx expo start ou build local): pergunta ao git.
 * O Expo lê este arquivo quando inicia: depois de um commit novo, reinicie o
 * `npx expo start` para a tela mostrar o hash novo.
 * O app.json continua sendo a configuração base; ele chega aqui em `config`.
 */

type RodarGit = (argumentos: string[]) => string | undefined;

// execFileSync chama o git direto, sem passar pelo shell: no Windows o cmd.exe
// trataria o "%cd" do formato de data como variável de ambiente.
const rodarGit: RodarGit = (argumentos) => {
  try {
    const saida = execFileSync("git", argumentos, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
    return saida || undefined;
  } catch {
    // Sem git (ou fora de um repositório): a tela mostra "não informado"
    return undefined;
  }
};

// Campos ausentes ficam de fora (o Expo transforma `null` em `{}` no manifesto)
export type InfoDoCommit = {
  commitHash?: string;
  /** Data do commit, YYYY-MM-DD. */
  commitData?: string;
  /** O app foi gerado com mudanças que ainda não estão em nenhum commit. */
  commitComAlteracoes: boolean;
};

export function infoDoCommit(
  ambiente: Record<string, string | undefined> = process.env,
  git: RodarGit = rodarGit
): InfoDoCommit {
  const doEas = ambiente.EAS_BUILD_GIT_COMMIT_HASH?.trim();
  const hash = doEas || git(["rev-parse", "HEAD"]);
  const data = hash ? git(["log", "-1", "--format=%cd", "--date=short", hash]) : undefined;

  return {
    ...(hash ? { commitHash: hash } : {}),
    ...(data ? { commitData: data } : {}),
    // No EAS o build sai de um commit; no computador, avisa se há mudança fora do commit
    commitComAlteracoes: doEas ? false : Boolean(git(["status", "--porcelain"])),
  };
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "challenge-afetto",
  slug: config.slug ?? "challenge-afetto",
  extra: { ...config.extra, ...infoDoCommit() },
});
