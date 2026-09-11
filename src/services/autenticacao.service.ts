import { api } from "@/api/api";
import { extrairLista } from "@/api/paginacao";
import {
  DadosAtualizacaoUsuario,
  DadosCadastro,
  ResultadoAtualizacaoUsuario,
  ResultadoAutenticacao,
  ResultadoCadastro,
  ResultadoTrocaSenha,
  UsuarioArmazenado,
} from "@/types/autenticacao.types";

/** Formato do usuário como a API devolve (GET /usuario, GET /usuario/{id}). */
type UsuarioApi = {
  id: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  dataNascimento?: string;
};

/** Converte uma data de DD/MM/AAAA para o formato ISO YYYY-MM-DD que o backend espera. */
function converterDataParaISO(data: string): string {
  const [dia, mes, ano] = data.split("/");
  return `${ano}-${mes}-${dia}`;
}

// Item da listagem GET /usuario — NÃO traz id nem email: só o nome e um link
// HATEOAS com o id embutido no href.
type UsuarioListaItem = { linkUsuario?: { href?: string } };

const MAX_PAGINAS_BUSCA = 15;

function idDoHref(href: string | undefined): string | null {
  if (!href) return null;
  const partes = href.split("/").filter(Boolean);
  return partes[partes.length - 1] || null;
}

async function resolverUsuarioPorEmail(email: string): Promise<UsuarioArmazenado | null> {
  const alvo = email.trim().toLowerCase();
  try {
    let pageNumber = 0;
    let totalPages = 1;

    while (pageNumber < totalPages && pageNumber < MAX_PAGINAS_BUSCA) {
      const { data } = await api.get("/usuario", { params: { pageNumber } });
      totalPages = Number((data as { totalPages?: number })?.totalPages ?? 1);

      for (const item of extrairLista<UsuarioListaItem>(data)) {
        const id = idDoHref(item?.linkUsuario?.href);
        if (!id) continue;
        try {
          const { data: detalhe } = await api.get<UsuarioApi>(`/usuario/${id}`);
          if (detalhe?.email?.trim().toLowerCase() === alvo) {
            return mapearUsuario(detalhe);
          }
        } catch {
          // detalhe indisponível — segue para o próximo
        }
      }

      pageNumber++;
    }
  } catch {
    // listagem indisponível (ex.: sessão não propagou o cookie)
  }
  return null;
}

/**
 * Busca o usuário logado: usa o id quando já temos; senão cai no crawl por e-mail.
 */
export async function buscarUsuarioLogado(
  id: string,
  email: string
): Promise<UsuarioArmazenado | null> {
  if (id) {
    const porId = await buscarUsuarioPorId(id);
    if (porId) return porId;
  }
  return email ? resolverUsuarioPorEmail(email) : null;
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
  } catch (error: any) {
    if (error.response?.status === 403) {
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
  try {
    await api.post("/login", {
      email: email.trim().toLowerCase(),
      senha,
    });

    return {
      ok: true,
      usuario: {
        id: "",
        nome: "",
        email: email.trim().toLowerCase(),
      },
    };
  } catch {
    return { ok: false };
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
 * fazemos merge das alterações antes de enviar.
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
      dataNascimento: atual.dataNascimento,
      email: novoEmail,
      telefone: (alteracoes.telefone ?? atual.telefone ?? "").replace(/\D/g, ""),
    });

    return { ok: true, novoEmail };
  } catch (error: any) {
    if (error.response?.status === 403) {
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
 * Encerra a sessão do usuário.
 * A sessão é por cookie — não há token no cliente para remover. A limpeza da
 * sessão local (AsyncStorage) fica a cargo do SessaoContext.
 */
export async function sair(): Promise<void> {
  // Sem operação no cliente por enquanto — placeholder para um POST /logout futuro.
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
