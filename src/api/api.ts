import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// A API do Afetto usa autenticação por sessão via cookie (JSESSIONID),
// não JWT/Bearer. O cookie é enviado automaticamente em toda requisição
// graças ao `withCredentials: true` abaixo.

// A API Java roda no computador de desenvolvimento, nesta porta
// (`server.port` no application.properties do back end).
export const PORTA_API_LOCAL = 8081;

/**
 * Endereço da API:
 * 1. `EXPO_PUBLIC_API_URL` do `.env`, quando definida (ex.: API em outro computador).
 * 2. Senão, a API local no mesmo computador que roda o Expo. O endereço desse
 *    computador vem do próprio Expo (`hostUri`, ex.: "192.168.0.10:8082"). Não dá
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

const urlBase = definirUrlDaApi();

if (__DEV__ && !process.env.EXPO_PUBLIC_API_URL) {
    console.log(`[api] Usando a API local em ${urlBase}`);
}

export const api = axios.create({
    baseURL: urlBase,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
    withCredentials: true, // ← ESSENCIAL — envia o cookie JSESSIONID
});

// Não há interceptor de redirecionamento para 403: um 403 de um endpoint
// protegido pode ser uma regra de negócio (ex.: e-mail em uso) e não
// necessariamente sessão inválida — jogar o app inteiro pro login nesse caso
// causava "bounce" ao navegar entre as abas. Cada tela trata seu próprio erro
// (isError do useQuery).
//
// 401 é diferente: significa "não autenticado" e é sempre sessão expirada/
// inválida. Quando isso acontece, avisamos quem registrou um tratador (o
// SessaoContext, que limpa a sessão local) — o <RotaProtegida> reage sozinho
// porque a sessão vira `null` e ele já redireciona para o login.
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
