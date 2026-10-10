import { definirTratadorSessaoExpirada } from "@/api/api";
import { buscarUsuarioLogado, sair as sairService } from "@/services/autenticacao.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";

const CHAVE_SESSAO = "@afetto:session";

// Só os dados do usuário para a UI. O progresso do onboarding não fica aqui:
// a Home lê da API ("Perfil completo" em GET /usuario/me/perfil e "Pet
// cadastrado" em GET /pet).
type Sessao = {
  id: string;
  email: string;
  nome: string;
};

type DadosSessaoContexto = {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (usuario: { id: string; email: string; nome: string }) => Promise<void>;
  sair: () => Promise<void>;
  atualizarPerfil: (alteracoes: { nome?: string; email?: string }) => Promise<void>;
};

const SessaoContext = createContext<DadosSessaoContexto>({} as DadosSessaoContexto);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Os dados em cache (pets, avaliações, consultas...) são da conta que estava
  // logada e ficam "frescos" por 5 min (queryClient.ts). Sem limpar ao trocar de
  // conta, a conta nova via os pets e o comentário da anterior como se fossem dela.
  const queryClient = useQueryClient();

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO)
      .then(async (sessaoBruta) => {
        if (!sessaoBruta) return;
        let salva: Sessao | null = null;
        try {
          const parsed = JSON.parse(sessaoBruta);
          // Só aceita se tiver o formato atual — descarta sessões de versões
          // antigas do app (que usavam `name`/`setup` em vez de `nome`).
          if (parsed && typeof parsed.id === "string" && typeof parsed.nome === "string") {
            salva = { id: parsed.id, email: parsed.email ?? "", nome: parsed.nome };
          }
        } catch {
          // JSON inválido — trata como sessão inexistente abaixo.
        }

        if (!salva) {
          await AsyncStorage.removeItem(CHAVE_SESSAO);
          return;
        }

        // ⚠️ O cookie de sessão (JSESSIONID) é uma HttpSession em memória no
        // backend: some quando o servidor reinicia (ex.: instância free do
        // Render "dormindo"), e a API responde 403 (não 401) tanto para
        // sessão inválida quanto para regra de negócio — por isso o
        // interceptor global não consegue distinguir os dois casos (ver
        // api.ts). Sem essa revalidação, um `id` de usuário salvo no
        // AsyncStorage de uma sessão anterior ficava "fantasma": o app
        // continuava mostrando as abas normalmente, mas toda chamada que
        // dependia desse id (ex.: POST /pet com `idUsuario`) quebrava com
        // 500 do backend. Revalidamos aqui, uma vez, no boot do app, com
        // GET /usuario/me: ele só responde se o cookie ainda vale e diz de
        // quem é a sessão. Se não responder, ou se for de outra conta, a
        // sessão salva é descartada.
        const usuario = await buscarUsuarioLogado();
        if (!usuario || usuario.id !== salva.id) {
          await AsyncStorage.removeItem(CHAVE_SESSAO);
          return;
        }

        // Nome e e-mail podem ter mudado (ex.: editados em outro aparelho)
        const atualizada: Sessao = {
          ...salva,
          nome: usuario.nome || salva.nome,
          email: usuario.email || salva.email,
        };
        await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(atualizada));
        setSessao(atualizada);
      })
      .finally(() => setCarregando(false));
  }, []);

  // Quando qualquer chamada à API responder 401, a sessão local deixa de ser
  // válida — limpamos aqui para que o <RotaProtegida> redirecione ao login.
  useEffect(() => {
    definirTratadorSessaoExpirada(() => {
      AsyncStorage.removeItem(CHAVE_SESSAO);
      queryClient.clear();
      setSessao(null);
    });
    return () => definirTratadorSessaoExpirada(null);
  }, [queryClient]);

  async function entrar(usuario: {
    id: string;
    email: string;
    nome: string;
  }): Promise<void> {
    const novaSessao: Sessao = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
    };
    // O cookie de sessão (JSESSIONID) é persistido automaticamente pelo axios;
    // aqui guardamos apenas os dados do usuário para a UI.
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(novaSessao));
    // Conta nova (ou a mesma de novo): nada do cache anterior é reaproveitado
    queryClient.clear();
    setSessao(novaSessao);
  }

  async function sair() {
    try {
      await sairService();
    } catch {
      // Mesmo se o backend falhar (ou não tiver /logout ainda), garantimos
      // que a sessão local seja limpa.
    }
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    queryClient.clear();
    setSessao(null);
  }

  async function atualizarPerfil(alteracoes: { nome?: string; email?: string }) {
    if (!sessao) return;
    const atualizada: Sessao = { ...sessao, ...alteracoes };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(atualizada));
    setSessao(atualizada);
  }

  return (
    <SessaoContext.Provider value={{ sessao, carregando, entrar, sair, atualizarPerfil }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}
