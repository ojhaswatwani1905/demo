import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { SearchModal } from "@/components/ui/SearchModal";
import { DemoWalletModal } from "@/components/wallet/DemoWalletModal";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YOURBRAND — Premium Futuristic Gaming DEMO Platform",
  description: "Next-gen demonstration gaming platform showcasing authorized Spribe titles (Crash, Mines, Plinko, Dice, Roulette). Pure simulation, no real-money wagering.",
  keywords: ["demo gaming", "spribe demo", "crash demo", "mines demo", "plinko demo", "dice demo", "roulette demo", "futuristic casino demo"],
  openGraph: {
    title: "YOURBRAND — Futuristic Gaming DEMO Platform",
    description: "Explore the authorized Spribe demonstration games in a sleek Black + Red cinematic shell.",
    type: "website",
  }
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable} dark`}>
      <body className="bg-[#050505] text-[#F5F5F7] min-h-screen flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
        <WalletProvider>
          <FavoritesProvider>
            {children}
            <SearchModal />
            <DemoWalletModal />
            <MobileNav />
          </FavoritesProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
