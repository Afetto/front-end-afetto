// ─── TIPOS — contratos idênticos ao auth.service original ────────────────────

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

export type StoredUser = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneCode: string;
  phone: string;
  birthDate: string;
};

export type AuthResult =
  | { ok: true; user: StoredUser; token: string }
  | { ok: false };

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
};

export type UpdateUserResult =
  | { ok: true; newEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

export type PasswordChangeResult =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };