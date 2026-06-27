import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger/logger";
import { mockReports, getMyReports } from "@/lib/mock/reports";
import { demo } from "@/config/demo";
import { features } from "@/config/features";

export async function GET(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/reports", "GET");

  try {
    const { searchParams } = new URL(request.url);
    const citizenId = searchParams.get("citizenId");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    // Demo / Mock mode
    if (demo.isActive || !features.ENABLE_FIREBASE) {
      let reports = citizenId ? getMyReports(citizenId) : mockReports;

      if (status) reports = reports.filter((r) => r.status === status);
      if (category) reports = reports.filter((r) => r.issueCategory === category);

      const paginated = reports.slice(offset, offset + limit);
      logger.apiComplete("/api/v1/reports", 200, Date.now() - start);
      return NextResponse.json({
        reports: paginated,
        total: reports.length,
        limit,
        offset,
      });
    }

    // Live mode — Phase 5 Firestore implementation
    logger.apiComplete("/api/v1/reports", 501, Date.now() - start);
    return NextResponse.json({ error: "Live mode not yet implemented" }, { status: 501 });
  } catch (error) {
    logger.apiComplete("/api/v1/reports", 500, Date.now() - start);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/reports", "POST");

  try {
    const body = await request.json();

    if (!body.description || !body.location) {
      return NextResponse.json({ error: "description and location are required" }, { status: 400 });
    }

    // Demo mode: return a synthetic report ID
    if (demo.isActive || !features.ENABLE_FIREBASE) {
      const reportId = `RPT-${Date.now().toString(36).toUpperCase()}`;
      logger.info("Demo report created", { reportId });
      logger.apiComplete("/api/v1/reports", 201, Date.now() - start);
      return NextResponse.json({ reportId, status: "submitted" }, { status: 201 });
    }

    return NextResponse.json({ error: "Live mode not yet implemented" }, { status: 501 });
  } catch (error) {
    logger.apiComplete("/api/v1/reports", 500, Date.now() - start);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
