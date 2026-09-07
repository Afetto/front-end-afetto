import { api } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const SESSION_KEY = "@afetto:session";
const TOKEN_KEY = "@afetto:token";

type ProgressoOnboarding = {
  perfilCompleto: boolean;
  petCadastrado: boolean;
  clinicaVinculada: boolean;
};

type Sessao = {
  id: number;
  email: string;
  name: string;
  progresso: ProgressoOnboarding;
};

type DadosSessaoContexto = {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (
    user: { id: number; email: string; name: string },
    token: string
  ) => Promise<void>;
  entrarComoDevs: () => Promise<void>;
  sair: () => Promise<void>;
  concluirEtapa: (etapa: keyof ProgressoOnboarding) => Promise<void>;
  atualizarPerfil: (updates: { name?: string; email?: string }) => Promise<void>;
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
    Promise.all([
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ])
      .then(([sessaoBruta, token]) => {
        if (sessaoBruta) setSessao(JSON.parse(sessaoBruta));
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      })
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(
    user: { id: number; email: string; name: string },
    token: string
  ): Promise<void> {
    const novaSessao: Sessao = {
      id: user.id,
      email: user.email,
      name: user.name,
      progresso: PROGRESSO_PADRAO,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(novaSessao));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setSessao(novaSessao);
  }

  async function entrarComoDevs() {
    const sessaoDev: Sessao = {
      id: 0,
      name: "Dev User",
      email: "dev@afetto.com",
      progresso: {
        perfilCompleto: true,
        petCadastrado: true,
        clinicaVinculada: false,
      },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessaoDev));
    setSessao(sessaoDev);
  }

  async function sair() {
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
    setSessao(null);
  }

  async function atualizarPerfil(updates: { name?: string; email?: string }) {
    if (!sessao) return;
    const atualizada: Sessao = { ...sessao, ...updates };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(atualizada));
    setSessao(atualizada);
  }

  async function concluirEtapa(etapa: keyof ProgressoOnboarding) {
    if (!sessao) return;
    const atualizada: Sessao = {
      ...sessao,
      progresso: { ...sessao.progresso, [etapa]: true },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(atualizada));
    setSessao(atualizada);
  }

  return (
    <SessaoContext.Provider value={{ sessao, carregando, entrar, entrarComoDevs, sair, concluirEtapa, atualizarPerfil }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}
