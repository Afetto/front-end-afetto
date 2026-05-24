import AsyncStorage from "@react-native-async-storage/async-storage";

// TODO: quando integrar a API, substituir todas as funções deste arquivo
// por chamadas HTTP (fetch/axios) aos endpoints reais.
// Os contratos de entrada/saída devem permanecer os mesmos.

const USERS_KEY = "@afetto:users";

export type StoredUser = {
  name: string;
  email: string;
  cpf: string;
  phoneCode: string;
  phone: string;
  birthDate: string;
  // TODO: remover quando API existir — hashing será feito no backend
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  cpf: string;
  phoneCode: string;
  phone: string;
  birthDate: string;
  password: string;
};

export type RegisterResult =
  | { ok: true }
  | { ok: false; error: "email_taken" | "unknown" };

export type AuthResult =
  | { ok: true; user: StoredUser }
  | { ok: false };

async function getUsers(): Promise<StoredUser[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as StoredUser[]) : [];
}

/**
 * Cadastra um novo usuário.
 * TODO: substituir por POST /api/auth/register
 */
export async function register(payload: RegisterPayload): Promise<RegisterResult> {
  try {
    const users = await getUsers();
    const emailNormalized = payload.email.trim().toLowerCase();

    const alreadyExists = users.some((u) => u.email === emailNormalized);
    if (alreadyExists) return { ok: false, error: "email_taken" };

    const newUser: StoredUser = {
      name: payload.name.trim(),
      email: emailNormalized,
      cpf: payload.cpf,
      phoneCode: payload.phoneCode,
      phone: payload.phone,
      birthDate: payload.birthDate,
      password: payload.password,
    };

    await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

/**
 * Busca usuário pelo e-mail.
 * TODO: substituir por GET /api/users/me (autenticado via token)
 */
export async function getUserByEmail(email: string): Promise<StoredUser | null> {
  try {
    const users = await getUsers();
    return users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
  } catch {
    return null;
  }
}

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
};

export type UpdateUserResult =
  | { ok: true; newEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

/**
 * Atualiza dados do perfil do usuário.
 * TODO: substituir por PATCH /api/users/me
 */
export async function updateUser(
  currentEmail: string,
  updates: UpdateUserPayload
): Promise<UpdateUserResult> {
  try {
    const users = await getUsers();
    const emailNorm = currentEmail.trim().toLowerCase();
    const idx = users.findIndex((u) => u.email === emailNorm);
    if (idx === -1) return { ok: false, error: "not_found" };

    const newEmail = updates.email ? updates.email.trim().toLowerCase() : emailNorm;
    if (newEmail !== emailNorm) {
      const taken = users.some((u) => u.email === newEmail);
      if (taken) return { ok: false, error: "email_taken" };
    }

    users[idx] = { ...users[idx], ...updates, email: newEmail };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true, newEmail };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };

/**
 * Altera a senha do usuário após validar a senha atual.
 * TODO: substituir por POST /api/users/me/password
 */
export async function updatePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<PasswordChangeResult> {
  try {
    const users = await getUsers();
    const idx = users.findIndex((u) => u.email === email.trim().toLowerCase());
    if (idx === -1) return { ok: false, error: "unknown" };
    if (users[idx].password !== currentPassword) return { ok: false, error: "wrong_password" };
    users[idx] = { ...users[idx], password: newPassword };
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

/**
 * Valida credenciais e retorna o usuário se encontrado.
 * TODO: substituir por POST /api/auth/login → receber token JWT
 */
export async function authenticate(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const users = await getUsers();
    const emailNormalized = email.trim().toLowerCase();

    const user = users.find(
      (u) => u.email === emailNormalized && u.password === password
    );

    if (!user) return { ok: false };
    return { ok: true, user };
  } catch {
    return { ok: false };
  }
}
