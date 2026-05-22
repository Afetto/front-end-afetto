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
