import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import { createContext, useContext, useEffect, useState } from "react";

const CHAVE_TEMA = "@afetto:tema";

export type PreferenciaTema = "light" | "dark" | "system";

type DadosTemaContexto = {
  tema: PreferenciaTema;
  definirTema: (tema: PreferenciaTema) => void;
};

const TemaContext = createContext<DadosTemaContexto>({} as DadosTemaContexto);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<PreferenciaTema>("system");

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA).then((salvo) => {
      const valor = (salvo as PreferenciaTema | null) ?? "system";
      setTema(valor);
      colorScheme.set(valor);
    });
  }, []);

  function definirTema(novoTema: PreferenciaTema) {
    setTema(novoTema);
    colorScheme.set(novoTema);
    AsyncStorage.setItem(CHAVE_TEMA, novoTema);
  }

  return (
    <TemaContext.Provider value={{ tema, definirTema }}>
      {children}
    </TemaContext.Provider>
  );
}

export function useTema() {
  return useContext(TemaContext);
}
