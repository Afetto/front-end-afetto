import { useSessao } from "@/context/SessaoContext";
import { EditarPerfilInput } from "@/schemas/editar-perfil.schema";
import {
  atualizarUsuario,
  buscarUsuarioPorId,
} from "@/services/autenticacao.service";
import { converterDataParaISO } from "@/utils/data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePerfil() {
  const { sessao, atualizarPerfil } = useSessao();
  const queryClient = useQueryClient();

  const {
    data: usuario,
    isLoading: carregando,
    isError: temErro,
    refetch: refazer,
  } = useQuery({
    queryKey: ["usuario", sessao?.id],
    queryFn: () => buscarUsuarioPorId(sessao!.id),
    enabled: !!sessao?.id,
  });

  const { mutate: salvarPerfil, isPending: salvando } = useMutation<
    { ok: true; novoEmail: string },
    unknown,
    EditarPerfilInput
  >({
    mutationFn: async (dados) => {
      const id = sessao?.id;
      if (!id) throw new Error("sem_id");

      // Não há como verificar a senha atual sem risco (ver comentário em
      // autenticacao.service.ts#atualizarUsuario) — enviamos o valor digitado
      // direto, exatamente como o usuário confirmou na tela.
      const resultado = await atualizarUsuario(id, {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone.replace(/\D/g, ""),
        dataNascimento: converterDataParaISO(dados.dataNascimento),
        senha: dados.senha,
      });

      if (!resultado.ok) throw resultado;
      return resultado;
    },
    onSuccess: async (resultado, dados) => {
      const alteracoesSessao: { nome?: string; email?: string } = {};
      if (dados.nome !== usuario?.nome) alteracoesSessao.nome = dados.nome;
      if (resultado.novoEmail !== usuario?.email) alteracoesSessao.email = resultado.novoEmail;

      if (Object.keys(alteracoesSessao).length > 0) {
        await atualizarPerfil(alteracoesSessao);
      }

      queryClient.invalidateQueries({ queryKey: ["usuario", sessao?.id] });
    },
  });

  const nomeExibido = usuario?.nome || sessao?.nome || "Usuário";
  const inicial = nomeExibido.trim().charAt(0).toUpperCase() || "U";

  return {
    usuario,
    carregando,
    temErro,
    refazer,

    nomeExibido,
    inicial,

    salvarPerfil,
    salvando,
  };
}
