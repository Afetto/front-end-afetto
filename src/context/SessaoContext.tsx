import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const CHAVE_SESSAO = "@afetto:session";

type ProgressoOnboarding = {
  perfilCompleto: boolean;
  petCadastrado: boolean;
  clinicaVinculada: boolean;
};

type Sessao = {
  id: number;
  email: string;
  nome: string;
  progresso: ProgressoOnboarding;
};

type DadosSessaoContexto = {
  sessao: Sessao | null;
  carregando: boolean;
  entrar: (usuario: { id: number; email: string; nome: string }) => Promise<void>;
  entrarComoDev: () => Promise<void>;
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
        if (sessaoBruta) setSessao(JSON.parse(sessaoBruta));
      })
      .finally(() => setCarregando(false));
  }, []);

  async function entrar(usuario: {
    id: number;
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

  async function entrarComoDev() {
    const sessaoDev: Sessao = {
      id: 0,
      nome: "Dev User",
      email: "dev@afetto.com",
      progresso: {
        perfilCompleto: true,
        petCadastrado: true,
        clinicaVinculada: false,
      },
    };
    await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessaoDev));
    setSessao(sessaoDev);
  }

  async function sair() {
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
    <SessaoContext.Provider value={{ sessao, carregando, entrar, entrarComoDev, sair, concluirEtapa, atualizarPerfil }}>
      {children}
    </SessaoContext.Provider>
  );
}

export function useSessao() {
  return useContext(SessaoContext);
}
