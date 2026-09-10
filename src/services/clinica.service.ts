import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { Clinica, DadosVincularClinica } from "@/schemas/clinica.schema";

// ⚠️ PROVISÓRIO — a API (https://java-afetto-fork.onrender.com) ainda NÃO expõe
// nenhum endpoint de clínica. Estes paths (/clinica, /clinica/vincular) são um
// palpite alinhado com o padrão dos outros recursos e vão retornar 404/403 até
// o backend implementar. A tela trata o erro (isError) e mostra "tentar de novo".
const BASE = "/clinica";

export const clinicaService = {
    listar: async (): Promise<Clinica[]> => {
        const response = await api.get(BASE, { params: { page: 0, size: 100 } });
        return extrairLista<Clinica>(response.data);
    },

    buscarPorId: async (id: string): Promise<Clinica> => {
        const response = await api.get<Clinica>(`${BASE}/${id}`);
        return response.data;
    },

    vincular: async (dados: DadosVincularClinica): Promise<void> => {
        await api.post(`${BASE}/vincular`, dados);
    },

    desvincular: async (clinicaId: string): Promise<void> => {
        await api.delete(`${BASE}/vincular/${clinicaId}`);
    },
};
