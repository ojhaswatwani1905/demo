export interface DemoActivity {
  id: string;
  player: string;
  gameId: string;
  gameName: string;
  bet: number;
  multiplier: number;
  payout: number;
  time: string;
  isWin: boolean;
}

export const INITIAL_DEMO_ACTIVITY: DemoActivity[] = [
  {
    id: "act-1",
    player: "Player23",
    gameId: "mines",
    gameName: "Mines",
    bet: 25.00,
    multiplier: 4.82,
    payout: 120.50,
    time: "Just now",
    isWin: true,
  },
  {
    id: "act-2",
    player: "LuckyWin",
    gameId: "mines",
    gameName: "Mines",
    bet: 10.00,
    multiplier: 7.92,
    payout: 79.20,
    time: "12s ago",
    isWin: true,
  },
  {
    id: "act-3",
    player: "CryptoKing",
    gameId: "plinko",
    gameName: "Plinko",
    bet: 50.00,
    multiplier: 0.2,
    payout: 10.00,
    time: "25s ago",
    isWin: false,
  },
  {
    id: "act-4",
    player: "MoonBet",
    gameId: "dice",
    gameName: "Dice",
    bet: 15.00,
    multiplier: 2.05,
    payout: 30.75,
    time: "42s ago",
    isWin: true,
  },
  {
    id: "act-5",
    player: "BetMaster",
    gameId: "roulette",
    gameName: "Roulette",
    bet: 100.00,
    multiplier: 2.00,
    payout: 200.00,
    time: "1m ago",
    isWin: true,
  },
  {
    id: "act-6",
    player: "AlphaGamer",
    gameId: "dice",
    gameName: "Dice",
    bet: 30.00,
    multiplier: 1.12,
    payout: 33.60,
    time: "2m ago",
    isWin: true,
  },
  {
    id: "act-7",
    player: "NeonRider",
    gameId: "mines",
    gameName: "Mines",
    bet: 20.00,
    multiplier: 0.00,
    payout: 0.00,
    time: "2m ago",
    isWin: false,
  },
  {
    id: "act-8",
    player: "CyberSamurai",
    gameId: "roulette",
    gameName: "Roulette",
    bet: 75.00,
    multiplier: 3.00,
    payout: 225.00,
    time: "3m ago",
    isWin: true,
  }
];

export const DEMO_USER_PROFILE = {
  username: "Player01",
  tag: "#DEMO-8842",
  vipTier: "VIP Bronze",
  avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=120&auto=format&fit=crop&q=80",
  memberSince: "Demo Mode Active",
  level: 14,
  levelProgress: 68,
  totalDemoPlayed: 142,
  favoriteGame: "Mines (Turbo Games)"
};
