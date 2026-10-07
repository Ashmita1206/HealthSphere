import React, { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore, refreshTokenStore } from "@/services/api";

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
    const handleUnauthorized = () => {
      setUser(null);
      setLoading(false);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth:unauthorized", handleUnauthorized);
    }

    if (!tokenStore.get()) {
      setLoading(false);
      return () => {
        if (typeof window !== "undefined") {
          window.removeEventListener("auth:unauthorized", handleUnauthorized);
        }
      };
    }

    api.get<{ id: string; email: string; name?: string }>("/user/profile")
      .then((profile) => {
        const email = (profile as any).email || "";
        setUser({ id: (profile as any).id || "", email, name: (profile as any).full_name || "" });
      })
      .catch(() => {
        tokenStore.clear();
        refreshTokenStore.clear();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth:unauthorized", handleUnauthorized);
      }
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const res = await api.post<{
        token?: string;
        accessToken?: string;
        refreshToken?: string;
        user: { id: string; email: string; name?: string };
      }>("/auth/signup", { email, password, fullName });

      const authToken = res.accessToken || res.token;
      if (authToken) tokenStore.set(authToken);
      if (res.refreshToken) refreshTokenStore.set(res.refreshToken);

      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{
        token?: string;
        accessToken?: string;
        refreshToken?: string;
        user: { id: string; email: string; name?: string };
      }>("/auth/login", { email, password });

      const authToken = res.accessToken || res.token;
      if (authToken) tokenStore.set(authToken);
      if (res.refreshToken) refreshTokenStore.set(res.refreshToken);

      setUser(res.user);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    const currentRefreshToken = refreshTokenStore.get();
    try {
      if (currentRefreshToken) {
        await api.post("/auth/logout", { refreshToken: currentRefreshToken });
      }
    } catch {
      // Backend logout failure still safely clears local authenticated state
    } finally {
      tokenStore.clear();
      refreshTokenStore.clear();
      setUser(null);
    }
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
