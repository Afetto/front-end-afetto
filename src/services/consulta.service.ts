import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import { Consulta, DadosConsulta, StatusConsulta, TipoConsulta } from "@/schemas/consulta.schema";

// Consultas de um pet (/consulta). A API só mostra consultas dos pets do
// usuário logado: pet ou consulta de outra conta responde 404.

type ConsultaApi = {
  id: string;
  idPet: string;
  tipoEvento?: TipoConsulta | null;
  descricao?: string | null;
  data: string;
  hora?: string | null;
  status?: StatusConsulta | null;
  idClinica?: string | null;
  nomeClinica?: string | null;
  nomeVeterinario?: string | null;
  observacoes?: string | null;
};

function mapear(dados: ConsultaApi): Consulta {
  return {
    id: dados.id,
    idPet: dados.idPet,
    tipoEvento: dados.tipoEvento ?? "CONSULTA",
    descricao: dados.descricao ?? "",
    data: dados.data,
    // A API manda "10:00" ou "10:00:00" — o app usa sempre HH:MM
    hora: dados.hora ? dados.hora.slice(0, 5) : undefined,
    status: dados.status ?? "AGENDADO",
    idClinica: dados.idClinica || undefined,
    nomeClinica: dados.nomeClinica || undefined,
    nomeVeterinario: dados.nomeVeterinario || undefined,
    observacoes: dados.observacoes || undefined,
  };
}

export const consultaService = {
  // GET /consulta?idPet=
  listarPorPet: async (idPet: string): Promise<Consulta[]> => {
    const response = await api.get("/consulta", { params: { idPet, page: 0, size: 200 } });
    return extrairLista<ConsultaApi>(response.data).map(mapear);
  },

  buscarPorId: async (id: string): Promise<Consulta> => {
    const response = await api.get<ConsultaApi>(`/consulta/${id}`);
    return mapear(response.data);
  },

  criar: async (dados: DadosConsulta): Promise<Consulta> => {
    const response = await api.post<ConsultaApi>("/consulta", dados);
    return mapear(response.data);
  },

  // Também serve para remarcar (nova data/hora)
  atualizar: async (id: string, dados: DadosConsulta): Promise<Consulta> => {
    const response = await api.put<ConsultaApi>(`/consulta/${id}`, dados);
    return mapear(response.data);
  },

  // Só consulta agendada pode ser cancelada; cancelada não pode mais ser editada
  cancelar: async (id: string): Promise<Consulta> => {
    const response = await api.patch<ConsultaApi>(`/consulta/${id}/cancelar`);
    return mapear(response.data);
  },

  remover: async (id: string): Promise<void> => {
    await api.delete(`/consulta/${id}`);
  },
};
