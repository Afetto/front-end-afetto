import axios from "axios";

const FALLBACK_API_URL = "http://localhost:3000";

const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? FALLBACK_API_URL;

if (!process.env.EXPO_PUBLIC_API_URL) {
    console.warn(
        `[api] EXPO_PUBLIC_API_URL não configurada — usando fallback ${FALLBACK_API_URL}. ` +
        "Defina a variável no arquivo .env para conectar à API real."
    );
}

export const api = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use((config) => {
    // Se estiver usando AsyncStorage para o token:
    // const token = await AsyncStorage.getItem("@afetto:token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado — redirecionar para login
        }
        return Promise.reject(error);
    }
);