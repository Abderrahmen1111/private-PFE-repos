// ─────────────────────────────────────────────
//  app/api/comments/alerts/route.ts
//  POST /api/comments/alerts
//
//  Lightweight endpoint: takes a pre-analyzed
//  comment result and re-generates/filters alerts.
//  Useful for dashboard real-time polling without
//  re-calling the AI model.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { generateAlerts } from "@/lib/actions/alerts.engine";
import type { AIAnalysisRaw, ApiResponse, BusinessAlert } from "@/types/comment.types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { analysis: AIAnalysisRaw; minLevel?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INVALID_JSON", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  if (!body.analysis) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "MISSING_ANALYSIS", message: "'analysis' field required" },
      },
      { status: 400 }
    );
  }

  const alerts = generateAlerts(body.analysis);

  // Optional filter by minimum alert level
  const levelPriority: Record<string, number> = {
    critical: 4,
    warning: 3,
    info: 2,
    success: 1,
  };

  const minLevel = body.minLevel ?? "info";
  const minPriority = levelPriority[minLevel] ?? 1;

  const filtered = alerts.filter(
    (a: BusinessAlert) => (levelPriority[a.level] ?? 0) >= minPriority
  );

  return NextResponse.json<ApiResponse<{ alerts: BusinessAlert[]; total: number }>>(
    {
      success: true,
      data: { alerts: filtered, total: filtered.length },
      meta: {
        requestId: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
      },
    },
    { status: 200 }
  );
}