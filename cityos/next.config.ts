import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Turbopack (Next.js 16 default) ─────────────────────────────────────────
  // next-pwa is webpack-based and incompatible with Turbopack.
  // PWA service worker is handled separately via public/sw.js stub.
  turbopack: {},

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },

  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
  },

  // ── Security headers ────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
