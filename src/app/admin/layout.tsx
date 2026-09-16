import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BETADRiX — Administration Control Center",
  description: "Internal administrative management console for BETADRiX Gaming DEMO Platform.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#08090C] text-[#EDEDF0] font-sans antialiased selection:bg-red-600 selection:text-white">
      {children}
    </div>
  );
}
