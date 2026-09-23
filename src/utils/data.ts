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

/** Zera a hora de uma data (string ISO ou `Date`) — para comparar datas só pelo dia. */
export function normalizarData(data: string | Date): Date {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Calcula a idade em anos a partir de uma data de nascimento ISO (YYYY-MM-DD). */
export function calcularIdade(dataNasc: string): string {
  if (!dataNasc) return "—";
  const nascimento = new Date(dataNasc);
  if (Number.isNaN(nascimento.getTime())) return "—";
  const hoje = new Date();
  let anos = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) anos--;
  return anos <= 0 ? "< 1 ano" : `${anos} ${anos === 1 ? "ano" : "anos"}`;
}
