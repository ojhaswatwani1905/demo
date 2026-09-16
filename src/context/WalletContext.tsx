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
}

const DEFAULT_DEMO_BALANCE = 1250.00;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_DEMO_BALANCE);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const { subscribe } = useRealtime();

  useEffect(() => {
    // Read betadrix_demo_balance with fallback to legacy yourbrand_demo_balance
    const saved = localStorage.getItem("betadrix_demo_balance") || localStorage.getItem("yourbrand_demo_balance");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setBalance(parsed);
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
        setBalance(payload.newBalance);
        localStorage.setItem("betadrix_demo_balance", payload.newBalance.toFixed(2));
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const demoDeposit = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const resetDemoBalance = () => {
    setBalance(DEFAULT_DEMO_BALANCE);
  };

  const setDirectBalance = (amount: number) => {
    setBalance(amount);
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        demoDeposit,
        resetDemoBalance,
        setDirectBalance
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
