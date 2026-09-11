import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { DadosCadastroPet, Pet } from "@/schemas/pet.schema";
import axios from "axios";

export const petService = {
    listar: async (): Promise<Pet[]> => {
        try {
            const response = await api.get("/pet", { params: { page: 0, size: 100 } });
            return extrairLista<Pet>(response.data);
        } catch (error) {
            // Alguns endpoints da API respondem 404 quando a coleção está vazia
            if (axios.isAxiosError(error) && error.response?.status === 404) return [];
            throw error;
        }
    },

    buscarPorId: async (id: string): Promise<Pet> => {
        const response = await api.get<Pet>(`/pet/${id}`);
        return response.data;
    },

    criar: async (dados: DadosCadastroPet): Promise<Pet> => {
        const response = await api.post<Pet>("/pet", dados);
        return response.data;
    },

    atualizar: async (id: string, dados: Partial<DadosCadastroPet>): Promise<Pet> => {
        const response = await api.put<Pet>(`/pet/${id}`, dados);
        return response.data;
    },

    remover: async (id: string): Promise<void> => {
        await api.delete(`/pet/${id}`);
    },
};
