"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface WalletContextType {
  balance: number;
  isWalletModalOpen: boolean;
  openWalletModal: () => void;
  closeWalletModal: () => void;
  demoDeposit: (amount: number) => void;
  resetDemoBalance: () => void;
}

const DEFAULT_DEMO_BALANCE = 1250.00;

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(DEFAULT_DEMO_BALANCE);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("yourbrand_demo_balance");
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
      localStorage.setItem("yourbrand_demo_balance", balance.toFixed(2));
    }
  }, [balance, isInitialized]);

  const openWalletModal = () => setIsWalletModalOpen(true);
  const closeWalletModal = () => setIsWalletModalOpen(false);

  const demoDeposit = (amount: number) => {
    setBalance(prev => prev + amount);
  };

  const resetDemoBalance = () => {
    setBalance(DEFAULT_DEMO_BALANCE);
  };

  return (
    <WalletContext.Provider
      value={{
        balance,
        isWalletModalOpen,
        openWalletModal,
        closeWalletModal,
        demoDeposit,
        resetDemoBalance
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
