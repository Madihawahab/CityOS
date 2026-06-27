import type { Metadata, Viewport } from "next";

import { Providers } from "@/providers/Providers";
import { APP_NAME, APP_TAGLINE } from "@/lib/utils/constants";
import "@/styles/globals.css";



export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "CityOS is Bengaluru's AI-powered civic operating system. Report infrastructure issues, track resolutions, and watch AI handle everything — from report analysis to repair verification.",
  keywords: ["civic", "infrastructure", "Bengaluru", "BBMP", "BWSSB", "AI", "smart city", "CityOS"],
  authors: [{ name: "CityOS Team" }],
  creator: "CityOS",
  publisher: "CityOS",
  applicationName: APP_NAME,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://cityos.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description:
      "AI-powered civic issue reporting and resolution platform for Bengaluru",
    siteName: APP_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: "Bengaluru's AI civic operating system",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#004ac6" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0e14" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        {/* Material Symbols (icons) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="font-inter antialiased bg-background text-on-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
