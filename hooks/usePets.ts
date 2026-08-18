import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { petService } from "@/services/pet.service";
import { CreatePetInput } from "@/schemas/pet.schema";


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
    return useMutation({
        mutationFn: (data: CreatePetInput) => petService.create(data),
        onSuccess: () => {
            // Invalida a lista — atualiza automaticamente na UI
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

// ─── UPDATE ──────────────────────────────────────────────────────────────────

export function useUpdatePet() {
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<CreatePetInput> }) =>
            petService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────

export function useDeletePet() {
    return useMutation({
        mutationFn: (id: number) => petService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}