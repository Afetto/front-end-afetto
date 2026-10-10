import { api } from "@/api/api";
import { classificarErro, mensagemDaApi } from "@/api/erros";
import { EsqueciSenhaInput } from "@/schemas/esqueci-senha.schema";
import { converterDataParaISO } from "@/utils/data";
import {
  DadosAtualizacaoUsuario,
  DadosCadastro,
  ResultadoAtualizacaoUsuario,
  ResultadoAutenticacao,
  ResultadoCadastro,
  ResultadoRedefinicaoSenha,
  ResultadoTrocaSenha,
  UsuarioArmazenado,
} from "@/types/autenticacao.types";
import axios from "axios";

/** Formato do usuário como a API devolve (GET /usuario/me, GET /usuario/{id}). */
type UsuarioApi = {
  id: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
};

/**
 * Quem está logado nesta sessão.
 * GET /usuario/me — o backend descobre o usuário pelo cookie de sessão, sem
 * precisar de id. Devolve `null` se a sessão não vale mais ou se a API não
 * respondeu.
 */
export async function buscarUsuarioLogado(): Promise<UsuarioArmazenado | null> {
  try {
    const { data } = await api.get<UsuarioApi>("/usuario/me");
    return data?.id ? mapearUsuario(data) : null;
  } catch {
    return null;
  }
}

function mapearUsuario(u: UsuarioApi): UsuarioArmazenado {
  return {
    id: u.id,
    nome: u.nome ?? "",
    email: u.email ?? "",
    cpf: u.cpf ?? "",
    telefone: u.telefone ?? "",
    dataNascimento: u.dataNascimento ?? "",
  };
}

/**
 * Cadastra um novo usuário.
 * POST /usuario
 */
export async function cadastrar(dados: DadosCadastro): Promise<ResultadoCadastro> {
  try {
    await api.post("/usuario", {
      nome: dados.name.trim(),
      cpf: dados.cpf.replace(/\D/g, ""), // só números: "12345678900"
      email: dados.email.trim().toLowerCase(),
      senha: dados.password,
      telefone: `${dados.phoneCode} ${dados.phone}`.replace(/\D/g, ""),
      dataNascimento: converterDataParaISO(dados.birthDate), // DD/MM/AAAA → YYYY-MM-DD
    });

    return { ok: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return { ok: false, error: "email_taken" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Autentica o usuário. A sessão é mantida por cookie (JSESSIONID), enviado
 * automaticamente pelo axios (`withCredentials: true`).
 * POST /login
 */
export async function autenticar(
  email: string,
  senha: string
): Promise<ResultadoAutenticacao> {
  const emailNormalizado = email.trim().toLowerCase();

  try {
    await api.post("/login", { email: emailNormalizado, senha });
  } catch (error) {
    // ⚠️ CONTORNO DE LACUNA DA API: com e-mail ou senha errados (ou uma conta
    // que não existe mais — o banco H2 é zerado a cada reinício da API), o
    // back end não trata a falha do login e ela chega como 403, não 401. O
    // /login é liberado para todos e não tem CSRF, então um 403 aqui só pode
    // ser isso. Sem tratar, a tela mostrava "Algo deu errado".
    const status = axios.isAxiosError(error) ? error.response?.status : undefined;
    if (status === 400 || status === 401 || status === 403) {
      return { ok: false, motivo: "credenciais_invalidas" };
    }
    return { ok: false, motivo: classificarErro(error) };
  }

  // O /login não devolve os dados do usuário: quem entrou vem de
  // GET /usuario/me, já com o cookie que o login acabou de criar. Se essa
  // chamada falhar, o login não segue: entrar sem o id deixaria a sessão
  // quebrada (cadastrar pet, por exemplo, precisa dele).
  try {
    const { data } = await api.get<UsuarioApi>("/usuario/me");
    if (!data?.id) {
      return { ok: false, motivo: "desconhecido" };
    }
    return { ok: true, usuario: mapearUsuario(data) };
  } catch (error) {
    return { ok: false, motivo: classificarErro(error) };
  }
}

/**
 * Busca o usuário da sessão pelo id (UUID).
 * GET /usuario/{id}
 */
export async function buscarUsuarioPorId(id: string): Promise<UsuarioArmazenado | null> {
  if (!id) return null;
  try {
    const response = await api.get<UsuarioApi>(`/usuario/${id}`);
    return mapearUsuario(response.data);
  } catch {
    return null;
  }
}

/**
 * Atualiza dados do perfil do usuário.
 * PUT /usuario/{id} — substitui o recurso inteiro, então buscamos o atual e
 * fazemos merge das alterações antes de enviar. A API também exige `senha`
 * em toda chamada (mesmo quando não é troca de senha).
 *
 * ⚠️ Esse `senha` NÃO é validado contra a senha atual — o backend simplesmente
 * define esse valor como a nova senha (mesmo comportamento de `atualizarSenha`
 * abaixo). Ou seja, não existe como "confirmar" a senha atual sem risco de
 * alterá-la: se o valor enviado não for a senha real, a senha da conta muda
 * para esse valor sem aviso.
 *
 * NÃO tente "verificar" a senha chamando POST /login antes deste PUT: login
 * (sucesso OU falha) sempre devolve um `Set-Cookie` novo, e no app o cliente
 * HTTP persiste esse cookie automaticamente — isso substitui silenciosamente
 * o cookie de sessão válido do usuário por um outro (inválido, se a senha
 * verificada estiver errada), derrubando a sessão inteira. Esse bug já
 * aconteceu aqui: uma função `verificarSenha` chegou a existir e quebrou o
 * app inteiro (perfil, pets, tudo que depende de sessão) na primeira vez que
 * alguém errou a senha de confirmação. Foi removida.
 */
export async function atualizarUsuario(
  id: string,
  alteracoes: DadosAtualizacaoUsuario
): Promise<ResultadoAtualizacaoUsuario> {
  try {
    const { data: atual } = await api.get<UsuarioApi>(`/usuario/${id}`);
    const novoEmail = (alteracoes.email ?? atual.email ?? "").trim().toLowerCase();

    await api.put(`/usuario/${id}`, {
      nome: alteracoes.nome ?? atual.nome,
      cpf: (atual.cpf ?? "").replace(/\D/g, ""),
      dataNascimento: alteracoes.dataNascimento ?? atual.dataNascimento,
      email: novoEmail,
      telefone: (alteracoes.telefone ?? atual.telefone ?? "").replace(/\D/g, ""),
      senha: alteracoes.senha,
    });

    return { ok: true, novoEmail };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      return { ok: false, error: "email_taken" };
    }
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { ok: false, error: "not_found" };
    }
    return { ok: false, error: "unknown" };
  }
}

/**
 * Altera a senha do usuário.
 * A API não tem endpoint dedicado — enviamos via PUT /usuario/{id} com o campo
 * `senha`. Não há verificação de "senha atual" no backend, então `senhaAtual`
 * é ignorada por ora.
 */
export async function atualizarSenha(
  id: string,
  _senhaAtual: string,
  novaSenha: string
): Promise<ResultadoTrocaSenha> {
  try {
    const { data: atual } = await api.get<UsuarioApi>(`/usuario/${id}`);

    await api.put(`/usuario/${id}`, {
      nome: atual.nome,
      cpf: (atual.cpf ?? "").replace(/\D/g, ""),
      dataNascimento: atual.dataNascimento,
      email: atual.email,
      telefone: (atual.telefone ?? "").replace(/\D/g, ""),
      senha: novaSenha,
    });

    return { ok: true };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

/**
 * Esqueci a senha (sem e-mail de recuperação): a API confere e-mail, CPF e
 * data de nascimento do cadastro e grava a senha nova. Não precisa de login.
 * POST /senha/redefinir → 204. Dado que não confere → 400; 5 erros seguidos
 * com o mesmo e-mail → 429 por 15 minutos (as mensagens vêm prontas da API).
 */
export async function redefinirSenha(dados: EsqueciSenhaInput): Promise<ResultadoRedefinicaoSenha> {
  try {
    await api.post("/senha/redefinir", {
      email: dados.email.trim().toLowerCase(),
      cpf: dados.cpf.replace(/\D/g, ""),
      dataNascimento: converterDataParaISO(dados.birthDate), // DD/MM/AAAA → YYYY-MM-DD
      novaSenha: dados.password,
    });
    return { ok: true };
  } catch (error) {
    return { ok: false, mensagem: mensagemDaApi(error) };
  }
}

/**
 * Encerra a sessão do usuário no servidor.
 * A sessão é por cookie — não há token no cliente para remover, só o cookie
 * (que o navegador/WebView já descarta ao expirar). Tentamos invalidar no
 * backend via POST /logout; se o endpoint não existir ou falhar, o
 * SessaoContext garante a limpeza local mesmo assim.
 */
export async function sair(): Promise<void> {
  try {
    await api.post("/logout");
  } catch {
    // Backend pode não ter /logout implementado ainda, ou a sessão já
    // estava inválida — a limpeza local acontece de qualquer forma.
  }
}
