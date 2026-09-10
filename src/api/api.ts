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

// Sem interceptor de redirecionamento global: um 403 de um endpoint protegido
// não deve jogar o app inteiro para o login (isso causava "bounce" ao navegar
// entre as abas quando o cookie de sessão não era reenviado pelo navegador).
// Cada tela trata o próprio erro (isError do useQuery) e a proteção de rota
// fica no <RotaProtegida>, que verifica a sessão local persistida.
