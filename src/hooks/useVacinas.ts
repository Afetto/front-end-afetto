import { DadosVacina } from "@/schemas/vacina.schema";
import { vacinaService } from "@/services/vacina.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["vacinas"];

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useVacinasPet(idPet: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, idPet],
    queryFn: () => vacinaService.listarPorPet(idPet),
    enabled: !!idPet,
  });
}

export function useVacina(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detalhe", id],
    queryFn: () => vacinaService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── CRIAÇÃO ─────────────────────────────────────────────────────────────────

export function useCriarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DadosVacina) => vacinaService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
    },
  });
}

// ─── ATUALIZAÇÃO ─────────────────────────────────────────────────────────────

export function useAtualizarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DadosVacina }) =>
      vacinaService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
    },
  });
}

// ─── REMOÇÃO ─────────────────────────────────────────────────────────────────

export function useDeletarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vacinaService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
    },
  });
}
