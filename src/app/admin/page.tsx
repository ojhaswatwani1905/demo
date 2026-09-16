"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminEntryPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if the administrator already has an active session
    fetch("/api/admin/auth/session")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return { authenticated: false };
      })
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true);
          router.replace("/admin/dashboard");
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, [router]);

  // While checking session, display a minimal dark loader (NO public UI elements)
  if (isAuthenticated === null || isAuthenticated === true) {
    return (
      <div className="min-h-screen bg-[#08090C] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <p className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
          Checking Administrative Session...
        </p>
      </div>
    );
  }

  // Unauthenticated visitor -> Render dedicated Admin Login screen
  return (
    <AdminLogin
      onSuccess={() => {
        router.push("/admin/dashboard");
        router.refresh();
      }}
    />
  );
}
