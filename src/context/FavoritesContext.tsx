"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface FavoritesContextType {
  favorites: string[];
  recentGames: string[];
  toggleFavorite: (gameId: string) => void;
  isFavorite: (gameId: string) => boolean;
  addRecentGame: (gameId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(["crash", "mines"]);
  const [recentGames, setRecentGames] = useState<string[]>(["crash", "roulette"]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem("yourbrand_favorites");
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedRecent = localStorage.getItem("yourbrand_recent_games");
      if (savedRecent) {
        setRecentGames(JSON.parse(savedRecent));
      }
    } catch (e) {
      console.error("Error reading storage", e);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("yourbrand_favorites", JSON.stringify(favorites));
    }
  }, [favorites, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("yourbrand_recent_games", JSON.stringify(recentGames));
    }
  }, [recentGames, isInitialized]);

  const toggleFavorite = (gameId: string) => {
    setFavorites(prev =>
      prev.includes(gameId) ? prev.filter(id => id !== gameId) : [...prev, gameId]
    );
  };

  const isFavorite = (gameId: string) => favorites.includes(gameId);

  const addRecentGame = (gameId: string) => {
    setRecentGames(prev => {
      const filtered = prev.filter(id => id !== gameId);
      return [gameId, ...filtered].slice(0, 5);
    });
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recentGames,
        toggleFavorite,
        isFavorite,
        addRecentGame,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
}
