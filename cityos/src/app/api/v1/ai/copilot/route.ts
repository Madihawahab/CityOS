import { NextResponse, type NextRequest } from "next/server";
import { generateCopilotResponse } from "@/lib/gemini/civicCopilot";
import { logger } from "@/lib/logger/logger";
import { errorLogger } from "@/lib/logger/errorLogger";
import type { CopilotMessage } from "@/types";

export async function POST(request: NextRequest) {
  const start = Date.now();
  logger.apiStart("/api/v1/ai/copilot", "POST");

  try {
    const body = await request.json() as {
      message: string;
      history?: CopilotMessage[];
      reportId?: string;
    };

    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const response = await generateCopilotResponse(
      body.message.slice(0, 1000), // max 1000 chars
      body.history ?? [],
      body.reportId ? { reportId: body.reportId, status: "unknown", department: "unknown" } : undefined
    );

    logger.apiComplete("/api/v1/ai/copilot", 200, Date.now() - start);
    return NextResponse.json({ response });
  } catch (error) {
    errorLogger.exception(error, { route: "/api/v1/ai/copilot" });
    logger.apiComplete("/api/v1/ai/copilot", 500, Date.now() - start);
    return NextResponse.json(
      { error: "Copilot temporarily unavailable", response: "I'm having a brief technical issue. Please try again in a moment." },
      { status: 500 }
    );
  }
}
