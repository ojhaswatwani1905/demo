"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, Sparkles, Gift, ShieldAlert, Settings } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

export function MobileNav() {
  const pathname = usePathname();
  const { setIsSearchOpen } = useFavorites();

  const items = [
    { name: "Home", href: "/", icon: Home },
    { name: "Lobby", href: "/casino", icon: Flame },
    { name: "Games", href: "#search", icon: Sparkles, isAction: true },
    { name: "Promos", href: "/#promotions", icon: Gift },
    { name: "Admin", href: "/admin", icon: Settings },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090E]/95 backdrop-blur-lg border-t border-[#1C1C2A] px-2 py-1.5 shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around">
        {items.map(item => {
          const isActive = !item.isAction && pathname === item.href;
          const Icon = item.icon;

          if (item.isAction) {
            return (
              <button
                key={item.name}
                onClick={() => setIsSearchOpen(true)}
                className="flex flex-col items-center justify-center py-1 px-3 text-[#8E8E9E] hover:text-white transition-colors group relative"
              >
                <div className="w-10 h-10 -mt-5 rounded-full bg-gradient-to-r from-red-600 to-red-800 flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,30,39,0.5)] border-2 border-[#09090E] group-active:scale-95 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-white">Find</span>
              </button>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors relative ${
                isActive ? "text-red-500" : "text-[#7E7E94] hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">
                {item.name}
              </span>
              {isActive && (
                <span className="absolute -top-1 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,30,39,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
