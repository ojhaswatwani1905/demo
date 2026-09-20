export interface GameConfig {
  id: string;
  name: string;
  provider: string;
  providerType?: string;
  image: string;
  uiPreview?: string;
  category: "Originals" | "Table" | "Featured";
  demoUrlEnvKey: string;
  defaultDemoUrl: string;
  description: string;
  badges: string[];
  rtp?: string;
  minBet?: string;
  maxBet?: string;
  maxMultiplier?: string;
  isActive?: boolean;
  isEnabled?: boolean;
  maintenanceMessage?: string;
}

export const GAMES: GameConfig[] = [
  {
    id: "mines",
    name: "Mines",
    provider: "Turbo Games",
    image: "/assets/games/game_card_mines.png",
    uiPreview: "/assets/ui/mines_game_ui.png",
    category: "Originals",
    demoUrlEnvKey: "NEXT_PUBLIC_SPYKE_MINES_URL",
    defaultDemoUrl:
      process.env.NEXT_PUBLIC_SPYKE_MINES_URL ||
      "https://mines.turbogames.io/",
    description: "Navigate a grid of hidden stars and landmines. Select your risk level and step through squares to amplify your multiplier.",
    badges: ["TACTICAL", "HIGH RTP"],
    rtp: "97.00%",
    minBet: "$0.10",
    maxBet: "$100.00",
    maxMultiplier: "1,000x"
  },
  {
    id: "plinko",
    name: "PLINKO",
    provider: "BETADRiX",
    providerType: "Internal Demo Game",
    image: "/assets/games/game_card_plinko.png",
    uiPreview: "/assets/ui/plinko_game_ui.png",
    category: "Originals",
    demoUrlEnvKey: "NEXT_PUBLIC_PLINKO_URL",
    defaultDemoUrl:
      process.env.NEXT_PUBLIC_PLINKO_URL ||
      "https://plinko-1-b1u5.onrender.com/embed",
    description: "Physics-based Plinko demo with virtual credits.",
    badges: ["ORIGINAL", "PHYSICS DEMO"]
  },
  {
    id: "dice",
    name: "Dice",
    provider: "Turbo Games",
    image: "/assets/games/game_card_dice.png",
    uiPreview: "/assets/ui/dice_game_ui.png",
    category: "Table",
    demoUrlEnvKey: "NEXT_PUBLIC_SPYKE_DICE_URL",
    defaultDemoUrl:
      process.env.NEXT_PUBLIC_SPYKE_DICE_URL ||
      "https://dice.turbogames.io/",
    description: "Set your target slider, balance probability against payout multiplier, and roll the digital dice with instant simulated feedback.",
    badges: ["FAST", "INSTANT ROLL"],
    rtp: "97.00%",
    minBet: "$0.10",
    maxBet: "$100.00",
    maxMultiplier: "990x"
  },
  {
    id: "roulette",
    name: "Roulette",
    provider: "Spribe",
    image: "/assets/games/game_card_roulette.png",
    uiPreview: "/assets/ui/roulette_game_ui.png",
    category: "Table",
    demoUrlEnvKey: "NEXT_PUBLIC_SPYKE_ROULETTE_URL",
    defaultDemoUrl:
      process.env.NEXT_PUBLIC_SPYKE_ROULETTE_URL ||
      "https://demo.spribe.io/launch/mini-roulette?currency=EUR&lang=EN",
    description: "Sleek, European-style roulette wheel engineered for quick rounds, comprehensive history, and multi-bet options.",
    badges: ["CLASSIC", "TABLE"],
    rtp: "97.30%",
    minBet: "$0.10",
    maxBet: "$100.00",
    maxMultiplier: "36x"
  }
];

export const CATEGORIES = [
  "All",
  "Originals",
  "Table",
  "Featured"
] as const;

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find(g => g.id.toLowerCase() === id.toLowerCase());
}

/**
 * Gets configured demo URL prioritizing explicit configured URL,
 * then falling back to environment variable / default configuration.
 */
export function getResolvedDemoUrl(gameId: string, initialUrl?: string): string {
  if (initialUrl && initialUrl.trim() !== "") {
    return initialUrl.trim();
  }

  // Plinko uses authoritative standalone Plinko application directly
  if (gameId.toLowerCase() === "plinko") {
    const game = getGameById("plinko");
    return game?.defaultDemoUrl?.trim() || "https://plinko-1-b1u5.onrender.com/embed";
  }

  if (typeof window !== "undefined") {
    const spykeStored = localStorage.getItem(`spyke_url_${gameId}`);
    if (spykeStored && spykeStored.trim() !== "") return spykeStored.trim();

    const legacyStored = localStorage.getItem(`spribe_demo_url_${gameId}`);
    if (legacyStored && legacyStored.trim() !== "") return legacyStored.trim();
  }
  const game = getGameById(gameId);
  return game?.defaultDemoUrl?.trim() || "";
}
