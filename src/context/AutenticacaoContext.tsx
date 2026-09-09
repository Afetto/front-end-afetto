import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '@/lib/firebase';

type ValorAutenticacaoContexto = {
    usuario: User | null;
    carregando: boolean;
    cadastrar: (email: string, senha: string) => Promise<void>;
    entrar: (email: string, senha: string) => Promise<void>;
    sair: (email: string, senha: string) => Promise<void>;
};

const AutenticacaoContext = createContext<ValorAutenticacaoContexto | null>(null);

export function AutenticacaoProvider({ children }: PropsWithChildren) {

    const [usuario, setUsuario] = useState<User | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        onAuthStateChanged(auth, (proximoUsuario) => {
            setUsuario(proximoUsuario);
            setCarregando(false);
        });
    }, []);

    async function entrar(email: string, senha: string) {}
    async function cadastrar(email: string, senha: string) {
        await createUserWithEmailAndPassword(auth, email, senha);
    }
    async function sair() {}

    return (
        <AutenticacaoContext.Provider value={{ usuario, carregando, entrar, cadastrar, sair }}>
            {children}
        </AutenticacaoContext.Provider>
    );
}

export function useAutenticacao() {
    const context = useContext(AutenticacaoContext);

    if (context == null) {
        throw new Error("Ocorreu um erro inesperado!");
    }

    return context;
}
