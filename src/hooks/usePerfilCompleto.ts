import { useSessao } from "@/context/SessaoContext";
import { DadosPerfilCompleto, perfilCompletoService } from "@/services/perfil-completo.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hooks de dados do "Finalize seu cadastro" (GET/PUT /usuario/me/perfil).
// A chave leva o id do usuário: trocar de conta no mesmo aparelho não mostra
// o perfil da conta anterior.
export const CHAVE_PERFIL_COMPLETO = "perfil-completo";

export function usePerfilCompleto() {
  const { sessao } = useSessao();

  return useQuery({
    queryKey: [CHAVE_PERFIL_COMPLETO, sessao?.id],
    queryFn: () => perfilCompletoService.buscar(),
    enabled: !!sessao?.id,
  });
}

export function useSalvarPerfilCompleto() {
  const { sessao } = useSessao();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosPerfilCompleto) => perfilCompletoService.salvar(dados),
    onSuccess: (resultado) => {
      // A API devolve o perfil já salvo: a Home atualiza sem buscar de novo
      if (resultado.ok) {
        queryClient.setQueryData([CHAVE_PERFIL_COMPLETO, sessao?.id], resultado.perfil);
      }
    },
  });
}
