// ─── TIPOS — contratos idênticos ao autenticacao.service original ─────────────

export type DadosCadastro = {
  name: string;
  email: string;
  cpf: string;
  phoneCode: string;
  phone: string;
  birthDate: string;
  password: string;
};

export type ResultadoCadastro =
  | { ok: true }
  | { ok: false; error: "email_taken" | "unknown" };

export type UsuarioArmazenado = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phoneCode: string;
  phone: string;
  birthDate: string;
};

export type ResultadoAutenticacao =
  | { ok: true; user: UsuarioArmazenado; token: string }
  | { ok: false };

export type DadosAtualizacaoUsuario = {
  name?: string;
  email?: string;
  phoneCode?: string;
  phone?: string;
};

export type ResultadoAtualizacaoUsuario =
  | { ok: true; newEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

export type ResultadoTrocaSenha =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };
