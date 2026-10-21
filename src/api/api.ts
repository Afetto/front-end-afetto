import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

import { comAvisoDeConexaoLenta } from "@/api/conexaoLenta";

// A API do Afetto usa autenticação por sessão via cookie (JSESSIONID),
// não JWT/Bearer. O cookie é enviado automaticamente em toda requisição
// graças ao `withCredentials: true` abaixo.

// A API Java roda no computador de desenvolvimento, nesta porta
// (`server.port` no application.properties do back end).
export const PORTA_API_LOCAL = 8080;

/**
 * Endereço da API:
 * 1. `EXPO_PUBLIC_API_URL`, quando definida: a API no Render (https) ou em outro
 *    computador. No build que vai para o celular ela é obrigatória (ver app.config.ts).
 * 2. Senão, a API local no mesmo computador que roda o Expo. O endereço desse
 *    computador vem do próprio Expo (`hostUri`, ex.: "192.168.0.10:8081"). Não dá
 *    para fixar "localhost": no celular, localhost é o próprio celular.
 *    No navegador, usa o mesmo endereço da página: o cookie de sessão só vai
 *    junto quando a API está no mesmo site que o app.
 * 3. Sem esse dado, localhost.
 */
export function definirUrlDaApi(): string {
    const configurada = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (configurada) return configurada;

    const computador =
        Platform.OS === "web"
            ? globalThis.location?.hostname
            : Constants.expoConfig?.hostUri?.split(":")[0];

    return `http://${computador || "localhost"}:${PORTA_API_LOCAL}`;
}

/**
 * Quanto tempo esperar a resposta. A API do Render (https) na instância gratuita
 * "dorme" depois de 15 min sem uso, e a primeira chamada espera ela acordar —
 * cerca de 1 minuto. Na API local, 10 s bastam, e um endereço errado no .env
 * aparece logo como erro.
 */
export const TEMPO_LIMITE_API_REMOTA_MS = 90_000;
export const TEMPO_LIMITE_API_LOCAL_MS = 10_000;

export function tempoLimiteDaApi(url: string): number {
    return url.startsWith("https://") ? TEMPO_LIMITE_API_REMOTA_MS : TEMPO_LIMITE_API_LOCAL_MS;
}

const urlBase = definirUrlDaApi();

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
    console.log(`[api] Usando a API local em ${urlBase}`);
}

export const api = axios.create({
    baseURL: urlBase,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: tempoLimiteDaApi(urlBase),
    withCredentials: true, // ← ESSENCIAL — envia o cookie JSESSIONID
});

// Chamada que passa de alguns segundos sem resposta mostra "Conectando ao
// servidor…" (componente AvisoConexaoLenta, no _layout.tsx raiz).
api.defaults.adapter = comAvisoDeConexaoLenta(api.defaults.adapter);

// 401 = "não autenticado": a API responde assim sem login, com a sessão
// expirada ou quando ela reiniciou (ex.: Render "dormindo" — as sessões ficam
// na memória dela). Quando isso acontece, avisamos quem registrou um tratador
// (o SessaoContext, que limpa a sessão local) — o <RotaProtegida> reage sozinho
// porque a sessão vira `null` e ele já redireciona para o login.
//
// Não há interceptor para 403: na API ele quer dizer "logado, mas sem
// permissão" (ex.: rota só de ADMIN), não sessão inválida. Cada tela trata seu
// próprio erro (isError do useQuery).
type TratadorSessaoExpirada = () => void;
let tratadorSessaoExpirada: TratadorSessaoExpirada | null = null;

export function definirTratadorSessaoExpirada(
    tratador: TratadorSessaoExpirada | null
) {
    tratadorSessaoExpirada = tratador;
}

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            tratadorSessaoExpirada?.();
        }
        return Promise.reject(error);
    }
);
