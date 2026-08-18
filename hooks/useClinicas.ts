import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { clinicaService } from "@/services/clinica.service";
import { VincularClinicaInput } from "@/schemas/clinica.schema";
const QUERY_KEY = ["clinicas"];

// ─── READ ────────────────────────────────────────────────────────────────────

export function useClinicas() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: clinicaService.getAll,
    });
}

// ─── VINCULAR ────────────────────────────────────────────────────────────────

export function useVincularClinica() {
    return useMutation({
        mutationFn: (data: VincularClinicaInput) => clinicaService.vincular(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

// ─── DESVINCULAR ─────────────────────────────────────────────────────────────

export function useDesvincularClinica() {
    return useMutation({
        mutationFn: (clinicaId: number) => clinicaService.desvincular(clinicaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}