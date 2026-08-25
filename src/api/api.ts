import axios from "axios";

const baseUrl = process.env.EXPO_PUBLIC_API_URL;

if (!baseUrl) {
    throw new Error("A variável EXPO_PUBLIC_API_URL não foi configurada.");
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