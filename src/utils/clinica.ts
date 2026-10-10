import { EnderecoClinica, Turno } from "@/schemas/clinica.schema";

/** 0,85 km → "850 m"; 3,24 km → "3,2 km". */
export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.max(Math.round(km * 1000 / 10) * 10, 10)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

/** 4.5 → "4,5" */
export function formatarNota(nota: number): string {
  return nota.toFixed(1).replace(".", ",");
}

/** "Pinheiros · São Paulo" */
export function localDaClinica(endereco?: EnderecoClinica): string {
  return [endereco?.bairro, endereco?.cidade].filter(Boolean).join(" · ");
}

/** "Rua dos Pinheiros, 500 — Pinheiros, São Paulo/SP" */
export function enderecoCompleto(endereco?: EnderecoClinica): string {
  if (!endereco) return "";
  const rua = [endereco.logradouro, endereco.numero].filter(Boolean).join(", ");
  const complemento = endereco.complemento ? ` (${endereco.complemento})` : "";
  const cidade = [endereco.cidade, endereco.uf].filter(Boolean).join("/");
  const resto = [endereco.bairro, cidade].filter(Boolean).join(", ");
  return [rua + complemento, resto].filter(Boolean).join(" — ");
}

export const LABEL_TURNO: Record<Turno, string> = {
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
  INTEGRAL: "Integral",
};

/** "segunda-feira" → "Segunda-feira" */
export function capitalizar(texto: string): string {
  return texto ? texto[0].toUpperCase() + texto.slice(1) : texto;
}
