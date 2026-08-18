import { api } from "@/lib/api";
import { Clinica, VincularClinicaInput } from "@/schemas/clinica.schema";


export const clinicaService = {
    getAll: async (): Promise<Clinica[]> => {
        const response = await api.get("/clinicas");
        return response.data;
    },

    getById: async (id: number): Promise<Clinica> => {
        const response = await api.get(`/clinicas/${id}`);
        return response.data;
    },

    vincular: async (data: VincularClinicaInput): Promise<void> => {
        await api.post("/clinicas/vincular", data);
    },

    desvincular: async (clinicaId: number): Promise<void> => {
        await api.delete(`/clinicas/vincular/${clinicaId}`);
    },
};