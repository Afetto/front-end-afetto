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
  password: string
): Promise<ResultadoAutenticacao> {
  try {
    const response = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      senha: password,
    });

    const { token, usuario } = response.data;

    // Salva o token para ser usado nos próximos requests
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return {
      ok: true,
      token,
      user: {
        id: usuario.id,
        name: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        phoneCode: "+55",
        phone: usuario.telefone,
        birthDate: usuario.dataNascimento,
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
      name: u.nome,
      email: u.email,
      cpf: u.cpf,
      phoneCode: "+55",
      phone: u.telefone,
      birthDate: u.dataNascimento,
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
  currentEmail: string,
  updates: DadosAtualizacaoUsuario
): Promise<ResultadoAtualizacaoUsuario> {
  try {
    const response = await api.put("/usuarios/me", {
      nome: updates.name,
      email: updates.email?.trim().toLowerCase(),
      telefone: updates.phone
        ? `${updates.phoneCode ?? "+55"} ${updates.phone}`
        : undefined,
    });

    return {
      ok: true,
      newEmail: response.data.email ?? currentEmail,
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
  currentPassword: string,
  newPassword: string
): Promise<ResultadoTrocaSenha> {
  try {
    await api.post("/usuarios/me/senha", {
      senhaAtual: currentPassword,
      novaSenha: newPassword,
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
