import axios from "axios";

/** Classificação padronizada dos erros de API usados em toda a app. */
export type TipoErroApi =
  | "rede"
  | "tempo_esgotado"
  | "nao_autenticado"
  | "nao_encontrado"
  | "servidor"
  | "desconhecido";

export function classificarErro(error: unknown): TipoErroApi {
  if (!axios.isAxiosError(error)) return "desconhecido";
  if (error.code === "ECONNABORTED") return "tempo_esgotado";
  if (!error.response) return "rede";

  const status = error.response.status;
  if (status === 401) return "nao_autenticado";
  if (status === 404) return "nao_encontrado";
  if (status >= 500) return "servidor";
  return "desconhecido";
}

export function mensagemPorTipo(tipo: TipoErroApi): string {
  switch (tipo) {
    case "rede":
      return "Sem conexão com a internet. Verifique sua rede e tente novamente.";
    case "tempo_esgotado":
      return "A requisição demorou demais. Tente novamente.";
    case "nao_autenticado":
      return "Sua sessão expirou. Faça login novamente.";
    case "nao_encontrado":
      return "Não encontrado.";
    case "servidor":
      return "Erro no servidor. Tente novamente em instantes.";
    default:
      return "Algo deu errado. Tente novamente.";
  }
}

export function mensagemErroApi(error: unknown): string {
  return mensagemPorTipo(classificarErro(error));
}
