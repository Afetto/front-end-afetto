// ─── TIPOS — contratos idênticos ao autenticacao.service original ─────────────
// Obs.: os campos de `DadosCadastro` espelham os identificadores do formulário
// (react-hook-form + CadastroSchema) e por isso permanecem em inglês.

import { TipoErroApi } from "@/api/erros";

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
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  dataNascimento: string;
};

// A API autentica por cookie de sessão (JSESSIONID) — não há token no corpo da
// resposta. O login também não devolve id/nome: resolvemos varrendo GET /usuario
// pelo e-mail (não existe GET /usuario/me).
export type ResultadoAutenticacao =
  | { ok: true; usuario: UsuarioArmazenado }
  | { ok: false; motivo: "credenciais_invalidas" | TipoErroApi };

export type DadosAtualizacaoUsuario = {
  nome?: string;
  email?: string;
  telefone?: string;
};

export type ResultadoAtualizacaoUsuario =
  | { ok: true; novoEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

export type ResultadoTrocaSenha =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };
