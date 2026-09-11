import { definirTratadorSessaoExpirada } from "@/api/api";
import { sair as sairService } from "@/services/autenticacao.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const CHAVE_SESSAO = "@afetto:session";

export type ProgressoOnboarding = {
  perfilCompleto: boolean;
  petCadastrado: boolean;
  clinicaVinculada: boolean;
};

type Sessao = {
  id: string;
  email: string;
  nome: string;
  progresso: ProgressoOnboarding;
};

type DadosSessaoContexto = {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (usuario: { id: string; email: string; nome: string }) => Promise<void>;
  sair: () => Promise<void>;
  concluirEtapa: (etapa: keyof ProgressoOnboarding) => Promise<void>;
  atualizarPerfil: (alteracoes: { nome?: string; email?: string }) => Promise<void>;
};

const PROGRESSO_PADRAO: ProgressoOnboarding = {
  perfilCompleto: false,
  petCadastrado: false,
  clinicaVinculada: false,
};

const SessaoContext = createContext<DadosSessaoContexto>({} as DadosSessaoContexto);

export function SessaoProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_SESSAO)
      .then((sessaoBruta) => {
        if (!sessaoBruta) return;
        try {
          const salva = JSON.parse(sessaoBruta);
          // Só aceita se tiver o formato atual — descarta sessões de versões
          // antigas do app (que usavam `name`/`setup` em vez de `nome`/`progresso`).
          if (salva && typeof salva.nome === "string" && salva.progresso) {
            setSessao(salva);
          } else {
            AsyncStorage.removeItem(CHAVE_SESSAO);
          }
        } catch {
          AsyncStorage.removeItem(CHAVE_SESSAO);
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  // Quando qualquer chamada à API responder 401, a sessão local deixa de ser
  // válida — limpamos aqui para que o <RotaProtegida> redirecione ao login.
  useEffect(() => {
    definirTratadorSessaoExpirada(() => {
      AsyncStorage.removeItem(CHAVE_SESSAO);
      setSessao(null);
    });
    return () => definirTratadorSessaoExpirada(null);
  }, []);

  async function entrar(usuario: {
    id: string;
    email: string;
    nome: string;
  }): Promise<void> {
    const novaSessao: Sessao = {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      progresso: PROGRESSO_PADRAO,
    };
    // O cookie de sessão (JSESSIONID) é persistido automaticamente pelo axios;
    // aqui guardamos apenas os dados do usuário para a UI.
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(novaSessao));
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
    setSessao(null);
  }

  async function atualizarPerfil(alteracoes: { nome?: string; email?: string }) {
    if (!sessao) return;
    const atualizada: Sessao = { ...sessao, ...alteracoes };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(atualizada));
    setSessao(atualizada);
  }

  async function concluirEtapa(etapa: keyof ProgressoOnboarding) {
    if (!sessao) return;
    const atualizada: Sessao = {
      ...sessao,
      progresso: { ...sessao.progresso, [etapa]: true },
    };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(atualizada));
    setSessao(atualizada);
  }

  return (
    <SessaoContext.Provider value={{ sessao, carregando, entrar, sair, concluirEtapa, atualizarPerfil }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}
