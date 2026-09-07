import { api } from "@/api/api";
import { DadosCadastroPet, Pet } from "@/schemas/pet.schema";

export const petService = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get("/pets");
        return response.data;
    },

    getById: async (id: number): Promise<Pet> => {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    },

    create: async (data: DadosCadastroPet): Promise<Pet> => {
        const response = await api.post("/pets", data);
        return response.data;
    },

    update: async (id: number, data: Partial<DadosCadastroPet>): Promise<Pet> => {
        const response = await api.put(`/pets/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/pets/${id}`);
    },
};