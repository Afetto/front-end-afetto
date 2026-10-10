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
// resposta. O login também não devolve id/nome: logo depois dele o service
// busca quem entrou em GET /usuario/me.
export type ResultadoAutenticacao =
  | { ok: true; usuario: UsuarioArmazenado }
  | { ok: false; motivo: "credenciais_invalidas" | TipoErroApi };

/**
 * Cadastro seguido do login automático (useCadastrar): `usuario` vem
 * preenchido quando o login logo depois do cadastro deu certo, e `null`
 * quando a conta foi criada mas esse login falhou (aí o tutor entra pela
 * tela de login, como antes).
 */
export type ResultadoCadastroComEntrada =
  | { ok: true; usuario: UsuarioArmazenado | null }
  | { ok: false; error: "email_taken" | "unknown" };

export type DadosAtualizacaoUsuario = {
  nome?: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string; // YYYY-MM-DD
  // PUT /usuario/{id} substitui o recurso inteiro e a API exige `senha` em
  // toda requisição (mesmo quando não é uma troca de senha) — por isso é
  // obrigatório aqui, não opcional como os outros campos.
  senha: string;
};

export type ResultadoAtualizacaoUsuario =
  | { ok: true; novoEmail: string }
  | { ok: false; error: "email_taken" | "not_found" | "unknown" };

// Esqueci a senha: a mensagem de erro vem pronta da API (dados que não
// conferem, muitas tentativas) ou é a mensagem padrão de falha de conexão.
export type ResultadoRedefinicaoSenha =
  | { ok: true }
  | { ok: false; mensagem: string };

export type ResultadoTrocaSenha =
  | { ok: true }
  | { ok: false; error: "wrong_password" | "unknown" };
