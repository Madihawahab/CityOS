import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger/logger";
import { mockAnalytics } from "@/lib/mock/analytics";
import { demo } from "@/config/demo";

export async function GET(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/admin/analytics", "GET");

  if (demo.isActive) {
    logger.apiComplete("/api/v1/admin/analytics", 200, Date.now() - start);
    return NextResponse.json(mockAnalytics);
  }

  // Phase 5 — real Firestore aggregation
  return NextResponse.json({ error: "Not implemented" }, { status: 501 });
}
