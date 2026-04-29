// ─────────────────────────────────────────────
//  app/api/comments/analyze/route.ts
//  POST /api/comments/analyze
//
//  Analyzes a single Reel comment in Tunisian
//  Darija/Arabic/French and returns:
//    - Sentiment (positive/negative/neutral)
//    - User intent & emotions
//    - Business alerts & recommendations
// ─────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { analyzeComment, ValidationError, OpenRouterError, ParseError } from "@/lib/actions/analyzer-service";
import type { AnalyzeCommentRequest, ApiResponse, CommentAnalysisResult } from "@/types/comment.types";

export const runtime = "nodejs"; // Needed for crypto.randomUUID

// ─── Rate limit (simple in-memory — use Redis in prod) ───

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;       // requests
const RATE_WINDOW = 60_000;  // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }

  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

// ─── POST Handler ──────────────────────────────

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Trop de requêtes. Réessayez dans 1 minute.",
        },
      },
      { status: 429 }
    );
  }

  // ── Parse body ──────────────────────────────
  let body: AnalyzeCommentRequest & { apiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "INVALID_JSON", message: "Request body must be valid JSON" },
      },
      { status: 400 }
    );
  }

  // ── Resolve API key ─────────────────────────
  // Priority: env var > request body (for dev/testing only)
  const apiKey = process.env.OPENROUTER_API_KEY ?? body.apiKey;
  if (!apiKey) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "MISSING_API_KEY",
          message: "OPENROUTER_API_KEY not configured",
        },
      },
      { status: 401 }
    );
  }

  // ── Validate required fields ────────────────
  if (!body.comment || typeof body.comment !== "string") {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "MISSING_COMMENT",
          message: "Field 'comment' is required and must be a string",
        },
      },
      { status: 400 }
    );
  }

  // ── Analyze ─────────────────────────────────
  try {
    const result = await analyzeComment(
      {
        comment: body.comment,
        reelId: body.reelId,
        businessId: body.businessId,
        productId: body.productId,
        userId: body.userId,
        context: body.context,
      },
      apiKey
    );

    return NextResponse.json<ApiResponse<CommentAnalysisResult>>(
      {
        success: true,
        data: result,
        meta: {
          requestId: result.commentId,
          timestamp: result.analyzedAt,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    return handleError(err);
  }
}

// ─── Error Handler ─────────────────────────────

function handleError(err: unknown): NextResponse {
  console.error("[CommentAnalyzer] Error:", err);

  const error = err as any;

  if (err instanceof ValidationError) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: { code: "VALIDATION_ERROR", message: error.message },
      },
      { status: 400 }
    );
  }

  if (err instanceof OpenRouterError) {
    const isAuth = error.statusCode === 401 || error.statusCode === 403;
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: isAuth ? "INVALID_API_KEY" : "AI_SERVICE_ERROR",
          message: isAuth
            ? "Clé OpenRouter invalide ou expirée"
            : `Erreur service AI: ${error.message}`,
        },
      },
      { status: isAuth ? 401 : 502 }
    );
  }

  if (err instanceof ParseError) {
    return NextResponse.json<ApiResponse<never>>(
      {
        success: false,
        error: {
          code: "AI_PARSE_ERROR",
          message: error.message || "Le modèle AI n'a pas retourné un format valide. Réessayez.",
        },
      },
      { status: 502 }
    );
  }

  return NextResponse.json<ApiResponse<never>>(
    {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Une erreur interne s'est produite",
      },
    },
    { status: 500 }
  );
}