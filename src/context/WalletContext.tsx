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

  const { subscribe } = useRealtime();

  useEffect(() => {
    // Read betadrix_demo_balance with fallback to legacy yourbrand_demo_balance
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

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("betadrix_demo_balance", balance.toFixed(2));
    }
  }, [balance, isInitialized]);

  // Real-time server-to-client balance sync without page reload!
  useEffect(() => {
    const unsubscribe = subscribe("USER_BALANCE_UPDATED", (payload: any) => {
      if (payload && typeof payload.newBalance === "number") {
        const val = Number(payload.newBalance.toFixed(2));
        balanceRef.current = val;
        setBalance(val);
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
