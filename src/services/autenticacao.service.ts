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


/**
 * Cadastra um novo usuário.
 * POST /usuarios
 */
export async function cadastrar(payload: DadosCadastro): Promise<ResultadoCadastro> {
  try {
    await api.post("/usuarios", {
      nome: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      cpf: payload.cpf,
      telefone: `${payload.phoneCode} ${payload.phone}`,
      dataNascimento: payload.birthDate,
      senha: payload.password,
    });

    return { ok: true };
  } catch (error: any) {
    if (error.response?.status === 409) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Valida credenciais e retorna o usuário + token JWT.
 * POST /auth/login
 */
export async function autenticar(
  email: string,
  senha: string
): Promise<ResultadoAutenticacao> {
  try {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      senha,
    });

    const { token, usuario } = response.data;

    // Salva o token para ser usado nos próximos requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return {
      ok: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        codigoDDI: "+55",
        telefone: usuario.telefone,
        dataNascimento: usuario.dataNascimento,
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
 * Remove o token do header global.
 */
export async function sair(): Promise<void> {
  delete api.defaults.headers.common["Authorization"];
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
