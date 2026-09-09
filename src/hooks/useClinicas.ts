import { DadosVincularClinica } from "@/schemas/clinica.schema";
import { clinicaService } from "@/services/clinica.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
const QUERY_KEY = ["clinicas"];

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useClinicas() {
    return useQuery({
        queryKey: QUERY_KEY,
        queryFn: clinicaService.listar,
    });
}

// ─── VINCULAR ────────────────────────────────────────────────────────────────

export function useVincularClinica() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DadosVincularClinica) => clinicaService.vincular(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}

// ─── DESVINCULAR ─────────────────────────────────────────────────────────────

export function useDesvincularClinica() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (clinicaId: number) => clinicaService.desvincular(clinicaId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
    });
}