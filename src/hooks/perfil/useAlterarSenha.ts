import { useSessao } from "@/context/SessaoContext";
import { atualizarSenha } from "@/services/autenticacao.service";
import { useState } from "react";

export function useAlterarSenha() {
  const { sessao } = useSessao();

  const [mostrarModal, setMostrarModal] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [erroSenha, setErroSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

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

    const id = sessao?.id;

    if (!id) {
      setErroSenha(
        "Não foi possível identificar seu usuário. Tente sair e entrar de novo.",
      );
      return false;
    }

    setSalvandoSenha(true);

    try {
      const resultado = await atualizarSenha(
        id,
        senhaAtual,
        novaSenha,
      );

      if (!resultado.ok) {
        setErroSenha(
          resultado.error === "wrong_password"
            ? "Senha atual incorreta."
            : "Erro ao alterar senha. Tente novamente.",
        );

        return false;
      }

      fecharModal();

      return true;
    } catch {
      setErroSenha("Erro ao alterar senha. Tente novamente.");
      return false;
    } finally {
      setSalvandoSenha(false);
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