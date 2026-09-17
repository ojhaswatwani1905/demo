"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Crown, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  // Ensure MobileNav is never rendered on any admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    {
      name: "Games",
      href: "/games",
      icon: Gamepad2,
      isActive: pathname === "/games" || pathname.startsWith("/games/"),
    },
    {
      name: "VIP",
      href: "/vip",
      icon: Crown,
      isActive: pathname === "/vip",
    },
    {
      name: "Bonus",
      href: "/bonus",
      icon: Sparkles,
      isActive: pathname === "/bonus",
    },
    {
      name: "Fair",
      href: "/fair",
      icon: ShieldCheck,
      isActive: pathname === "/fair",
    },
    {
      name: "Support",
      href: "/support",
      icon: HelpCircle,
      isActive: pathname === "/support",
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0E1016]/95 backdrop-blur-md border-t border-[#222634] px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center py-1 px-1 transition-all group relative"
              aria-label={item.name}
              title={item.name}
            >
              <div
                className={`flex items-center justify-center transition-transform duration-200 ${
                  active ? "scale-110 text-red-500" : "text-[#8E95A5] group-hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span
                className={`text-[10px] font-bold tracking-tight mt-1 transition-colors ${
                  active ? "text-red-500 font-extrabold" : "text-[#8E95A5] group-hover:text-white"
                }`}
              >
                {item.name}
              </span>

              {/* Red active bar underneath with smooth transition */}
              <div
                className={`h-0.5 rounded-full transition-all duration-300 mt-1 ${
                  active ? "w-5 bg-red-500 opacity-100 shadow-[0_0_8px_rgba(239,68,68,0.8)]" : "w-0 bg-transparent opacity-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
