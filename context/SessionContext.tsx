import AsyncStorage from "@react-native-async-storage/async-storage";
import { authenticate } from "@/services/auth.service";
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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  completeStep: (step: keyof SetupProgress) => Promise<void>;
  updateProfile: (updates: { name?: string; email?: string }) => Promise<void>;
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

  async function login(email: string, password: string): Promise<boolean> {
    // TODO: quando API existir, authenticate() já retornará o token — salvar token em vez da senha
    const result = await authenticate(email, password);
    if (!result.ok) return false;

    const newSession: Session = {
      email: result.user.email,
      name: result.user.name,
      setup: DEFAULT_SETUP,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
    return true;
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    setSession(null);
  }

  async function updateProfile(updates: { name?: string; email?: string }) {
    if (!session) return;
    const updated: Session = { ...session, ...updates };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updated));
    setSession(updated);
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
    <SessionContext.Provider value={{ session, isLoading, login, logout, completeStep, updateProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
