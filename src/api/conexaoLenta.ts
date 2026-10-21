import axios, { type AxiosAdapter, type InternalAxiosRequestConfig } from "axios";

// O axios não exporta o tipo da opção `adapter`; é o mesmo que getAdapter recebe
type ConfigDoAdaptador = Parameters<typeof axios.getAdapter>[0];

// Por dentro, o getAdapter também recebe a config da chamada (o adaptador
// `fetch` depende dela), igual o próprio axios faz; o tipo publicado só
// declara o primeiro parâmetro.
const resolverAdaptador = axios.getAdapter as (
  adaptadores: ConfigDoAdaptador,
  config: InternalAxiosRequestConfig
) => AxiosAdapter;

/*
 * Aviso "Conectando ao servidor…": conta as chamadas à API que passaram de
 * TEMPO_PARA_AVISO_MS sem resposta. Na instância gratuita do Render, a API
 * "dorme" depois de 15 min sem uso e a primeira chamada espera ela acordar
 * (cerca de 1 minuto). Sem o aviso, o app parece travado nesse tempo.
 * Quem mostra o aviso é o componente `AvisoConexaoLenta`, via `useConexaoLenta`.
 */
export const TEMPO_PARA_AVISO_MS = 4000;

type Ouvinte = () => void;
const ouvintes = new Set<Ouvinte>();
let chamadasLentas = 0;

function avisarOuvintes() {
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function assinarConexaoLenta(ouvinte: Ouvinte): () => void {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

/** Há ao menos uma chamada à API esperando há mais de TEMPO_PARA_AVISO_MS. */
export function haConexaoLenta(): boolean {
  return chamadasLentas > 0;
}

/** Marca o início de uma chamada; devolve a função que marca o fim (chamar uma vez basta). */
export function acompanharChamada(): () => void {
  let ficouLenta = false;
  let terminou = false;

  const temporizador = setTimeout(() => {
    ficouLenta = true;
    chamadasLentas += 1;
    avisarOuvintes();
  }, TEMPO_PARA_AVISO_MS);

  return () => {
    if (terminou) return;
    terminou = true;
    clearTimeout(temporizador);
    if (ficouLenta) {
      chamadasLentas -= 1;
      avisarOuvintes();
    }
  };
}

/**
 * Envolve o adaptador do axios (quem de fato faz a chamada HTTP): o fim é
 * marcado quando a chamada termina de qualquer jeito — resposta, erro ou tempo
 * esgotado —, então o aviso nunca fica preso na tela.
 */
export function comAvisoDeConexaoLenta(
  adaptador: ConfigDoAdaptador
): AxiosAdapter {
  return async (config) => {
    const terminar = acompanharChamada();
    try {
      return await resolverAdaptador(adaptador, config)(config);
    } finally {
      terminar();
    }
  };
}
