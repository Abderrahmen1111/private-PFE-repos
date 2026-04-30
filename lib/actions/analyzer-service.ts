// ─────────────────────────────────────────────
//  lib/analyzer.service.ts
//  Orchestrator — calls AI + generates alerts
// ─────────────────────────────────────────────

import { randomUUID } from "crypto";
import type {
  AnalyzeCommentRequest,
  BatchAnalyzeRequest,
  BatchAnalysisResult,
  CommentAnalysisResult,
  CommentTopic,
  Sentiment,
  UserIntent,
} from "@/types/comment.types";
import { analyzeCommentWithAI, OpenRouterError, ParseError } from "./openrouter-service";
import { computeScores, generateAlerts, computeHealthScore } from "./alerts.engine";

// ─── Single Comment Analysis ───────────────────

export async function analyzeComment(
  req: AnalyzeCommentRequest,
  apiKey: string
): Promise<CommentAnalysisResult> {
  const startTime = Date.now();

  // Sanitize input
  const sanitized: AnalyzeCommentRequest = {
    ...req,
    comment: req.comment.trim().slice(0, 1000), // max 1000 chars
  };

  if (!sanitized.comment) {
    throw new ValidationError("Comment cannot be empty");
  }

  // Call OpenRouter AI
  const { raw, tokensUsed, model } = await analyzeCommentWithAI(sanitized, apiKey);

  // Compute business scores
  const { engagementScore, conversionProbability, riskScore } = computeScores(raw);

  // Generate business alerts & recommendations
  const alerts = generateAlerts(raw);

  return {
    commentId: randomUUID(),
    analyzedAt: new Date().toISOString(),
    processingMs: Date.now() - startTime,

    originalComment: sanitized.comment,
    reelId: sanitized.reelId,
    businessId: sanitized.businessId,
    productId: sanitized.productId,

    analysis: raw,
    alerts,
    engagementScore,
    conversionProbability,
    riskScore,

    modelUsed: model,
    tokensUsed,
  };
}

// ─── Batch Analysis ────────────────────────────

export async function analyzeBatch(
  req: BatchAnalyzeRequest,
  apiKey: string
): Promise<BatchAnalysisResult> {
  const batchId = randomUUID();

  if (!req.comments.length) {
    throw new ValidationError("Batch must contain at least 1 comment");
  }

  if (req.comments.length > 50) {
    throw new ValidationError("Batch limited to 50 comments per request");
  }

  // Process in parallel with concurrency limit (5 at a time)
  const CONCURRENCY = 5;
  const results: CommentAnalysisResult[] = [];

  for (let i = 0; i < req.comments.length; i += CONCURRENCY) {
    const chunk = req.comments.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.allSettled(
      chunk.map((c) =>
        analyzeComment({ ...c, businessId: req.businessId }, apiKey)
      )
    );

    for (const r of chunkResults) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      }
      // Silently skip failed comments in batch mode
    }
  }

  // ── Aggregate Stats ─────────────────────────

  const sentimentBreakdown = results.reduce(
    (acc, r) => {
      acc[r.analysis.sentiment]++;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 } as Record<Sentiment, number>
  );

  // Top intents
  const intentCounts = new Map<UserIntent, number>();
  for (const r of results) {
    for (const intent of r.analysis.intentions) {
      intentCounts.set(intent, (intentCounts.get(intent) ?? 0) + 1);
    }
  }
  const topIntents = [...intentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));

  // Top topics
  const topicCounts = new Map<CommentTopic, number>();
  for (const r of results) {
    for (const topic of r.analysis.topics) {
      topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }
  }
  const topTopics = [...topicCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const criticalAlerts = results.reduce(
    (count, r) =>
      count + r.alerts.filter((a) => a.level === "critical").length,
    0
  );

  const healthScore = computeHealthScore(results);

  // ── Global Recommendations (from top issues) ─

  const globalRecommendations = buildGlobalRecommendations(results, topTopics);

  return {
    batchId,
    businessId: req.businessId,
    totalComments: results.length,
    processedAt: new Date().toISOString(),
    results,
    aggregate: {
      sentimentBreakdown,
      topIntents,
      topTopics,
      avgEngagementScore: avg(results.map((r) => r.engagementScore)),
      avgConversionProbability: avg(results.map((r) => r.conversionProbability)),
      criticalAlerts,
      overallHealthScore: healthScore,
    },
    globalRecommendations,
  };
}

// ─── Global Reco Builder ───────────────────────

function buildGlobalRecommendations(
  results: CommentAnalysisResult[],
  topTopics: BatchAnalysisResult["aggregate"]["topTopics"]
) {
  const recs = [];
  const total = results.length;
  const negativeCount = results.filter((r) => r.analysis.sentiment === "negative").length;
  const negRatio = negativeCount / total;

  if (negRatio > 0.4) {
    recs.push({
      action: `Plus de ${Math.round(negRatio * 100)}% des commentaires sont négatifs — audit qualité produit/service urgent requis`,
      category: "service" as const,
      impact: "high" as const,
      effort: "high" as const,
      timeframe: "immediate" as const,
    });
  }

  const topTopic = topTopics[0]?.topic;
  if (topTopic === "prix") {
    recs.push({
      action: "Le prix est le sujet le plus discuté — revoir la grille tarifaire ou mieux communiquer la valeur",
      category: "pricing" as const,
      impact: "high" as const,
      effort: "medium" as const,
      timeframe: "short_term" as const,
    });
  } else if (topTopic === "livraison") {
    recs.push({
      action: "La livraison est le point de friction principal — optimiser la chaîne logistique",
      category: "logistics" as const,
      impact: "high" as const,
      effort: "high" as const,
      timeframe: "short_term" as const,
    });
  }

  const purchaseIntentCount = results.filter((r) =>
    r.analysis.purchase_signals.has_purchase_intent
  ).length;

  if (purchaseIntentCount > total * 0.3) {
    recs.push({
      action: `${purchaseIntentCount} commentaires montrent une intention d'achat — activer le checkout direct sur les Reels`,
      category: "marketing" as const,
      impact: "high" as const,
      effort: "low" as const,
      timeframe: "immediate" as const,
    });
  }

  return recs;
}

// ─── Custom Errors ─────────────────────────────

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export { OpenRouterError, ParseError };