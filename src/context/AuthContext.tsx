import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";

type AuthValue = {
  authStaffId: string | null;
  authReady: boolean;
  signIn: (login: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signInDirect: (staffId: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue | null>(null);

const STORAGE_KEY = "melonman.authStaffId";

function readStoredStaffId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Synchronous init — first paint already knows whether a session exists,
  // so the login screen is shown as the default landing instead of a
  // throwaway "loading session" splash.
  const [authStaffId, setAuthStaffId] = useState<string | null>(() => readStoredStaffId());
  const authReady = true;

  const signIn = useCallback<AuthValue["signIn"]>(async (login, password) => {
    if (!supabase) {
      return { ok: false, error: "Supabase не подключён. Проверьте .env." };
    }
    const { data, error } = await supabase
      .from("staff_profiles")
      .select("id")
      .eq("login", login)
      .eq("password", password)
      .maybeSingle();
    if (error) {
      return { ok: false, error: error.message };
    }
    if (!data) {
      return { ok: false, error: "Неверный логин или пароль." };
    }
    try {
      localStorage.setItem(STORAGE_KEY, data.id);
    } catch {
      // ignore
    }
    setAuthStaffId(data.id);
    return { ok: true };
  }, []);

  const signInDirect = useCallback((staffId: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, staffId);
    } catch {
      // ignore
    }
    setAuthStaffId(staffId);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAuthStaffId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ authStaffId, authReady, signIn, signInDirect, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  const v = useContext(AuthContext);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
