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

    // A API exige `especie`, `idUsuario`, `nome` e `sexo` no corpo do PUT
    // (mesmo schema PetRequest do POST — confirmado em GET /v3/api-docs).
    // Antes o front enviava só os campos editados sem `idUsuario`, o que
    // violava a validação obrigatória do backend e fazia o PUT falhar.
    atualizar: async (id: string, dados: DadosCadastroPet): Promise<Pet> => {
        const response = await api.put<Pet>(`/pet/${id}`, dados);
        return response.data;
    },

    remover: async (id: string): Promise<void> => {
        await api.delete(`/pet/${id}`);
    },
};
