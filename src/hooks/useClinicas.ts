import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { CHAVE_CONSULTAS } from "@/hooks/useConsultas";
import { FormAgendamento, FormAvaliacao } from "@/schemas/clinica.schema";
import { clinicaService } from "@/services/clinica.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados das clínicas parceiras, favoritas e avaliações
export const CHAVE_CLINICAS = "clinicas";
const CHAVE_AVALIACOES = "avaliacoes-clinica";
const CHAVE_HORARIOS = "horarios-clinica";

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

// ─── AGENDAMENTO ─────────────────────────────────────────────────────────────

export function useHorariosClinica(idClinica: string) {
  return useQuery({
    queryKey: [CHAVE_HORARIOS, idClinica],
    queryFn: () => clinicaService.horariosLivres(idClinica),
    enabled: !!idClinica,
  });
}

/** Agenda e atualiza o histórico/próximos cuidados do pet, o calendário e os horários livres. */
export function useAgendarConsulta(idClinica: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: FormAgendamento) => clinicaService.agendar(idClinica, dados),
    onSuccess: (_consulta, dados) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, dados.idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_HORARIOS, idClinica] });
    },
    // Horário ocupado por outra pessoa: a lista de livres precisa ser buscada de novo
    onError: () => queryClient.invalidateQueries({ queryKey: [CHAVE_HORARIOS, idClinica] }),
  });
}
