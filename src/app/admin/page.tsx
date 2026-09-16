"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    // If the administrator already has an active session, forward to dashboard
    fetch("/api/admin/auth/session")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (data.authenticated) {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  // Unauthenticated visitor -> Render dedicated Admin Login screen immediately
  return (
    <AdminLogin
      onSuccess={() => {
        router.push("/admin/dashboard");
        router.refresh();
      }}
    />
  );
}

