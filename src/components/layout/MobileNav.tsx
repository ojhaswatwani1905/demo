"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Gamepad2, ShieldCheck, Menu } from "lucide-react";
import { useUI } from "@/context/UIContext";

export function MobileNav() {
  const pathname = usePathname();
  const { toggleSidebar, isSidebarOpen } = useUI();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Games", href: "/games", icon: Gamepad2 },
    { name: "Fair", href: "/fair", icon: ShieldCheck },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#101217] border-t border-[#232632] px-3 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-lg">
      <div className="grid grid-cols-4 items-center">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
                isActive ? "text-red-500 font-bold" : "text-[#8E95A5] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* Menu item triggers sidebar drawer */}
        <button
          onClick={toggleSidebar}
          className={`flex flex-col items-center justify-center py-1.5 transition-colors ${
            isSidebarOpen ? "text-red-500 font-bold" : "text-[#8E95A5] hover:text-white"
          }`}
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-4 h-4" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
