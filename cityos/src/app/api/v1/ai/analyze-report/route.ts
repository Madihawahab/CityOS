import { NextResponse, type NextRequest } from "next/server";
import { analyzeReport } from "@/lib/gemini/reportIntelligence";
import { evaluateTrust } from "@/lib/gemini/trustEngine";
import { routeReport } from "@/lib/gemini/decisionIntelligence";
import { logger } from "@/lib/logger/logger";
import { errorLogger } from "@/lib/logger/errorLogger";
import type { IssueCategory, IssueSeverity } from "@/types";

/**
 * POST /api/v1/ai/analyze-report
 * Runs specified stage or all AI engines: ReportIntelligence → TrustEngine → DecisionIntelligence
 */
export async function POST(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/ai/analyze-report", "POST");

  const { searchParams } = new URL(request.url);
  const stage = searchParams.get("stage");

  try {
    const body = await request.json() as {
      description: string;
      hasImages: boolean;
      location: string;
      image?: string | null;
      voiceTranscript?: string | null;
      nearbyReportIds?: string[];
      category?: string;
      severity?: string;
      nearbyCount?: number;
    };

    if (!body.location) {
      return NextResponse.json({ error: "location is required" }, { status: 400 });
    }

    if (!stage || stage === "reportIntelligence") {
      if (!body.description) {
        return NextResponse.json({ error: "description is required" }, { status: 400 });
      }
    }

    // ── Stage 1: Report Intelligence ─────────────────────────────────────
    if (stage === "reportIntelligence") {
      const reportAnalysis = await analyzeReport(
        body.description,
        body.hasImages,
        body.image,
        body.voiceTranscript
      );
      logger.apiComplete("/api/v1/ai/analyze-report", 200, Date.now() - start);
      return NextResponse.json({
        reportIntelligence: reportAnalysis,
      });
    }

    // ── Stage 2: Trust Engine ─────────────────────────────────────────────
    if (stage === "trustEngine") {
      const trustAnalysis = await evaluateTrust(
        body.description || "Report",
        body.location,
        body.nearbyReportIds ?? []
      );
      logger.apiComplete("/api/v1/ai/analyze-report", 200, Date.now() - start);
      return NextResponse.json({
        trustEngine: trustAnalysis,
      });
    }

    // ── Stage 3: Decision Intelligence ───────────────────────────────────
    if (stage === "decisionEngine") {
      const routingDecision = await routeReport(
        (body.category || "water") as IssueCategory,
        (body.severity || "medium") as IssueSeverity,
        body.location,
        body.nearbyCount ?? 0
      );
      logger.apiComplete("/api/v1/ai/analyze-report", 200, Date.now() - start);
      return NextResponse.json({
        decisionIntelligence: routingDecision,
      });
    }

    // ── Default: Sequential Full Pipeline ───────────────────────────────
    const reportAnalysis = await analyzeReport(
      body.description,
      body.hasImages,
      body.image,
      body.voiceTranscript
    );

    const trustAnalysis = await evaluateTrust(
      body.description,
      body.location,
      body.nearbyReportIds ?? []
    );

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
    errorLogger.exception(error, { route: `/api/v1/ai/analyze-report?stage=${stage || "full"}` });
    logger.apiComplete("/api/v1/ai/analyze-report", 500, Date.now() - start);
    return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
  }
}
