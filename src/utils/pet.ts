/** Rótulo em português de cada espécie do enum `ESPECIES_PET` — usado em telas de listagem e cadastro. */
export const LABEL_ESPECIE: Record<string, string> = {
  CACHORRO: "Cachorro",
  GATO: "Gato",
  COELHO: "Coelho",
  AVE: "Ave",
  REPTIL: "Réptil",
  ROEDOR: "Roedor",
  PORCO: "Porco",
  MACACO: "Macaco",
  CAVALO: "Cavalo",
  PEIXE: "Peixe",
  INSETO: "Inseto",
  OUTRO: "Outro",
};

/** Emoji de cada espécie — usado no avatar do card de pet e no SeletorEspecie. */
export const ICONE_ESPECIE: Record<string, string> = {
  CACHORRO: "🐕",
  GATO: "🐈",
  COELHO: "🐇",
  AVE: "🐦",
  REPTIL: "🦎",
  ROEDOR: "🐀",
  PORCO: "🐷",
  MACACO: "🐒",
  CAVALO: "🐴",
  PEIXE: "🐟",
  INSETO: "🦗",
  OUTRO: "🐾",
};

/**
 * O pet é do usuário logado? ⚠️ CONTORNO DE LACUNA DA API: GET /pet devolve os
 * pets de todas as contas, e a listagem só traz o dono no link HATEOAS
 * `linkUsuario.href` (".../usuario/{id}"). Sem esse link, considera que é.
 * Usado onde um pet de outra conta quebraria a ação (ex.: agendar consulta,
 * que a API recusa com 404).
 */
export function petEhDoUsuario(pet: object, idUsuario: string): boolean {
  const href = (pet as { linkUsuario?: { href?: string } }).linkUsuario?.href;
  if (!href) return true;
  return href.split("/").filter(Boolean).pop() === idUsuario;
}
