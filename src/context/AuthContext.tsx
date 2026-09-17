"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: number | string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup", pendingAction?: () => void) => void;
  closeAuthModal: () => void;
  requireAuth: (action: () => void) => boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  onAuthSuccess: (userData: UserProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const checkSession = useCallback(async () => {
    try {
      // Check document.cookie first for instant state
      if (typeof document !== "undefined") {
        const match = document.cookie.match(/betadrix_session=([^;]+)/);
        if (match && match[1]) {
          try {
            const parsed = JSON.parse(decodeURIComponent(match[1]));
            if (parsed && parsed.email) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // fallback to fetch
          }
        }
      }

      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to check auth session:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openAuthModal = useCallback((mode: "signin" | "signup" = "signin", action?: () => void) => {
    setAuthModalMode(mode);
    if (action) {
      setPendingAction(() => action);
    }
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setPendingAction(null);
  }, []);

  const onAuthSuccess = useCallback((userData: UserProfile) => {
    setUser(userData);
    setIsAuthModalOpen(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      // Immediately execute the queued action without page reload
      setTimeout(() => {
        action();
      }, 50);
    }
  }, [pendingAction]);

  const requireAuth = useCallback((action: () => void): boolean => {
    if (user) {
      action();
      return true;
    } else {
      openAuthModal("signin", action);
      return false;
    }
  }, [user, openAuthModal]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      document.cookie = "betadrix_session=; path=/; max-age=0;";
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        requireAuth,
        logout,
        refreshSession: checkSession,
        onAuthSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
