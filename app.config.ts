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

/*
 * Endereço da API no build que vai para o celular (EAS — ex.: o que sobe para
 * o Firebase App Distribution). Ali não há Expo rodando no computador para o
 * app achar a API local: sem EXPO_PUBLIC_API_URL ele chamaria "localhost" — o
 * próprio celular — e nenhuma tela carregaria. O Android também bloqueia
 * http:// em build de produção. Por isso o build para com a explicação, em vez
 * de gerar um app que não funciona. O perfil "development" (dev client) fica de
 * fora: ele conversa com o Expo do computador.
 */
export function conferirApiDoBuild(
  ambiente: Record<string, string | undefined> = process.env
): void {
  if (ambiente.EAS_BUILD !== "true" || ambiente.EAS_BUILD_PROFILE === "development") return;

  const url = ambiente.EXPO_PUBLIC_API_URL?.trim();
  if (!url) {
    throw new Error(
      "EXPO_PUBLIC_API_URL não definida para o build: informe a API do Render " +
        "(https://<servico>.onrender.com) no \"env\" do perfil no eas.json ou nas " +
        "variáveis de ambiente do projeto no EAS. O .env está no .gitignore e não sobe para o EAS."
    );
  }
  if (!url.startsWith("https://")) {
    throw new Error(
      `EXPO_PUBLIC_API_URL precisa ser https:// no build (o Android bloqueia http://): ${url}`
    );
  }
}

export default ({ config }: ConfigContext): ExpoConfig => {
  conferirApiDoBuild();

  return {
    ...config,
    name: config.name ?? "challenge-afetto",
    slug: config.slug ?? "challenge-afetto",
    extra: { ...config.extra, ...infoDoCommit() },
  };
};
