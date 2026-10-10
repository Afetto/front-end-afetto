import { CHAVE_CALENDARIO } from "@/hooks/useCalendario";
import { CHAVE_CONSULTA_PETS } from "@/hooks/usePets";
import { Pet } from "@/schemas/pet.schema";
import { DadosVacina } from "@/schemas/vacina.schema";
import { notificacaoService } from "@/services/notificacao.service";
import { vacinaService } from "@/services/vacina.service";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

const QUERY_KEY = ["vacinas"];

/** Nome do pet a partir do que já está em cache (detalhe ou lista) — sem requisição nova. */
function nomeDoPetEmCache(queryClient: QueryClient, idPet: string): string | undefined {
  const detalhe = queryClient.getQueryData<Pet>([...CHAVE_CONSULTA_PETS, idPet]);
  if (detalhe?.nome) return detalhe.nome;

  const lista = queryClient.getQueryData<Pet[]>(CHAVE_CONSULTA_PETS);
  return lista?.find((pet) => pet.id === idPet)?.nome;
}

// Sobre os lembretes abaixo (`notificacaoService`): a notificação local é um
// efeito secundário de salvar/excluir a vacina. Ela roda sem bloquear o
// `onSuccess` e o `.catch` vazio é intencional — uma falha ao agendar (ex.:
// permissão negada pelo sistema) nunca pode transformar um salvamento que deu
// certo em erro na tela.

// ─── LEITURA ─────────────────────────────────────────────────────────────────

export function useVacinasPet(idPet: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, idPet],
    queryFn: () => vacinaService.listarPorPet(idPet),
    enabled: !!idPet,
  });
}

export function useVacina(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, "detalhe", id],
    queryFn: () => vacinaService.buscarPorId(id),
    enabled: !!id,
  });
}

// ─── CRIAÇÃO ─────────────────────────────────────────────────────────────────

export function useCriarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DadosVacina) => vacinaService.criar(data),
    onSuccess: (vacina, dados) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService
        .agendarLembreteVacina({
          idVacina: vacina?.id || undefined,
          idPet,
          nomeVacina: dados.nomeVacina,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          dataAplicacao: dados.dataAplicacao,
          proximaDose: dados.proximaDose,
        })
        .catch(() => {});
    },
  });
}

// ─── ATUALIZAÇÃO ─────────────────────────────────────────────────────────────

export function useAtualizarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DadosVacina }) =>
      vacinaService.atualizar(id, data),
    onSuccess: (_vacina, { id, data }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      // Reagenda com as datas novas (ou só cancela, se não sobrou data futura).
      notificacaoService
        .agendarLembreteVacina({
          idVacina: id,
          idPet,
          nomeVacina: data.nomeVacina,
          nomePet: nomeDoPetEmCache(queryClient, idPet),
          dataAplicacao: data.dataAplicacao,
          proximaDose: data.proximaDose,
        })
        .catch(() => {});
    },
  });
}

// ─── REMOÇÃO ─────────────────────────────────────────────────────────────────

export function useDeletarVacina(idPet: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => vacinaService.remover(id),
    onSuccess: (_resultado, id) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, idPet] });
      queryClient.invalidateQueries({ queryKey: [CHAVE_CALENDARIO] });

      notificacaoService.cancelarLembreteVacina(id).catch(() => {});
    },
  });
}
