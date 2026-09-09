import { api } from "@/api/api";
import { DadosCadastroPet, Pet } from "@/schemas/pet.schema";

export const petService = {
    listar: async (): Promise<Pet[]> => {
        const response = await api.get("/pets");
        return response.data;
    },

    buscarPorId: async (id: number): Promise<Pet> => {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    },

    criar: async (data: DadosCadastroPet): Promise<Pet> => {
        const response = await api.post("/pets", data);
        return response.data;
    },

    atualizar: async (id: number, data: Partial<DadosCadastroPet>): Promise<Pet> => {
        const response = await api.put(`/pets/${id}`, data);
        return response.data;
    },

    remover: async (id: number): Promise<void> => {
        await api.delete(`/pets/${id}`);
    },
};