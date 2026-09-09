import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const CHAVE_TOKEN = "@afetto:token";

const URL_API_PADRAO = "http://localhost:3000";

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
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(CHAVE_TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expirado — limpa credenciais e redireciona para login
            await AsyncStorage.removeItem(CHAVE_TOKEN);
            delete api.defaults.headers.common["Authorization"];
            router.replace("/login");
        }
        return Promise.reject(error);
    }
);