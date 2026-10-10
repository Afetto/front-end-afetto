import { FormAvaliacao } from "@/schemas/clinica.schema";
import { clinicaService } from "@/services/clinica.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados das clínicas parceiras, favoritas e avaliações
export const CHAVE_CLINICAS = "clinicas";
const CHAVE_AVALIACOES = "avaliacoes-clinica";

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useClinicas(filtro: { nome?: string; favoritas?: boolean }) {
  return useQuery({
    queryKey: [CHAVE_CLINICAS, "lista", filtro.nome?.trim() ?? "", !!filtro.favoritas],
    queryFn: () => clinicaService.listar(filtro),
  });
}

export function useClinica(id: string) {
  return useQuery({
    queryKey: [CHAVE_CLINICAS, "detalhe", id],
    queryFn: () => clinicaService.buscarPorId(id),
    enabled: !!id,
  });
}

export function useAvaliacoesClinica(idClinica: string) {
  return useQuery({
    queryKey: [CHAVE_AVALIACOES, idClinica],
    queryFn: () => clinicaService.listarAvaliacoes(idClinica),
    enabled: !!idClinica,
  });
}

// ─── FAVORITAS ───────────────────────────────────────────────────────────────

/** Liga/desliga a favorita; a lista e o detalhe são buscados de novo. */
export function useAlternarFavorita() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, favorita }: { id: string; favorita: boolean }) =>
      favorita ? clinicaService.desfavoritar(id) : clinicaService.favoritar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [CHAVE_CLINICAS] }),
  });
}

// ─── AVALIAÇÕES ──────────────────────────────────────────────────────────────
// Avaliar ou apagar muda a média da clínica: atualiza também lista e detalhe.

export function useAvaliarClinica(idClinica: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: FormAvaliacao) => clinicaService.avaliar(idClinica, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_AVALIACOES, idClinica] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CLINICAS] });
    },
  });
}

export function useApagarAvaliacao(idClinica: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => clinicaService.apagarAvaliacao(idClinica),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_AVALIACOES, idClinica] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CLINICAS] });
    },
  });
}
