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
  title: "BETADRiX — Premium Gaming DEMO Platform",
  description: "Next-gen demonstration gaming platform showcasing authorized titles (Mines, Plinko, Dice, Roulette). Pure simulation, zero real-money wagering.",
  keywords: ["demo gaming", "mines demo", "plinko demo", "dice demo", "roulette demo", "betadrix demo"],
  openGraph: {
    title: "BETADRiX — Gaming DEMO Platform",
    description: "Explore authorized demonstration games in a sleek Black + Red gaming shell.",
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
