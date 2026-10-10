import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { DadosRemedio, Remedio } from "@/schemas/remedio.schema";

// Remédios de um pet (/remedio). A API só mostra remédios dos pets do usuário
// logado: pet ou remédio de outra conta responde 404.

type RemedioApi = {
  id: string;
  idPet: string;
  nomeRemedio: string;
  dosagem?: string | null;
  frequencia?: string | null;
  dataInicio: string;
  dataFim?: string | null;
  observacoes?: string | null;
};

function mapear(dados: RemedioApi): Remedio {
  return {
    id: dados.id,
    idPet: dados.idPet,
    nomeRemedio: dados.nomeRemedio,
    dosagem: dados.dosagem || undefined,
    frequencia: dados.frequencia || undefined,
    dataInicio: dados.dataInicio,
    dataFim: dados.dataFim || undefined,
    observacoes: dados.observacoes || undefined,
  };
}

export const remedioService = {
  // GET /remedio?idPet= — mais recentes primeiro
  listarPorPet: async (idPet: string): Promise<Remedio[]> => {
    const response = await api.get("/remedio", { params: { idPet, page: 0, size: 200 } });
    return extrairLista<RemedioApi>(response.data).map(mapear);
  },

  buscarPorId: async (id: string): Promise<Remedio> => {
    const response = await api.get<RemedioApi>(`/remedio/${id}`);
    return mapear(response.data);
  },

  criar: async (dados: DadosRemedio): Promise<Remedio> => {
    const response = await api.post<RemedioApi>("/remedio", dados);
    return mapear(response.data);
  },

  atualizar: async (id: string, dados: DadosRemedio): Promise<Remedio> => {
    const response = await api.put<RemedioApi>(`/remedio/${id}`, dados);
    return mapear(response.data);
  },

  remover: async (id: string): Promise<void> => {
    await api.delete(`/remedio/${id}`);
  },
};
