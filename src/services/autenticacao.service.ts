import { api } from "@/api/api";
import {
  DadosAtualizacaoUsuario,
  DadosCadastro,
  ResultadoAtualizacaoUsuario,
  ResultadoAutenticacao,
  ResultadoCadastro,
  ResultadoTrocaSenha,
  UsuarioArmazenado,
} from "@/types/autenticacao.types";

/** Converte uma data de DD/MM/AAAA para o formato ISO YYYY-MM-DD que o backend espera. */
function converterDataParaISO(data: string): string {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

/**
 * Cadastra um novo usuário.
 * POST /usuario
 */
export async function cadastrar(dados: DadosCadastro): Promise<ResultadoCadastro> {
  try {
    await api.post("/usuario", {
      nome: dados.name.trim(),
      cpf: dados.cpf.replace(/\D/g, ""), // só números: "12345678900"
      email: dados.email.trim().toLowerCase(),
      senha: dados.password,
      telefone: `${dados.phoneCode} ${dados.phone}`.replace(/\D/g, ""),
      dataNascimento: converterDataParaISO(dados.birthDate), // DD/MM/AAAA → YYYY-MM-DD
    });

    return { ok: true };
  } catch (error: any) {
    if (error.response?.status === 403) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Autentica o usuário. A sessão é mantida por cookie (JSESSIONID), enviado
 * automaticamente pelo axios (`withCredentials: true`).
 * POST /login
 */
export async function autenticar(
  email: string,
  senha: string
): Promise<ResultadoAutenticacao> {
  try {
    const resposta = await api.post("/login", {
      email: email.trim().toLowerCase(),
      senha,
    });

    // O backend retorna apenas { usuario: "email@...", mensagem: "..." } — sem
    // id/nome/token. Guardamos o e-mail; o perfil completo virá de GET /usuario/me.
    return {
      ok: true,
      usuario: {
        id: 0,
        nome: "",
        email: resposta.data.usuario,
      },
    };
  } catch {
    return { ok: false };
  }
}

/**
 * Busca usuário pelo token JWT (sessão ativa).
 * GET /usuarios/me
 */
export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioArmazenado | null> {
  try {
    const response = await api.get("/usuarios/me");
    const u = response.data;

    return {
      id: u.id,
      nome: u.nome,
      email: u.email,
      cpf: u.cpf,
      codigoDDI: "+55",
      telefone: u.telefone,
      dataNascimento: u.dataNascimento,
    };
  } catch {
    return null;
  }
}

/**
 * Atualiza dados do perfil do usuário.
 * PUT /usuarios/{id}
 */
export async function atualizarUsuario(
  emailAtual: string,
  alteracoes: DadosAtualizacaoUsuario
): Promise<ResultadoAtualizacaoUsuario> {
  try {
    const response = await api.put("/usuarios/me", {
      nome: alteracoes.nome,
      email: alteracoes.email?.trim().toLowerCase(),
      telefone: alteracoes.telefone
        ? `${alteracoes.codigoDDI ?? "+55"} ${alteracoes.telefone}`
        : undefined,
    });

    return {
      ok: true,
      novoEmail: response.data.email ?? emailAtual,
    };
  } catch (error: any) {
    if (error.response?.status === 409) {
      return { ok: false, error: "email_taken" };
    }
    if (error.response?.status === 404) {
      return { ok: false, error: "not_found" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Altera a senha do usuário.
 * POST /usuarios/me/senha
 */
export async function atualizarSenha(
  email: string,
  senhaAtual: string,
  novaSenha: string
): Promise<ResultadoTrocaSenha> {
  try {
    await api.post("/usuarios/me/senha", {
      senhaAtual,
      novaSenha,
    });

    return { ok: true };
  } catch (error: any) {
    if (error.response?.status === 401) {
      return { ok: false, error: "wrong_password" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Encerra a sessão do usuário.
 * A sessão é por cookie — não há token no cliente para remover. A limpeza da
 * sessão local (AsyncStorage) fica a cargo do SessaoContext.
 */
export async function sair(): Promise<void> {
  // Sem operação no cliente por enquanto — placeholder para um POST /logout futuro.
}

/**
 * Envia os dados adicionais do perfil (moradia, pets e endereço).
 * PUT /usuarios/me/perfil-completo
 */
export type DadosPerfilCompleto = {
  tipoMoradia: "casa" | "apartamento";
  telaProtecao: "sim" | "nao";
  quantidadePets: number;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
};

export type ResultadoPerfilCompleto =
  | { ok: true }
  | { ok: false; error: "unknown" };

export async function completarPerfil(
  payload: DadosPerfilCompleto
): Promise<ResultadoPerfilCompleto> {
  try {
    await api.put("/usuarios/me/perfil-completo", payload);
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}
