import { mensagemErroApi } from "@/api/erros";
import { atualizarSenha } from "@/services/autenticacao.service";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export function useAlterarSenha() {
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

  // A API confere a senha atual (PUT /usuario/me/senha); errada → a mensagem dela aparece no modal
  const { mutateAsync: enviarNovaSenha, isPending: salvandoSenha } = useMutation({
    mutationFn: async (senhas: { senhaAtual: string; novaSenha: string }) => {
      const resultado = await atualizarSenha(senhas.senhaAtual, senhas.novaSenha);
      if (!resultado.ok) throw new Error(resultado.mensagem);
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

    if (novaSenha === senhaAtual) {
      setErroSenha("A nova senha precisa ser diferente da atual.");
      return false;
    }

    try {
      await enviarNovaSenha({ senhaAtual, novaSenha });
      fecharModal();
      return true;
    } catch (erro) {
      setErroSenha(erro instanceof Error && erro.message ? erro.message : mensagemErroApi(erro));
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
