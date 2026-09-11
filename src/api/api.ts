import axios from "axios";

// A API do Afetto usa autenticação por sessão via cookie (JSESSIONID),
// não JWT/Bearer. O cookie é enviado automaticamente em toda requisição
// graças ao `withCredentials: true` abaixo.
const URL_API_PADRAO = "https://java-afetto-fork.onrender.com";

const urlBase = process.env.EXPO_PUBLIC_API_URL ?? URL_API_PADRAO;

if (!process.env.EXPO_PUBLIC_API_URL) {
    console.warn(
        `[api] EXPO_PUBLIC_API_URL não configurada — usando fallback ${URL_API_PADRAO}. ` +
        "Defina a variável no arquivo .env para conectar à API real."
    );
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
