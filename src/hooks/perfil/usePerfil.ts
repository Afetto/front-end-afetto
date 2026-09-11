import { mensagemErroApi } from "@/api/erros";
import { useSessao } from "@/context/SessaoContext";
import {
  atualizarUsuario,
  buscarUsuarioPorId,
} from "@/services/autenticacao.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export function usePerfil() {
  const { sessao, atualizarPerfil } = useSessao();
  const queryClient = useQueryClient();

  const { data: usuario } = useQuery({
    queryKey: ["usuario", sessao?.id],
    queryFn: () => buscarUsuarioPorId(sessao!.id),
    enabled: !!sessao?.id,
  });

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erroSalvar, setErroSalvar] = useState("");

  const originais = {
    nome: usuario?.nome ?? "",
    email: usuario?.email ?? "",
    telefone: usuario?.telefone ?? "",
  };

  // Sincroniza os campos editáveis quando os dados do servidor chegam/mudam.
  useEffect(() => {
    if (!usuario) return;
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTelefone(usuario.telefone);
  }, [usuario]);

  const temAlteracoes =
    nome !== originais.nome ||
    email !== originais.email ||
    telefone !== originais.telefone;

  const { mutateAsync: salvar, isPending: salvando } = useMutation({
    mutationFn: async () => {
      const id = sessao?.id;
      const nomeLimpo = nome.trim();
      const emailLimpo = email.trim().toLowerCase();
      const telefoneLimpo = telefone.trim();

      if (!id) {
        throw new Error("sem_id");
      }
      if (!nomeLimpo) {
        throw new Error("nome_vazio");
      }
      if (!emailLimpo) {
        throw new Error("email_vazio");
      }

      const resultado = await atualizarUsuario(id, {
        nome: nomeLimpo,
        email: emailLimpo,
        telefone: telefoneLimpo,
      });

      if (!resultado.ok) {
        throw resultado;
      }

      return { nomeLimpo, telefoneLimpo, novoEmail: resultado.novoEmail };
    },
    onSuccess: async ({ nomeLimpo, telefoneLimpo, novoEmail }) => {
      const alteracoesSessao: { nome?: string; email?: string } = {};
      if (nomeLimpo !== originais.nome) alteracoesSessao.nome = nomeLimpo;
      if (novoEmail !== originais.email) alteracoesSessao.email = novoEmail;

      if (Object.keys(alteracoesSessao).length > 0) {
        await atualizarPerfil(alteracoesSessao);
      }

      setEmail(novoEmail);
      setTelefone(telefoneLimpo);
      queryClient.invalidateQueries({ queryKey: ["usuario", sessao?.id] });
    },
  });

  const salvarPerfil = async () => {
    setErroSalvar("");
    try {
      await salvar();
      return true;
    } catch (erro) {
      if (erro instanceof Error) {
        if (erro.message === "sem_id") {
          setErroSalvar("Não foi possível identificar seu usuário. Tente sair e entrar de novo.");
        } else if (erro.message === "nome_vazio") {
          setErroSalvar("Nome não pode estar vazio.");
        } else if (erro.message === "email_vazio") {
          setErroSalvar("E-mail não pode estar vazio.");
        } else {
          setErroSalvar(mensagemErroApi(erro));
        }
      } else if (erro && typeof erro === "object" && "error" in erro) {
        const codigo = (erro as { error: string }).error;
        setErroSalvar(
          codigo === "email_taken" ? "Este e-mail já está em uso." : "Erro ao salvar. Tente novamente."
        );
      } else {
        setErroSalvar("Erro ao salvar. Tente novamente.");
      }
      return false;
    }
  };

  const nomeExibido = nome || sessao?.nome || "Usuário";
  const inicial = nomeExibido.trim().charAt(0).toUpperCase() || "U";

  return {
    nome: nomeExibido,
    email,
    telefone,
    cpf: usuario?.cpf ?? "",
    inicial,

    setNome,
    setEmail,
    setTelefone,

    temAlteracoes,
    salvando,
    erroSalvar,

    salvarPerfil,
  };
}
