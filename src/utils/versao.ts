import { converterDataParaBR } from "@/utils/data";

/** Identificação da versão instalada, mostrada na tela "Sobre o App". */
export type VersaoDoApp = {
  /** Versão do app.json (ex.: "1.0.0"). */
  versao: string;
  /** 7 primeiros caracteres do hash do commit. */
  commitCurto: string | null;
  commitCompleto: string | null;
  /** Data do commit, DD/MM/AAAA. */
  dataCommit: string | null;
  /** Gerado com mudanças que ainda não estão em nenhum commit. */
  comAlteracoes: boolean;
};

/** Build instalado: o número que o EAS deu ao APK e o ambiente do build. */
export type BuildDoApp = {
  /** versionCode do APK (o EAS aumenta a cada build do perfil preview). */
  numero: string | null;
  /** "preview" no APK do Firebase; "desenvolvimento" rodando com npx expo start. */
  ambiente: string;
};

type OrigemDoBuild = {
  /** Application.nativeBuildVersion (expo-application). */
  numeroNativo: string | null | undefined;
  /** No Expo Go o número nativo é o do próprio Expo Go, não o do Afetto. */
  noExpoGo: boolean;
  /** EXPO_PUBLIC_APP_ENV, definido por perfil no eas.json. */
  ambiente: string | undefined;
};

type ConfigDoApp = { version?: string; extra?: Record<string, unknown> } | null | undefined;

const HASH_VALIDO = /^[0-9a-f]{7,40}$/i;
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lê a versão (app.json) e o commit que o `app.config.ts` injetou em `extra`
 * na hora do build. Sem hash (ex.: build feito sem git), devolve `null` — a
 * tela mostra "não informado" em vez de inventar um valor.
 */
export function versaoDoApp(config: ConfigDoApp): VersaoDoApp {
  const extra = config?.extra ?? {};
  const hashBruto = typeof extra.commitHash === "string" ? extra.commitHash.trim() : "";
  const hash = HASH_VALIDO.test(hashBruto) ? hashBruto.toLowerCase() : null;
  const data =
    typeof extra.commitData === "string" && DATA_ISO.test(extra.commitData)
      ? converterDataParaBR(extra.commitData)
      : null;

  return {
    versao: config?.version ?? "—",
    commitCurto: hash ? hash.slice(0, 7) : null,
    commitCompleto: hash,
    dataCommit: data,
    comAlteracoes: extra.commitComAlteracoes === true,
  };
}

/**
 * Número do build e ambiente, como no codelab da aula de distribuição: o
 * número vem do APK instalado (nunca escrito à mão) e só aparece fora do Expo
 * Go; sem EXPO_PUBLIC_APP_ENV (npx expo start), o ambiente é "desenvolvimento".
 */
export function buildDoApp({ numeroNativo, noExpoGo, ambiente }: OrigemDoBuild): BuildDoApp {
  const numero = numeroNativo?.trim();
  return {
    numero: !noExpoGo && numero ? numero : null,
    ambiente: ambiente?.trim() || "desenvolvimento",
  };
}
