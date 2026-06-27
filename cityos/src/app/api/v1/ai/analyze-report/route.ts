import { NextResponse, type NextRequest } from "next/server";
import { analyzeReport } from "@/lib/gemini/reportIntelligence";
import { evaluateTrust } from "@/lib/gemini/trustEngine";
import { routeReport } from "@/lib/gemini/decisionIntelligence";
import { logger } from "@/lib/logger/logger";
import { errorLogger } from "@/lib/logger/errorLogger";

/**
 * POST /api/v1/ai/analyze-report
 * Runs all 3 AI engines: ReportIntelligence → TrustEngine → DecisionIntelligence
 * Returns full AI analysis package for a submitted report.
 */
export async function POST(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/ai/analyze-report", "POST");

  try {
    const body = await request.json() as {
      description: string;
      hasImages: boolean;
      location: string;
      nearbyReportIds?: string[];
    };

    if (!body.description || !body.location) {
      return NextResponse.json({ error: "description and location are required" }, { status: 400 });
    }

    // ── Engine 1: Report Intelligence ─────────────────────────────────────
    const reportAnalysis = await analyzeReport(body.description, body.hasImages);

    // ── Engine 2: Trust Engine ─────────────────────────────────────────────
    const trustAnalysis = await evaluateTrust(
      body.description,
      body.location,
      body.nearbyReportIds ?? []
    );

    // ── Engine 3: Decision Intelligence ───────────────────────────────────
    const routingDecision = await routeReport(
      reportAnalysis.category,
      reportAnalysis.severity,
      body.location,
      body.nearbyReportIds?.length ?? 0
    );

    logger.apiComplete("/api/v1/ai/analyze-report", 200, Date.now() - start);
    return NextResponse.json({
      reportIntelligence: reportAnalysis,
      trustEngine: trustAnalysis,
      decisionIntelligence: routingDecision,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    errorLogger.exception(error, { route: "/api/v1/ai/analyze-report" });
    logger.apiComplete("/api/v1/ai/analyze-report", 500, Date.now() - start);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
