import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { lawyers, CURRENT_LAWYER_ID } from "./mock/data";
import type { Lawyer } from "./types";

/**
 * Client-side auth/session layer.
 * Swap the bodies of `signIn`, `signOut`, `requestReset`, `resetPassword` and
 * `changePassword` for real API calls; the rest of the app only uses this hook.
 */

const STORAGE_KEY = "lexfolio.session";
const SESSION_MINUTES = 45;

const DEMO_EMAIL =
  import.meta.env.VITE_DEMO_EMAIL ?? "a.musa@haldane-partners.law";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD ?? "Chambers2026";

export interface Session {
  lawyerId: string;
  email: string;
  role: "lawyer" | "admin";
  issuedAt: number;
  expiresAt: number;
}

interface AuthValue {
  status: "loading" | "authenticated" | "unauthenticated";
  session: Session | null;
  user: Lawyer | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  requestReset: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  extendSession: () => void;
  expiresAt: number | null;
}

const AuthContext = createContext<AuthValue | null>(null);

const DEMO_EMAIL = "a.musa@haldane-partners.law";
const DEMO_PASSWORD = "Chambers2026";

function readSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (parsed.expiresAt < Date.now()) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AuthValue["status"]>("loading");

  useEffect(() => {
    const existing = readSession();
    setSession(existing);
    setStatus(existing ? "authenticated" : "unauthenticated");
  }, []);

  const persist = useCallback((next: Session | null) => {
    setSession(next);
    setStatus(next ? "authenticated" : "unauthenticated");
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Automatic session expiry handling.
  useEffect(() => {
    if (!session) return;
    const remaining = session.expiresAt - Date.now();
    const timer = setTimeout(() => persist(null), Math.max(remaining, 0));
    return () => clearTimeout(timer);
  }, [session, persist]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await new Promise((r) => setTimeout(r, 500));
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        throw new Error("Invalid email address or password.");
      }
      const now = Date.now();
      persist({
        lawyerId: CURRENT_LAWYER_ID,
        email: DEMO_EMAIL,
        role: "lawyer",
        issuedAt: now,
        expiresAt: now + SESSION_MINUTES * 60_000,
      });
    },
    [persist],
  );

  const value = useMemo<AuthValue>(
    () => ({
      status,
      session,
      user: session ? (lawyers.find((l) => l.id === session.lawyerId) ?? null) : null,
      signIn,
      signOut: () => persist(null),
      requestReset: async (email: string) => {
        await new Promise((r) => setTimeout(r, 500));
        if (!email.includes("@")) throw new Error("Enter a valid email address.");
      },
      resetPassword: async (_token: string, password: string) => {
        await new Promise((r) => setTimeout(r, 500));
        if (password.length < 10) throw new Error("Password must be at least 10 characters.");
      },
      changePassword: async (current: string, next: string) => {
        await new Promise((r) => setTimeout(r, 500));
        if (current !== DEMO_PASSWORD) throw new Error("Current password is incorrect.");
        if (next.length < 10) throw new Error("New password must be at least 10 characters.");
      },
      extendSession: () => {
        if (!session) return;
        persist({ ...session, expiresAt: Date.now() + SESSION_MINUTES * 60_000 });
      },
      expiresAt: session?.expiresAt ?? null,
    }),
    [status, session, signIn, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
