"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BannerCarousel } from "@/components/landing/BannerCarousel";
import { PopularGamesSlider } from "@/components/landing/PopularGamesSlider";
import { AllGamesSection } from "@/components/landing/AllGamesSection";
import { PromoInfoSection } from "@/components/landing/PromoInfoSection";
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
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 sm:py-6 space-y-6 sm:space-y-8 pb-24 lg:pb-8">
          {/* 1. Large promotional banner carousel at the top with auto-slide, arrows and indicators */}
          <BannerCarousel />

          {/* 2. Popular Games horizontal slider */}
          <PopularGamesSlider />

          {/* 3. All Games section */}
          <AllGamesSection />

          {/* 4. Small promotional/info section */}
          <PromoInfoSection />
        </main>

        {/* 5. Footer */}
        <Footer />
      </div>
    </div>
  );
}
