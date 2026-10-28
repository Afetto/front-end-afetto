import { DadosRemedio } from "@/schemas/remedio.schema";
import { remedioService } from "@/services/remedio.service";
import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { nomeDoPetEmCache } from "@/hooks/usePets";
import { notificacaoService } from "@/services/notificacao.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados dos remédios de um pet (/remedio)
export const CHAVE_REMEDIOS = "remedios";

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useRemediosPet(idPet: string) {
  return useQuery({
    queryKey: [CHAVE_REMEDIOS, idPet],
    queryFn: () => remedioService.listarPorPet(idPet),
    enabled: !!idPet,
  });
}

export function useRemedio(id: string) {
  return useQuery({
    queryKey: [CHAVE_REMEDIOS, "detalhe", id],
    queryFn: () => remedioService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── ESCRITA ─────────────────────────────────────────────────────────────────
// Cada uma atualiza a lista do pet (histórico e "Próximos cuidados") e o calendário.
// Lembretes (`notificacaoService`): efeito secundário de salvar/excluir. Rodam
// sem bloquear o `onSuccess` e o `.catch` vazio é intencional — uma falha ao
// agendar (ex.: permissão negada) nunca vira erro de um salvamento que deu certo.

export function useCriarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosRemedio) => remedioService.criar(dados),
    onSuccess: (remedio, dados) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService
        .agendarLembreteRemedio({
          idRemedio: remedio?.id || undefined,
          idPet,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          nomeRemedio: dados.nomeRemedio,
          dataInicio: dados.dataInicio,
        })
        .catch(() => {});
    },
  });
}

export function useAtualizarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: string; dados: DadosRemedio }) =>
      remedioService.atualizar(id, dados),
    onSuccess: (_remedio, { id, dados }) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, "detalhe", id] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      // Reagenda com a data nova (ou só cancela, se o tratamento já começou)
      notificacaoService
        .agendarLembreteRemedio({
          idRemedio: id,
          idPet,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          nomeRemedio: dados.nomeRemedio,
          dataInicio: dados.dataInicio,
        })
        .catch(() => {});
    },
  });
}

export function useDeletarRemedio(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => remedioService.remover(id),
    onSuccess: (_resultado, id) => {
      queryClient.invalidateQueries({ queryKey: [CHAVE_REMEDIOS, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService.cancelarLembreteRemedio(id).catch(() => {});
    },
  });
}
