import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '@/lib/firebase';

type ValorAutenticacaoContexto = {
    usuario: User | null;
    carregando: boolean;
    cadastrar: (email: string, password: string) => Promise<void>;
    entrar: (email: string, password: string) => Promise<void>;
    sair: (email: string, password: string) => Promise<void>;
};

const AutenticacaoContext = createContext<ValorAutenticacaoContexto | null>(null);

export function AutenticacaoProvider({ children }: PropsWithChildren) {

    const [usuario, setUsuario] = useState<User | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        onAuthStateChanged(auth, (proximoUsuario) => {
            setUsuario(proximoUsuario);
            setCarregando(false);
            console.log("deu bom");
        });
    }, []);

    async function entrar(email: string, password: string) {}
    async function cadastrar(email: string, password: string) {
        await createUserWithEmailAndPassword(auth, email, password);
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
