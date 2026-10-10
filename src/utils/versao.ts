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
