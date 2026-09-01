import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
    user: User | null;
    isLoading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: (email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {

    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        onAuthStateChanged(auth, (nextUser) => {
            setUser(nextUser);
            setIsLoading(false);
            console.log("deu bom");
        });
    }, []);

    async function signIn(email: string, password: string) {}
    async function signUp(email: string, password: string) {
        await createUserWithEmailAndPassword(auth, email, password);
    }
    async function signOut() {}

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context == null) {
        throw new Error("Ocorreu um erro inesperado!");
    }

    return context;
}