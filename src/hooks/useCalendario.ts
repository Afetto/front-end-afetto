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
