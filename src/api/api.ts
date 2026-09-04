import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";

const TOKEN_KEY = "@afetto:token";

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
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
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
            await AsyncStorage.removeItem(TOKEN_KEY);
            delete api.defaults.headers.common["Authorization"];
            router.replace("/login");
        }
        return Promise.reject(error);
    }
);