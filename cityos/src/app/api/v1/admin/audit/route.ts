import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger/logger";
import { auditLogger } from "@/lib/logger/auditLogger";

export async function POST(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/admin/audit", "POST");

  try {
    const body = await request.json();
    // In demo mode: just log — don't write to Firestore
    auditLogger.log(body);
    logger.apiComplete("/api/v1/admin/audit", 201, Date.now() - start);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  logger.apiStart("/api/v1/admin/audit", "GET");
  // Phase 5: fetch from Firestore audit_logs collection
  return NextResponse.json({ entries: [], total: 0 });
}
