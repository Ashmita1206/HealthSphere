import React, { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "@/services/api";

interface AuthContextType {
  user: { id: string; email: string; name?: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ id: string; email: string; name?: string }>("/user/profile")
      .then((profile) => {
        const email = (profile as any).email || "";
        setUser({ id: (profile as any).id || "", email, name: (profile as any).full_name || "" });
      })
      .catch(() => {
        tokenStore.clear();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    if (!tokenStore.get()) {
      setLoading(false);
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/signup", { email, password, fullName });
      tokenStore.set(res.token);
      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{ token: string; user: { id: string; email: string; name?: string } }>("/auth/login", { email, password });
      tokenStore.set(res.token);
      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    tokenStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
