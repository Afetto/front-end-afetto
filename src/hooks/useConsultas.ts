import { DadosConsulta } from "@/schemas/consulta.schema";
import { consultaService } from "@/services/consulta.service";
import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados das consultas de um pet (/consulta)
export const CHAVE_CONSULTAS = "consultas";

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useConsultasPet(idPet: string) {
  return useQuery({
    queryKey: [CHAVE_CONSULTAS, idPet],
    queryFn: () => consultaService.listarPorPet(idPet),
    enabled: !!idPet,
  });
}

export function useConsulta(id: string) {
  return useQuery({
    queryKey: [CHAVE_CONSULTAS, "detalhe", id],
    queryFn: () => consultaService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── ESCRITA ─────────────────────────────────────────────────────────────────
// Cada uma atualiza a lista do pet (histórico e "Próximos cuidados") e o calendário.

export function useCriarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosConsulta) => consultaService.criar(dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}

export function useAtualizarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: DadosConsulta }) =>
      consultaService.atualizar(id, dados),
    onSuccess: (_consulta, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, "detalhe", id] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}

export function useCancelarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => consultaService.cancelar(id),
    onSuccess: (_consulta, id) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, "detalhe", id] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}

export function useDeletarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => consultaService.remover(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
    },
  });
}
