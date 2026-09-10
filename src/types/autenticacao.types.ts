// ─── TIPOS — contratos idênticos ao autenticacao.service original ─────────────
// Obs.: os campos de `DadosCadastro` espelham os identificadores do formulário
// (react-hook-form + CadastroSchema) e por isso permanecem em inglês.

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
  nome: string;
  email: string;
  cpf: string;
  codigoDDI: string;
  telefone: string;
  dataNascimento: string;
};

// A API autentica por cookie de sessão (JSESSIONID) — não há token no corpo da
// resposta. O login também não devolve id/nome; virão de GET /usuario/me quando
// o backend expuser esse endpoint.
export type ResultadoAutenticacao =
  | { ok: true; usuario: { id: number; nome: string; email: string } }
  | { ok: false };

export type DadosAtualizacaoUsuario = {
  nome?: string;
  email?: string;
  codigoDDI?: string;
  telefone?: string;
};

export type ResultadoAtualizacaoUsuario =
  | { ok: true; novoEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

export type ResultadoTrocaSenha =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };
