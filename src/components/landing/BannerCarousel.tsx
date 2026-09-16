"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Gamepad2, ArrowRight, Shield, Zap, Sparkles, Trophy } from "lucide-react";

interface BannerSlide {
  id: string;
  badgeIcon: React.ElementType;
  badge: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonHref: string;
  imageSrc: string;
  imageAlt: string;
  badgeColor: string;
}

const AUTOPLAY_INTERVAL = 4500;

const SLIDES: BannerSlide[] = [
  {
    id: "lobby",
    badgeIcon: Shield,
    badge: "BETADRiX LOBBY",
    title: "BETADRiX GAME LOBBY",
    subtitle: "Play the demo collection.",
    buttonText: "VIEW GAMES",
    buttonHref: "/games",
    imageSrc: "/assets/ui/games_lobby_banner.jpg",
    imageAlt: "BETADRiX Game Lobby",
    badgeColor: "text-red-400 border-red-500/30",
  },
  {
    id: "mines",
    badgeIcon: Sparkles,
    badge: "MINES DEMO",
    title: "MINES",
    subtitle: "Test your strategy.",
    buttonText: "PLAY MINES",
    buttonHref: "/games/mines",
    imageSrc: "/assets/ui/banner_mines.jpg",
    imageAlt: "Mines Demo Game",
    badgeColor: "text-emerald-400 border-emerald-500/30",
  },
  {
    id: "dice",
    badgeIcon: Zap,
    badge: "INSTANT DEMO",
    title: "DICE",
    subtitle: "Fast demo gameplay.",
    buttonText: "PLAY DICE",
    buttonHref: "/games/dice",
    imageSrc: "/assets/ui/banner_dice.jpg",
    imageAlt: "Dice Demo Game",
    badgeColor: "text-red-400 border-red-500/30",
  },
  {
    id: "roulette",
    badgeIcon: Trophy,
    badge: "CASINO DEMO",
    title: "ROULETTE",
    subtitle: "Classic casino-style demo.",
    buttonText: "PLAY ROULETTE",
    buttonHref: "/games/roulette",
    imageSrc: "/assets/ui/banner_roulette.jpg",
    imageAlt: "Roulette Demo Game",
    badgeColor: "text-amber-400 border-amber-500/30",
  },
  {
    id: "plinko",
    badgeIcon: Sparkles,
    badge: "ARCADE DEMO",
    title: "PLINKO",
    subtitle: "Drop. Watch. Play.",
    buttonText: "PLAY PLINKO",
    buttonHref: "/games/plinko",
    imageSrc: "/assets/ui/banner_plinko.jpg",
    imageAlt: "Plinko Demo Game",
    badgeColor: "text-yellow-400 border-yellow-500/30",
  },
  {
    id: "vip",
    badgeIcon: Trophy,
    badge: "VIP DEMO CLUB",
    title: "BETADRiX VIP CLUB",
    subtitle: "Exclusive perks & demo rewards.",
    buttonText: "EXPLORE VIP",
    buttonHref: "/vip",
    imageSrc: "/assets/ui/banner_vip.jpg",
    imageAlt: "BETADRiX VIP Club",
    badgeColor: "text-red-400 border-red-500/30",
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
      }, AUTOPLAY_INTERVAL);
    }
  }, [isHovered]);

  const goToSlide = useCallback(
    (index: number) => {
      setCurrentIndex((index + SLIDES.length) % SLIDES.length);
      resetTimer();
    },
    [resetTimer]
  );

  const prevSlide = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const nextSlide = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  // Autoplay lifecycle
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped left -> next slide
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev slide
      prevSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
    } else if (e.key === "ArrowRight") {
      nextSlide();
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Gaming Slides"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative rounded-xl sm:rounded-2xl bg-[#13151D] border border-[#232632] hover:border-red-500/50 transition-all overflow-hidden select-none group shadow-lg focus:outline-none focus:ring-1 focus:ring-red-500/50"
    >
      {/* Background Slides: Stacked with crossfade transition */}
      <div className="absolute inset-0 z-0">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.imageSrc}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, 1200px"
                className={`object-cover object-center brightness-[0.72] transition-transform duration-1000 ease-out ${
                  isActive ? "scale-100" : "scale-105"
                }`}
              />
              {/* Dark subtle gradient overlay to guarantee text legibility without obscuring artwork */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D13]/95 via-[#0B0D13]/70 sm:via-[#0B0D13]/50 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13]/80 via-transparent to-transparent pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Main Content Area: Retains exact compact layout & responsive padding */}
      <div className="relative z-10 min-h-[155px] sm:min-h-[185px] md:min-h-[220px] p-4 sm:p-6 md:p-8 flex flex-col justify-between max-w-xl">
        <div className="space-y-2 sm:space-y-3">
          {/* Slide Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/70 backdrop-blur-md border text-[9px] sm:text-[10px] font-mono font-bold ${currentSlide.badgeColor}`}
          >
            {React.createElement(currentSlide.badgeIcon, { className: "w-2.5 h-2.5 sm:w-3 sm:h-3" })}
            <span>{currentSlide.badge}</span>
          </div>

          {/* Slide Title */}
          <h2 className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight uppercase leading-snug">
            {currentSlide.title}
          </h2>

          {/* Slide Subtitle */}
          <p className="text-[11px] sm:text-xs md:text-sm text-[#C4CBD8] leading-relaxed max-w-md">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Action Button: Opens specific game or lobby */}
        <div className="pt-2">
          <Link
            href={currentSlide.buttonHref}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-md group/btn cursor-pointer"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>{currentSlide.buttonText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Desktop Manual Navigation Arrows: Accessible & Subtly integrated */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="hidden sm:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 text-white transition-all backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 text-white transition-all backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicator Dots (Bottom Right on desktop, centered/right on mobile) */}
      <div className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? "w-5 bg-red-500" : "w-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
