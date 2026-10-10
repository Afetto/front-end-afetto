import { DadosRemedio } from "@/schemas/remedio.schema";
import { remedioService } from "@/services/remedio.service";
import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados dos remédios de um pet (/remedio)
export const CHAVE_REMEDIOS = "remedios";

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useRemediosPet(idPet: string) {
  return useQuery({
    queryKey: [CHAVE_REMEDIOS, idPet],
    queryFn: () => remedioService.listarPorPet(idPet),
    enabled: !!idPet,
  });
}

export function useRemedio(id: string) {
  return useQuery({
    queryKey: [CHAVE_REMEDIOS, "detalhe", id],
    queryFn: () => remedioService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── ESCRITA ─────────────────────────────────────────────────────────────────
// Cada uma atualiza a lista do pet (histórico e "Próximos cuidados") e o calendário.

export function useCriarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosRemedio) => remedioService.criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}

export function useAtualizarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: DadosRemedio }) =>
      remedioService.atualizar(id, dados),
    onSuccess: (_remedio, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, "detalhe", id] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}

export function useDeletarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remedioService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}
