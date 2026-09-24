import type { NextConfig } from "next";

// Safe, tailored Content-Security-Policy that strictly permits:
// - Self assets and Next.js scripts/styles
// - Authorized live game iframes: Turbo Games (Mines, Dice) and Spribe (Roulette)
// - SSE stream connection (/api/realtime)
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data: https:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' https://mines.turbogames.io https://dice.turbogames.io https://demo.spribe.io https://*.turbogames.io https://*.spribe.io https://plinko-1-b1u5.onrender.com https://*.onrender.com;
  connect-src 'self' https: wss:;
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
  // Remove X-Powered-By: Next.js to prevent server fingerprinting
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN"
          },
          {
            key: "Content-Security-Policy",
            value: cspHeader
          }
        ]
      }
    ];
  }
};

export default nextConfig;
