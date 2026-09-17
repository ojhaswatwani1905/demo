import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BannerCarousel } from "@/components/landing/BannerCarousel";
import { PopularGamesSlider } from "@/components/landing/PopularGamesSlider";
import { PromoInfoSection } from "@/components/landing/PromoInfoSection";
import { RecentWinsSection } from "@/components/landing/RecentWinsSection";
import { ProviderMarquee } from "@/components/landing/ProviderMarquee";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      {/* 1. Desktop: fixed compact left sidebar; Mobile: drawer */}
      <Sidebar />

      {/* 2. Main content area: offset on desktop by sidebar width (lg:pl-60) */}
      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Navbar />

        {/* Homepage Content */}
        <main className="flex-1 w-full lg:max-w-7xl lg:mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-8 pb-28 lg:pb-12">
          {/* 1. Games / Game Lobby Promotional Banner (Clickable -> /games) */}
          <BannerCarousel />

          {/* 2. Popular Games Only (Mines, Dice, Roulette, Plinko - No Crash) */}
          <PopularGamesSlider />

          {/* 3. Promotional/Info section */}
          <PromoInfoSection />

          {/* 4. Live Activity / Recent Wins at the bottom of main lobby */}
          <RecentWinsSection />

          {/* 5. Continuous 2-Row Provider Marquee */}
          <ProviderMarquee />
        </main>

        {/* 6. Footer */}
        <Footer />
      </div>
    </div>
  );
}
