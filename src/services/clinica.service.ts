import { Clinica, DadosVincularClinica } from "@/schemas/clinica.schema";

// ⚠️ A API real (https://java-afetto-fork.onrender.com, confirmado em
// GET /v3/api-docs) NÃO expõe nenhum endpoint de clínica — não é uma lacuna
// temporária, o recurso não existe no backend hoje. Os métodos abaixo ficam
// como stub (sem chamada HTTP) para não gerar 404 sem necessidade; quando o
// backend implementar o recurso, reintroduzir `api.get`/`api.post`/`api.delete`
// aqui, no mesmo padrão de `pet.service.ts`.
const ERRO_NAO_DISPONIVEL = "A API ainda não expõe endpoints de clínica.";

export const clinicaService = {
    listar: async (): Promise<Clinica[]> => {
        throw new Error(ERRO_NAO_DISPONIVEL);
    },

    buscarPorId: async (_id: string): Promise<Clinica> => {
        throw new Error(ERRO_NAO_DISPONIVEL);
    },

    vincular: async (_dados: DadosVincularClinica): Promise<void> => {
        throw new Error(ERRO_NAO_DISPONIVEL);
    },

    desvincular: async (_clinicaId: string): Promise<void> => {
        throw new Error(ERRO_NAO_DISPONIVEL);
    },
};
