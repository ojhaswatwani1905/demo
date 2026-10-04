"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRealtime } from "@/context/RealtimeContext";

interface WalletContextType {
  balance: number;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  demoDeposit: (amount: number) => void;
  resetDemoBalance: () => void;
  setDirectBalance: (amount: number) => void;
  deductBalance: (amount: number) => number | null;
  creditBalance: (amount: number) => number;
}

const DEFAULT_DEMO_BALANCE = 1250.00;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_DEMO_BALANCE);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const balanceRef = React.useRef<number>(DEFAULT_DEMO_BALANCE);

  // Keep balanceRef synchronized with state
  useEffect(() => {
    balanceRef.current = balance;
  }, [balance]);

  const { subscribe, reconnectCount } = useRealtime();
  const lastVersionRef = React.useRef<number>(0);
  const lastTimestampRef = React.useRef<number>(0);

  // Authoritative sync from localStorage / server fallback
  const syncAuthoritativeBalance = React.useCallback(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("betadrix_demo_balance") || localStorage.getItem("yourbrand_demo_balance");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed !== balanceRef.current) {
        balanceRef.current = parsed;
        setBalance(parsed);
      }
    }
  }, []);

  useEffect(() => {
    // Initial load
    const saved = localStorage.getItem("betadrix_demo_balance") || localStorage.getItem("yourbrand_demo_balance");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setBalance(parsed);
        balanceRef.current = parsed;
      }
    }
    setIsInitialized(true);
  }, []);

  // Multi-tab synchronization via window storage event (No Refresh Required across tabs)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if ((e.key === "betadrix_demo_balance" || e.key === "yourbrand_demo_balance") && e.newValue !== null) {
        const parsed = parseFloat(e.newValue);
        if (!isNaN(parsed) && parsed !== balanceRef.current) {
          balanceRef.current = parsed;
          setBalance(parsed);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Reconnect handling: re-verify balance after SSE reconnection
  useEffect(() => {
    if (reconnectCount > 0) {
      syncAuthoritativeBalance();
    }
  }, [reconnectCount, syncAuthoritativeBalance]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("betadrix_demo_balance", balance.toFixed(2));
    }
  }, [balance, isInitialized]);

  // Real-time server-to-client balance sync without page reload!
  useEffect(() => {
    const unsubscribe = subscribe("USER_BALANCE_UPDATED", (payload: any) => {
      if (!payload) return;

      const rawBalance = payload.newBalance ?? payload.new_balance;
      if (typeof rawBalance !== "number" || isNaN(rawBalance)) return;

      // Duplicate & out-of-order race condition protection:
      // If payload has a version or timestamp, ensure it is not older than what was already processed
      if (typeof payload.version === "number") {
        if (payload.version < lastVersionRef.current) {
          console.warn("[WalletContext] Ignoring stale balance event by version:", payload.version, "<", lastVersionRef.current);
          return;
        }
        lastVersionRef.current = payload.version;
      }

      if (payload.timestamp) {
        const eventTs = new Date(payload.timestamp).getTime();
        if (!isNaN(eventTs)) {
          if (eventTs < lastTimestampRef.current) {
            console.warn("[WalletContext] Ignoring stale balance event by timestamp:", payload.timestamp);
            return;
          }
          lastTimestampRef.current = eventTs;
        }
      }

      const val = Number(rawBalance.toFixed(2));
      balanceRef.current = val;
      setBalance(val);
      if (typeof window !== "undefined") {
        localStorage.setItem("betadrix_demo_balance", val.toFixed(2));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const demoDeposit = (amount: number) => {
    setBalance(prev => {
      const next = Number((prev + amount).toFixed(2));
      balanceRef.current = next;
      return next;
    });
  };

  const resetDemoBalance = () => {
    balanceRef.current = DEFAULT_DEMO_BALANCE;
    setBalance(DEFAULT_DEMO_BALANCE);
  };

  const setDirectBalance = (amount: number) => {
    const val = Number(amount.toFixed(2));
    balanceRef.current = val;
    setBalance(val);
  };

  const deductBalance = React.useCallback((amount: number): number | null => {
    const roundedAmount = Number(amount.toFixed(2));
    if (isNaN(roundedAmount) || roundedAmount <= 0) return null;

    const current = Number(balanceRef.current.toFixed(2));
    if (current < roundedAmount) {
      return null;
    }
    const next = Number((current - roundedAmount).toFixed(2));
    balanceRef.current = next;
    setBalance(next);
    return next;
  }, []);

  const creditBalance = React.useCallback((amount: number): number => {
    const roundedAmount = Number(amount.toFixed(2));
    if (isNaN(roundedAmount) || roundedAmount < 0) return balanceRef.current;

    const current = Number(balanceRef.current.toFixed(2));
    const next = Number((current + roundedAmount).toFixed(2));
    balanceRef.current = next;
    setBalance(next);
    return next;
  }, []);

  return (
    <WalletContext.Provider
      value={{
        balance,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        demoDeposit,
        resetDemoBalance,
        setDirectBalance,
        deductBalance,
        creditBalance
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
