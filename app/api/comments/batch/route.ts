// ─────────────────────────────────────────────
//  app/api/comments/batch/route.ts
//  POST /api/comments/batch
//
//  Analyze up to 50 comments at once.
//  Returns aggregate stats + global recommendations
//  for the business dashboard.
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { analyzeBatch, ValidationError, ParseError } from "@/lib/actions/analyzer-service";
import { OpenRouterError } from "@/lib/actions/openrouter-service";
import type { BatchAnalyzeRequest, BatchAnalysisResult, ApiResponse } from "@/types/comment.types";

export const runtime = "nodejs";

// Longer timeout for batch — set in next.config.js as well
export const maxDuration = 120; // seconds (Vercel Pro+)

export async function POST(req: NextRequest) {
  let body: BatchAnalyzeRequest & { apiKey?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INVALID_JSON", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY ?? body.apiKey;
  if (!apiKey) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "MISSING_API_KEY", message: "API key required" } },
      { status: 401 }
    );
  }

  if (!Array.isArray(body.comments) || !body.comments.length) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "'comments' array is required and must not be empty",
        },
      },
      { status: 400 }
    );
  }

  if (!body.businessId) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: "'businessId' is required for batch analysis" },
      },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeBatch(
      {
        comments: body.comments,
        businessId: body.businessId,
      },
      apiKey
    );

    return NextResponse.json<ApiResponse<BatchAnalysisResult>>(
      {
        success: true,
        data: result,
        meta: {
          requestId: result.batchId,
          timestamp: result.processedAt,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[BatchAnalyzer] Error:", err);

    const error = err as any;

    if (err instanceof ValidationError) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.message } },
        { status: 400 }
      );
    }

    if (err instanceof OpenRouterError) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: {
            code: "AI_SERVICE_ERROR",
            message: `OpenRouter error: ${error.message}`,
          },
        },
        { status: 502 }
      );
    }

    if (err instanceof ParseError) {
      return NextResponse.json<ApiResponse<never>>(
        {
          success: false,
          error: { code: "AI_PARSE_ERROR", message: error.message },
        },
        { status: 502 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}