"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, ArrowRight, Shield } from "lucide-react";

interface BannerSlide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  primaryCta: { text: string; href: string };
  secondaryCta?: { text: string; href: string };
  gamePreviewImg?: string;
  gameName?: string;
}

const SLIDES: BannerSlide[] = [
  {
    id: "welcome",
    badge: "100% DEMO PLAYGROUND",
    title: "BETADRiX DEMO PLATFORM",
    subtitle: "Authorized Turbo Games & Spribe simulation titles with $1,250.00 virtual playground balance. Zero real-money risk.",
    primaryCta: { text: "Play Mines", href: "/games/mines" },
    secondaryCta: { text: "Browse All", href: "/games" },
    gamePreviewImg: "/assets/games/game_card_mines.png",
    gameName: "Mines by Turbo Games"
  },
  {
    id: "turbogames",
    badge: "TURBO GAMES SUITE",
    title: "TACTICAL MINES & INSTANT DICE",
    subtitle: "Navigate dynamic minefield grids or calibrate precision dice sliders with instant simulated outcomes.",
    primaryCta: { text: "Play Dice", href: "/games/dice" },
    secondaryCta: { text: "Play Mines", href: "/games/mines" },
    gamePreviewImg: "/assets/games/game_card_dice.png",
    gameName: "Dice by Turbo Games"
  },
  {
    id: "spribe",
    badge: "SPRIBE CLASSIC COLLECTION",
    title: "EUROPEAN ROULETTE & PLINKO",
    subtitle: "European Roulette table action and physics-driven Plinko pegboard simulations on official engines.",
    primaryCta: { text: "Play Roulette", href: "/games/roulette" },
    secondaryCta: { text: "Play Plinko", href: "/games/plinko" },
    gamePreviewImg: "/assets/games/game_card_roulette.png",
    gameName: "Roulette by Spribe"
  }
];

export function BannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div
      className="relative rounded-xl sm:rounded-2xl bg-[#13151D] border border-[#232632] overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Compact Banner Content */}
      <div className="relative min-h-[145px] sm:min-h-[180px] md:min-h-[220px] p-3.5 sm:p-6 md:p-8 flex flex-col justify-between">
        <div className="absolute inset-0 bg-gradient-to-r from-[#10121A] via-[#141620] to-[#181A24] pointer-events-none" />

        <div className="relative z-10 max-w-xl pr-2 sm:pr-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#1C1F2B] border border-[#2D3344] text-[9px] sm:text-[10px] font-mono font-bold text-red-400 mb-1.5 sm:mb-2.5">
            <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500" />
            <span>{slide.badge}</span>
          </div>

          {/* Title */}
          <h2 className="text-sm sm:text-lg md:text-2xl font-black text-white tracking-tight uppercase leading-snug mb-1 sm:mb-1.5">
            {slide.title}
          </h2>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs md:text-sm text-[#8E95A5] leading-relaxed mb-2.5 sm:mb-4 line-clamp-2 max-w-md">
            {slide.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <Link
              href={slide.primaryCta.href}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{slide.primaryCta.text}</span>
            </Link>

            {slide.secondaryCta && (
              <Link
                href={slide.secondaryCta.href}
                className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-md sm:rounded-lg bg-[#1D202B] hover:bg-[#252937] text-[#C4C9D6] hover:text-white text-[11px] sm:text-xs font-semibold uppercase tracking-wider border border-[#2B3040] transition-colors flex items-center gap-1"
              >
                <span>{slide.secondaryCta.text}</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </Link>
            )}
          </div>
        </div>

        {/* Right side game artwork display on tablet/desktop */}
        {slide.gamePreviewImg && (
          <div className="hidden sm:block absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-52 md:w-64 aspect-[250/90] rounded-lg overflow-hidden bg-[#0A0B0F] border border-[#252938] shadow-md">
            <Image
              src={slide.gamePreviewImg}
              alt={slide.gameName || "Game"}
              fill
              className="object-contain object-center"
              sizes="260px"
              priority={current === 0}
            />
          </div>
        )}
      </div>

      {/* Desktop / Tablet navigation arrows */}
      <button
        onClick={prevSlide}
        className="hidden sm:flex absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-colors"
        aria-label="Previous banner slide"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden sm:flex absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 transition-colors"
        aria-label="Next banner slide"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
        {SLIDES.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-1 rounded-full transition-all ${
              idx === current ? "w-4 bg-red-500" : "w-1 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Jump to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
