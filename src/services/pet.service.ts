import { api } from "@/api/api";
import { DadosCadastroPet, Pet } from "@/schemas/pet.schema";

// A API pagina as listagens no formato Spring Page: { content: [...], ... }.
// Alguns endpoints podem devolver um array puro — então tratamos os dois casos.
function extrairLista<T>(data: unknown): T[] {
    if (Array.isArray(data)) return data as T[];
    const pagina = data as { content?: T[] } | null;
    return pagina?.content ?? [];
}

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
