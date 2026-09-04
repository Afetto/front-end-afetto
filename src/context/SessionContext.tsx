import { api } from "@/api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const SESSION_KEY = "@afetto:session";
const TOKEN_KEY = "@afetto:token";

type SetupProgress = {
  profileCompleted: boolean;
  petRegistered: boolean;
  clinicLinked: boolean;
};

type Session = {
  id: number;
  email: string;
  name: string;
  setup: SetupProgress;
};

type SessionContextData = {
  session: Session | null;
  isLoading: boolean;
  login: (
    user: { id: number; email: string; name: string },
    token: string
  ) => Promise<void>;
  loginDev: () => Promise<void>;
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
    Promise.all([
      AsyncStorage.getItem(SESSION_KEY),
      AsyncStorage.getItem(TOKEN_KEY),
    ])
      .then(([rawSession, token]) => {
        if (rawSession) setSession(JSON.parse(rawSession));
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(
    user: { id: number; email: string; name: string },
    token: string
  ): Promise<void> {
    const newSession: Session = {
      id: user.id,
      email: user.email,
      name: user.name,
      setup: DEFAULT_SETUP,
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setSession(newSession);
  }

  async function loginDev() {
    const devSession: Session = {
      id: 0,
      name: "Dev User",
      email: "dev@afetto.com",
      setup: {
        profileCompleted: true,
        petRegistered: true,
        clinicLinked: false,
      },
    };
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(devSession));
    setSession(devSession);
  }

  async function logout() {
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
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
    <SessionContext.Provider value={{ session, isLoading, login, loginDev, logout, completeStep, updateProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
