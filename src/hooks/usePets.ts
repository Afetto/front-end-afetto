import { DadosCadastroPet } from "@/schemas/pet.schema";
import { petService } from "@/services/pet.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["pets"];

// ─── READ ────────────────────────────────────────────────────────────────────

export function usePets() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: petService.getAll,
  });
}

export function usePet(id: number) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => petService.getById(id),
    enabled: !!id,
  });
}

// ─── CREATE ──────────────────────────────────────────────────────────────────

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DadosCadastroPet) => petService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DadosCadastroPet> }) =>
      petService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
