import { DadosCadastroPet } from "@/schemas/pet.schema";
import { notificacaoService } from "@/services/notificacao.service";
import { petService } from "@/services/pet.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const QUERY_KEY = ["pets"];

/** Chave do cache de pets, para outros hooks lerem o que já foi carregado (ex.: nome do pet). */
export const CHAVE_CONSULTA_PETS = QUERY_KEY;

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function usePets() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: petService.listar,
  });
}

export function usePet(id: string) {
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
    mutationFn: ({ id, data }: { id: string; data: DadosCadastroPet }) =>
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
    mutationFn: (id: string) => petService.remover(id),
    onSuccess: (_resultado, id) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });

      // Sem o pet, os lembretes das vacinas dele não fazem mais sentido. Roda
      // sem bloquear: falhar aqui não pode virar erro na exclusão do pet.
      notificacaoService.cancelarLembretesDoPet(id).catch(() => {});
    },
  });
}
