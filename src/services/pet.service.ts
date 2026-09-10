import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { DadosCadastroPet, Pet } from "@/schemas/pet.schema";

export const petService = {
    listar: async (): Promise<Pet[]> => {
        const response = await api.get("/pet", { params: { page: 0, size: 100 } });
        return extrairLista<Pet>(response.data);
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
