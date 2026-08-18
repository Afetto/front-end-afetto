import { api } from "@/lib/api";
import { CreatePetInput, Pet } from "@/schemas/pet.schema";

export const petService = {
    getAll: async (): Promise<Pet[]> => {
        const response = await api.get("/pets");
        return response.data;
    },

    getById: async (id: number): Promise<Pet> => {
        const response = await api.get(`/pets/${id}`);
        return response.data;
    },

    create: async (data: CreatePetInput): Promise<Pet> => {
        const response = await api.post("/pets", data);
        return response.data;
    },

    update: async (id: number, data: Partial<CreatePetInput>): Promise<Pet> => {
        const response = await api.put(`/pets/${id}`, data);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/pets/${id}`);
    },
};