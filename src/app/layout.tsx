import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RealtimeProvider } from "@/context/RealtimeContext";
import { WalletProvider } from "@/context/WalletContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { UIProvider } from "@/context/UIContext";
import { AuthProvider } from "@/context/AuthContext";
import { SearchModal } from "@/components/ui/SearchModal";
import { DemoWalletModal } from "@/components/wallet/DemoWalletModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { MobileNav } from "@/components/layout/MobileNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BETADRiX — Gaming DEMO Platform",
  description: "Clean, professional demonstration gaming platform showcasing authorized titles (Mines, Dice, Roulette, Plinko). Pure simulation, zero real-money wagering.",
  keywords: ["demo gaming", "mines demo", "dice demo", "roulette demo", "plinko demo", "betadrix demo"],
  openGraph: {
    title: "BETADRiX — Gaming DEMO Platform",
    description: "Explore authorized demonstration games in a clean, professional gaming lobby.",
    type: "website",
  }
};

export const viewport: Viewport = {
  themeColor: "#0B0C10",
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
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="bg-[#0B0C10] text-[#EDEDF0] min-h-screen flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
        <RealtimeProvider>
          <AuthProvider>
            <WalletProvider>
              <FavoritesProvider>
                <UIProvider>
                  {children}
                  <SearchModal />
                  <DemoWalletModal />
                  <AuthModal />
                  <MobileNav />
                </UIProvider>
              </FavoritesProvider>
            </WalletProvider>
          </AuthProvider>
        </RealtimeProvider>
      </body>
    </html>
  );
}
