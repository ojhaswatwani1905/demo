"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import {
  HelpCircle,
  MessageSquare,
  Send,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Mail,
  Clock,
  Sparkles
} from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is BETADRiX a real-money gambling casino?",
    a: "No. BETADRiX is strictly a demonstration and gaming mechanics simulation portal. All gameplay, balances, cashbacks, and top-ups operate using zero-value virtual demo currency. No real-money wagers, deposits, or withdrawals are supported."
  },
  {
    q: "How do I claim my Daily Demo Faucet?",
    a: "Visit the Bonus Center in the bottom navigation. If your 24-hour cooldown has elapsed, simply click 'Claim Now' to instantly credit $1,000 in simulated demo currency to your balance."
  },
  {
    q: "What game providers are hosted on the platform?",
    a: "BETADRiX hosts authorized demonstration titles from verified industry providers, currently featuring Turbo Games (Mines, Dice) and Spribe (Roulette, Plinko)."
  },
  {
    q: "Why did a game open in a separate browser window?",
    a: "Certain game providers enforce strict Content Security Policy (CSP) and X-Frame-Options headers that restrict running in embedded frames. In these situations, BETADRiX automatically provides an authorized separate-tab launch button so you can play without interruptions."
  },
  {
    q: "How does the VIP loyalty system work?",
    a: "As you test games with virtual demo credits, your player profile accumulates simulated experience points (XP) to advance across Bronze, Silver, Gold, and Platinum tiers, unlocking simulated perks and rakeback."
  }
];

export default function SupportPage() {
  const [telegramUrl, setTelegramUrl] = useState<string | null>("https://t.me/betadrix_official");
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>("https://wa.me/15551234567");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Ticket inquiry form state
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketSubject, setTicketSubject] = useState("Gameplay Help");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.config) {
          if (data.config.telegramUrl) setTelegramUrl(data.config.telegramUrl);
          if (data.config.whatsappUrl) setWhatsappUrl(data.config.whatsappUrl);
        }
      })
      .catch(err => {
        console.error("Failed to load config for support channels:", err);
      });
  }, []);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketName("");
      setTicketEmail("");
      setTicketMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-[#EDEDF0]">
      <Sidebar />

      <div className="lg:pl-60 flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="flex-1 w-full lg:max-w-7xl lg:mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-28 lg:pb-12">
          {/* Header */}
          <div className="border-b border-[#232632] pb-5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1C1F2B] border border-[#2D3344] text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider mb-2.5">
              <HelpCircle className="w-3.5 h-3.5 text-red-500" />
              <span>Platform Assistance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Support Center
            </h1>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1.5 max-w-2xl leading-relaxed">
              Have questions about demonstration games, VIP tiers, or demo balances? Reach out through our community support channels or explore frequent questions below.
            </p>
          </div>

          {/* Quick Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telegram Channel */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#13151D] border border-[#232632] hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Send className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    ONLINE 24/7
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  Telegram Community
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Join our official player community on Telegram for platform updates, new demo titles, and rapid assistance.
                </p>
              </div>

              {telegramUrl ? (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A1E2B] hover:bg-cyan-600/20 text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-500 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Open Telegram Channel</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-[#636B7E] italic">Channel link configured by admin</span>
              )}
            </div>

            {/* WhatsApp Support */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#13151D] border border-[#232632] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                    PRIORITY DESK
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                  WhatsApp Support
                </h3>
                <p className="text-xs text-[#8E95A5] leading-relaxed">
                  Connect with a demonstration platform specialist directly via WhatsApp for quick troubleshooting.
                </p>
              </div>

              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#1A1E2B] hover:bg-emerald-600/20 text-emerald-400 hover:text-white border border-emerald-500/30 hover:border-emerald-500 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Chat on WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-xs text-[#636B7E] italic">WhatsApp support configured by admin</span>
              )}
            </div>
          </div>

          {/* Inquiry Form & FAQ Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: FAQ (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Frequently Asked Questions
                </h2>
              </div>

              <div className="space-y-2.5">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = expandedFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-[#13151D] border border-[#232632] overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaq(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-white hover:text-red-400 transition-colors"
                      >
                        <span>{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#7A8296] shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-red-500" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs text-[#8E95A5] leading-relaxed border-t border-[#1C1F2B] bg-[#0E1016]">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Message Form (lg:col-span-5) */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-2xl bg-[#13151D] border border-[#232632] space-y-4">
              <div>
                <h3 className="text-base font-bold text-white uppercase tracking-tight">
                  Send a Support Ticket
                </h3>
                <p className="text-xs text-[#8E95A5] mt-1">
                  Have a suggestion or need help? Submit a simulation inquiry.
                </p>
              </div>

              {ticketSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-bold text-white">Inquiry Received</h4>
                  <p className="text-xs text-emerald-300">
                    Thank you! Your simulated feedback ticket has been logged with platform operations.
                  </p>
                  <button
                    onClick={() => setTicketSubmitted(false)}
                    className="mt-2 text-xs font-bold text-white underline hover:text-emerald-400"
                  >
                    Submit another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketName}
                      onChange={e => setTicketName(e.target.value)}
                      placeholder="Player Name"
                      className="w-full px-3 py-2 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={e => setTicketEmail(e.target.value)}
                      placeholder="player@example.com"
                      className="w-full px-3 py-2 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider block">
                      Subject
                    </label>
                    <select
                      value={ticketSubject}
                      onChange={e => setTicketSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white focus:outline-none focus:border-red-500/60"
                    >
                      <option value="Gameplay Help">Gameplay & Simulation Help</option>
                      <option value="VIP Query">VIP Loyalty Inquiry</option>
                      <option value="Bonus Query">Bonus Center Question</option>
                      <option value="Bug Report">Technical Issue / Bug Report</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#8E95A5] uppercase tracking-wider block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={ticketMessage}
                      onChange={e => setTicketMessage(e.target.value)}
                      placeholder="Describe your inquiry..."
                      className="w-full px-3 py-2 bg-[#14161F] border border-[#262B3B] rounded-lg text-xs text-white placeholder-[#4E5466] focus:outline-none focus:border-red-500/60"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(220,38,38,0.3)] cursor-pointer"
                  >
                    Submit Support Ticket
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom Security / Fair Notice */}
          <div className="p-4 rounded-xl bg-[#14161E] border border-[#232632] flex items-start gap-3 text-xs text-[#8E95A5]">
            <ShieldCheck className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p>
              BETADRiX customer assistance and live channels are dedicated to technical demonstration questions, platform feature orientation, and simulator feedback.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
