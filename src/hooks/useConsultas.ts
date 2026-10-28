import { DadosConsulta, LABEL_TIPO_CONSULTA } from "@/schemas/consulta.schema";
import { consultaService } from "@/services/consulta.service";
import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { nomeDoPetEmCache } from "@/hooks/usePets";
import { notificacaoService } from "@/services/notificacao.service";
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

/** Nome da consulta no lembrete: o motivo digitado ou o tipo (ex.: "Consulta", "Exame"). */
function nomeDaConsulta(dados: DadosConsulta): string {
  return dados.descricao?.trim() || LABEL_TIPO_CONSULTA[dados.tipoEvento];
}

// ─── ESCRITA ─────────────────────────────────────────────────────────────────
// Cada uma atualiza a lista do pet (histórico e "Próximos cuidados") e o calendário.
// Lembretes (`notificacaoService`): efeito secundário de salvar/excluir. Rodam
// sem bloquear o `onSuccess` e o `.catch` vazio é intencional — uma falha ao
// agendar (ex.: permissão negada) nunca vira erro de um salvamento que deu certo.

export function useCriarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosConsulta) => consultaService.criar(dados),
    onSuccess: (consulta, dados) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService
        .agendarLembreteConsulta({
          idConsulta: consulta?.id || undefined,
          idPet,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          descricao: nomeDaConsulta(dados),
          data: dados.data,
          hora: dados.hora,
        })
        .catch(() => {});
    },
  });
}

export function useAtualizarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: DadosConsulta }) =>
      consultaService.atualizar(id, dados),
    onSuccess: (_consulta, { id, dados }) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, "detalhe", id] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      // Reagenda com a data nova (ou só cancela, se ela já passou)
      notificacaoService
        .agendarLembreteConsulta({
          idConsulta: id,
          idPet,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          descricao: nomeDaConsulta(dados),
          data: dados.data,
          hora: dados.hora,
        })
        .catch(() => {});
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

      notificacaoService.cancelarLembreteConsulta(id).catch(() => {});
    },
  });
}

export function useDeletarConsulta(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => consultaService.remover(id),
    onSuccess: (_resultado, id) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_CONSULTAS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService.cancelarLembreteConsulta(id).catch(() => {});
    },
  });
}
