import { calendarioService } from "@/services/calendario.service";
import { useQuery } from "@tanstack/react-query";

// Hook de dados do calendário (GET /calendario). Salvar ou excluir vacina,
// remédio ou consulta invalida esta chave (ver useVacinas/useRemedios/useConsultas).
export const CHAVE_CALENDARIO = "calendario";

export function useCalendarioPet(idPet: string, inicio: string, fim: string) {
  return useQuery({
    queryKey: [CHAVE_CALENDARIO, idPet, inicio, fim],
    queryFn: () => calendarioService.buscar({ inicio, fim, idPet }),
    enabled: !!idPet,
  });
}

/**
 * Agenda de todos os pets do tutor (GET /calendario sem idPet) — usada na Home.
 * O id do usuário vai na chave: trocar de conta no aparelho não mostra a agenda da anterior.
 */
export function useAgendaDoTutor(idUsuario: string | undefined, inicio: string, fim: string) {
  return useQuery({
    queryKey: [CHAVE_CALENDARIO, "todos", idUsuario, inicio, fim],
    queryFn: () => calendarioService.buscar({ inicio, fim }),
    enabled: !!idUsuario,
  });
}
