"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReferenceHero } from "@/components/landing/ReferenceHero";
import { FeaturedGames } from "@/components/landing/FeaturedGames";
import { PlatformTransition } from "@/components/landing/PlatformTransition";
import { EmbeddedCasinoPlatform } from "@/components/landing/EmbeddedCasinoPlatform";
import { GameShowcase } from "@/components/landing/GameShowcase";
import { FeatureSection } from "@/components/landing/FeatureSection";
import { MobileShowcase } from "@/components/landing/MobileShowcase";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F7] overflow-x-hidden">
      {/* Mobile Off-canvas sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* 1. TOP NAVBAR */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      <main className="flex-1">
        {/* 2. CINEMATIC HERO (REFERENCE 1) */}
        <ReferenceHero />

        {/* 3. FEATURED / INTRODUCTION */}
        <FeaturedGames />

        {/* 4. VISUAL TRANSITION */}
        <PlatformTransition />

        {/* 5. CASINO LOBBY PLATFORM SECTION (REFERENCE 3) */}
        <EmbeddedCasinoPlatform />

        {/* 6. GAME SHOWCASE / EDITORIAL ASYMMETRICAL CONTENT */}
        <GameShowcase />

        {/* 7. PLATFORM FEATURES & MOBILE SHOWCASE */}
        <FeatureSection />
        <MobileShowcase />

        {/* 8. FINAL CINEMATIC CTA */}
        <FinalCTA />
      </main>

      {/* 9. GLOBAL FOOTER WITH COMPLIANCE DEMO NOTICE */}
      <Footer />
    </div>
  );
}
