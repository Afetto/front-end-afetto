import { api } from "@/api/api";

// Calendário de cuidados (GET /calendario). A API devolve, no período, cada
// vacina aplicada/agendada, cada próxima dose, um evento por dia de remédio e
// as consultas (sem as canceladas), já ordenados por data e hora.

export type TipoEventoCalendario = "VACINA" | "PROXIMA_DOSE" | "REMEDIO" | "CONSULTA";

export type EventoCalendario = {
  tipo: TipoEventoCalendario;
  titulo: string;
  // Ex.: "Próxima dose", "1 comprimido · A cada 12 horas", nome da clínica
  detalhe?: string;
  data: string; // YYYY-MM-DD
  hora?: string; // HH:mm (consultas)
  // Só nas consultas: AGENDADO ou CONCLUIDO
  status?: string;
  // Id da vacina, do remédio ou da consulta (para abrir a edição)
  idReferencia: string;
  idPet: string;
  nomePet?: string;
};

type EventoApi = Omit<EventoCalendario, "detalhe" | "hora" | "status" | "nomePet"> & {
  detalhe?: string | null;
  hora?: string | null;
  status?: string | null;
  nomePet?: string | null;
};

type CalendarioApi = { inicio: string; fim: string; totalEventos: number; eventos: EventoApi[] };

export const calendarioService = {
  buscar: async (filtro: { inicio: string; fim: string; idPet?: string }): Promise<EventoCalendario[]> => {
    const response = await api.get<CalendarioApi>("/calendario", { params: filtro });

    return (response.data?.eventos ?? []).map((evento) => ({
      ...evento,
      detalhe: evento.detalhe || undefined,
      hora: evento.hora ? evento.hora.slice(0, 5) : undefined,
      status: evento.status || undefined,
      nomePet: evento.nomePet || undefined,
    }));
  },
};
