import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const SESSION_KEY = "@afetto:session";

type SetupProgress = {
  profileCompleted: boolean;
  petRegistered: boolean;
  clinicLinked: boolean;
};

type Session = {
  email: string;
  name: string;
  setup: SetupProgress;
};

type SessionContextData = {
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeStep: (step: keyof SetupProgress) => Promise<void>;
};

const DEFAULT_SETUP: SetupProgress = {
  profileCompleted: false,
  petRegistered: false,
  clinicLinked: false,
};

const SessionContext = createContext<SessionContextData>({} as SessionContextData);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((raw) => {
        if (raw) setSession(JSON.parse(raw));
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string, name?: string): Promise<boolean> {
    // TODO: substituir pela chamada real à API
    const isValid = email.length > 0 && password.length >= 6;
    if (!isValid) return false;

    const derivedName = name ?? email.split("@")[0];
    const newSession: Session = { email, name: derivedName, setup: DEFAULT_SETUP };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return true;
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  async function completeStep(step: keyof SetupProgress) {
    if (!session) return;
    const updated: Session = {
      ...session,
      setup: { ...session.setup, [step]: true },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setSession(updated);
  }

  return (
    <SessionContext.Provider value={{ session, isLoading, login, logout, completeStep }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
