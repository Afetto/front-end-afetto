import { useSessao } from "@/context/SessaoContext";
import {
  atualizarUsuario,
  buscarUsuarioLogado,
} from "@/services/autenticacao.service";
import { useCallback, useEffect, useState } from "react";

type DadosOriginais = {
  nome: string;
  email: string;
  telefone: string;
};

export function usePerfil() {
  const { sessao, atualizarPerfil } = useSessao();

  const [idUsuario, setIdUsuario] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const [originais, setOriginais] = useState<DadosOriginais>({
    nome: "",
    email: "",
    telefone: "",
  });

  const [salvando, setSalvando] = useState(false);
  const [erroSalvar, setErroSalvar] = useState("");

  const carregarUsuario = useCallback(async () => {
  
    console.log("Sessão ID:", sessao?.id);
    console.log("Sessão Email:", sessao?.email);
  
    if (!sessao?.id && !sessao?.email) {
      return;
    }
  
    const usuario = await buscarUsuarioLogado(
      sessao?.id ?? "",
      sessao?.email ?? "",
    );
  
    if (!usuario) {
      return;
    }
  
    console.log("Nome retornado:", usuario.nome);
    console.log("Email retornado:", usuario.email);
  
    setIdUsuario(usuario.id);
    setNome(usuario.nome);
    setEmail(usuario.email);
    setTelefone(usuario.telefone);
    setCpf(usuario.cpf);
  
    setOriginais({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
    });
  }, [sessao?.id, sessao?.email]);
  
  useEffect(() => {
    carregarUsuario();
  }, [carregarUsuario]);

  const temAlteracoes =
    nome !== originais.nome ||
    email !== originais.email ||
    telefone !== originais.telefone;

  const salvarPerfil = async () => {
    const id = idUsuario || sessao?.id;

    if (!id) {
      setErroSalvar(
        "Não foi possível identificar seu usuário. Tente sair e entrar de novo.",
      );
      return;
    }

    const nomeLimpo = nome.trim();
    const emailLimpo = email.trim().toLowerCase();
    const telefoneLimpo = telefone.trim();

    if (!nomeLimpo) {
      setErroSalvar("Nome não pode estar vazio.");
      return;
    }

    if (!emailLimpo) {
      setErroSalvar("E-mail não pode estar vazio.");
      return;
    }

    setSalvando(true);
    setErroSalvar("");

    try {
      const resultado = await atualizarUsuario(id, {
        nome: nomeLimpo,
        email: emailLimpo,
        telefone: telefoneLimpo,
      });

      if (!resultado.ok) {
        setErroSalvar(
          resultado.error === "email_taken"
            ? "Este e-mail já está em uso."
            : "Erro ao salvar. Tente novamente.",
        );

        return;
      }

      const alteracoesSessao: {
        nome?: string;
        email?: string;
      } = {};

      if (nomeLimpo !== originais.nome) {
        alteracoesSessao.nome = nomeLimpo;
      }

      if (resultado.novoEmail !== originais.email) {
        alteracoesSessao.email = resultado.novoEmail;
      }

      if (Object.keys(alteracoesSessao).length > 0) {
        await atualizarPerfil(alteracoesSessao);
      }

      setNome(nomeLimpo);
      setEmail(resultado.novoEmail);
      setTelefone(telefoneLimpo);

      setOriginais({
        nome: nomeLimpo,
        email: resultado.novoEmail,
        telefone: telefoneLimpo,
      });

      return true;
    } catch {
      setErroSalvar("Erro ao salvar. Tente novamente.");
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const nomeExibido = nome || sessao?.nome || "Usuário";

  const inicial =
  nomeExibido.trim().charAt(0).toUpperCase() || "U";

  return {
    nome: nomeExibido,
    email,
    telefone,
    cpf,
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