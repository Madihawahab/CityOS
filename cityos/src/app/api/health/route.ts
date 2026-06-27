import { NextResponse } from "next/server";
import { logger } from "@/lib/logger/logger";

export async function GET() {
  logger.info("Health check requested");

  const health = {
    status: "ok",
    service: "CityOS API",
    version: "1.0.0",
    environment: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
    timestamp: new Date().toISOString(),
    features: {
      firebase: process.env.NEXT_PUBLIC_APP_ENV !== "demo",
      gemini: Boolean(process.env.GEMINI_API_KEY),
      demoMode: process.env.NEXT_PUBLIC_APP_ENV === "demo",
    },
  };

  return NextResponse.json(health, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
