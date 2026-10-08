/** Converte DD/MM/AAAA → YYYY-MM-DD (formato que a API espera). */
export function converterDataParaISO(dataBr: string): string {
  const [dia, mes, ano] = dataBr.split("/");
  return `${ano}-${mes}-${dia}`;
}

/** Converte YYYY-MM-DD (formato da API) → DD/MM/AAAA (formato de exibição/formulário). */
export function converterDataParaBR(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

const FORMATO_ISO_SO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Zera a hora de uma data (string ISO ou `Date`) — para comparar datas só pelo dia.
 *
 * Uma string só com a data ("2026-10-08", o formato da API) é montada no fuso
 * do aparelho. `new Date("2026-10-08")` leria como meia-noite em UTC, que no
 * Brasil (UTC-3) ainda é o dia anterior — e toda conta de "dias restantes"
 * saía com um dia a menos.
 */
export function normalizarData(data: string | Date): Date {
  if (typeof data === "string") {
    const partes = FORMATO_ISO_SO_DATA.exec(data);
    if (partes) {
      return new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3]));
    }
  }

  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Calcula a idade em anos a partir de uma data de nascimento ISO (YYYY-MM-DD). */
export function calcularIdade(dataNasc: string): string {
  if (!dataNasc) return "—";
  const nascimento = normalizarData(dataNasc);
  if (Number.isNaN(nascimento.getTime())) return "—";
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) anos--;
  return anos <= 0 ? "< 1 ano" : `${anos} ${anos === 1 ? "ano" : "anos"}`;
}
