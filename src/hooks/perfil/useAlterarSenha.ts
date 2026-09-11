import { mensagemErroApi } from "@/api/erros";
import { useSessao } from "@/context/SessaoContext";
import { atualizarSenha } from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function useAlterarSenha() {
  const { sessao } = useSessao();

  const [mostrarModal, setMostrarModal] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erroSenha, setErroSenha] = useState("");

  const abrirModal = () => {
    setErroSenha("");
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setMostrarModal(false);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setErroSenha("");
  };

  const { mutateAsync: enviarNovaSenha, isPending: salvandoSenha } = useMutation({
    mutationFn: async () => {
      const id = sessao?.id;
      if (!id) throw new Error("sem_id");

      const resultado = await atualizarSenha(id, senhaAtual, novaSenha);
      if (!resultado.ok) throw resultado;
    },
  });

  const alterarSenha = async () => {
    setErroSenha("");

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setErroSenha("Preencha todos os campos.");
      return false;
    }

    if (novaSenha.length < 6) {
      setErroSenha("Nova senha deve ter ao menos 6 caracteres.");
      return false;
    }

    if (novaSenha !== confirmarSenha) {
      setErroSenha("As senhas não coincidem.");
      return false;
    }

    try {
      await enviarNovaSenha();
      fecharModal();
      return true;
    } catch (erro) {
      if (erro instanceof Error && erro.message === "sem_id") {
        setErroSenha("Não foi possível identificar seu usuário. Tente sair e entrar de novo.");
      } else {
        setErroSenha(mensagemErroApi(erro));
      }
      return false;
    }
  };

  return {
    mostrarModal,
    senhaAtual,
    novaSenha,
    confirmarSenha,
    erroSenha,
    salvandoSenha,

    setSenhaAtual,
    setNovaSenha,
    setConfirmarSenha,

    abrirModal,
    fecharModal,
    alterarSenha,
  };
}
