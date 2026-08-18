import { api } from "@/lib/api";
import { AuthResult, PasswordChangeResult, RegisterPayload, RegisterResult, StoredUser, UpdateUserPayload, UpdateUserResult } from "@/types/auth.types";


/**
 * Cadastra um novo usuário.
 * POST /usuarios
 */
export async function register(payload: RegisterPayload): Promise<RegisterResult> {
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
export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
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
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
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
export async function updateUser(
  currentEmail: string,
  updates: UpdateUserPayload
): Promise<UpdateUserResult> {
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
export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<PasswordChangeResult> {
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
export async function logout(): Promise<void> {
  delete api.defaults.headers.common["Authorization"];
}