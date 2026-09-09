import { DadosCadastroPet } from "@/schemas/pet.schema";
import { petService } from "@/services/pet.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["pets"];

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function usePets() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: petService.listar,
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => petService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── CRIAÇÃO ─────────────────────────────────────────────────────────────────

export function useCriarPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DadosCadastroPet) => petService.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ─── ATUALIZAÇÃO ─────────────────────────────────────────────────────────────

export function useAtualizarPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DadosCadastroPet> }) =>
      petService.atualizar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ─── REMOÇÃO ─────────────────────────────────────────────────────────────────

export function useRemoverPet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
