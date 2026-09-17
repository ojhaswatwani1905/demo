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

// All banner slides navigate exclusively to /games (Games Lobby)
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
    subtitle: "Test your strategy in the lobby.",
    buttonText: "EXPLORE GAMES",
    buttonHref: "/games",
    imageSrc: "/assets/ui/banner_mines.jpg",
    imageAlt: "Mines Demo Game",
    badgeColor: "text-emerald-400 border-emerald-500/30",
  },
  {
    id: "dice",
    badgeIcon: Zap,
    badge: "INSTANT DEMO",
    title: "DICE",
    subtitle: "Fast demo gameplay in the lobby.",
    buttonText: "OPEN GAMES LOBBY",
    buttonHref: "/games",
    imageSrc: "/assets/ui/banner_dice.jpg",
    imageAlt: "Dice Demo Game",
    badgeColor: "text-red-400 border-red-500/30",
  },
  {
    id: "roulette",
    badgeIcon: Trophy,
    badge: "CASINO DEMO",
    title: "ROULETTE",
    subtitle: "Classic casino-style demo collection.",
    buttonText: "VIEW GAMES",
    buttonHref: "/games",
    imageSrc: "/assets/ui/banner_roulette.jpg",
    imageAlt: "Roulette Demo Game",
    badgeColor: "text-amber-400 border-amber-500/30",
  },
  {
    id: "plinko",
    badgeIcon: Sparkles,
    badge: "ARCADE DEMO",
    title: "PLINKO",
    subtitle: "Drop. Watch. Play in the lobby.",
    buttonText: "EXPLORE GAMES",
    buttonHref: "/games",
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
    buttonText: "OPEN GAMES LOBBY",
    buttonHref: "/games",
    imageSrc: "/assets/ui/banner_vip.jpg",
    imageAlt: "BETADRiX VIP Club",
    badgeColor: "text-red-400 border-red-500/30",
  },
];

export function BannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const isSwipingRef = useRef(false);
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

  // Autoplay timer
  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer]);

  // Touch handlers: Allow smooth swiping on mobile without accidentally triggering navigation to /games
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
    isSwipingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartXRef.current);
    const deltaY = Math.abs(currentY - (touchStartYRef.current ?? currentY));

    if (deltaX > 10 && deltaX > deltaY) {
      isSwipingRef.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const distance = touchStartXRef.current - touchEndX;
    const minSwipeDistance = 40;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left -> next slide
        nextSlide();
      } else {
        // Swiped right -> prev slide
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;

    // Reset swiping state after synthetic click has been handled
    setTimeout(() => {
      isSwipingRef.current = false;
    }, 150);
  };

  // Prevent link navigation if a swipe gesture was just performed
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isSwipingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Gaming Slides"
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative -mx-4 sm:mx-0 rounded-none sm:rounded-2xl bg-[#13151D] border-y sm:border border-[#232632] hover:border-red-500/50 transition-all overflow-hidden select-none group shadow-lg"
    >
      {/* 
        ENTIRE BANNER IS A SEMANTIC GAMES LOBBY LINK:
        Clicking anywhere on the banner (artwork, background, text, badge, button, empty area)
        redirects directly to /games (Games Lobby).
      */}
      <Link
        href="/games"
        aria-label="Open Games Lobby"
        onClick={handleLinkClick}
        className="block relative w-full h-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-red-500/60 rounded-none sm:rounded-2xl overflow-hidden"
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
                {/* Dark gradient overlay to guarantee text legibility without obscuring artwork */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D13]/95 via-[#0B0D13]/70 sm:via-[#0B0D13]/50 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13]/80 via-transparent to-transparent pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Main Content Area: Compact layout & responsive padding */}
        <div className="relative z-10 min-h-[200px] sm:min-h-[185px] md:min-h-[220px] p-5 sm:p-6 md:p-8 flex flex-col justify-between max-w-xl">
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

          {/* Action Button: Styled visual CTA that navigates to /games */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-600 group-hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow-md group/btn">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{currentSlide.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
            </span>
          </div>
        </div>
      </Link>

      {/* Desktop Manual Navigation Arrows: Explicitly isolated from link navigation */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          prevSlide();
        }}
        aria-label="Previous slide"
        className="hidden sm:flex items-center justify-center absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 text-white transition-all backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          nextSlide();
        }}
        aria-label="Next slide"
        className="hidden sm:flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 border border-white/10 text-white transition-all backdrop-blur-md cursor-pointer opacity-80 hover:opacity-100 hover:scale-105"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Slide Indicator Dots: Explicitly isolated from link navigation */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 right-4 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"
      >
        {SLIDES.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(idx);
            }}
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
