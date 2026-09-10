import axios from "axios";
import { router } from "expo-router";

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

// Interceptor de resposta — sessão expirada / não autenticada volta para o login
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 403) {
            router.replace("/login");
        }
        return Promise.reject(error);
    }
);
