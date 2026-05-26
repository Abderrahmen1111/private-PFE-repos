'use server';

import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FraudSignal {
  type: string;
  severity: "low" | "medium" | "high";
  description: string;
  weight: number; // contribution au score 0-100
}

export interface FraudAnalysis {
  score: number; // 0 = sûr, 100 = fraude certaine
  level: "safe" | "suspicious" | "high_risk" | "blocked";
  signals: FraudSignal[];
  recommendation: "approve" | "review" | "reject";
  ai_reasoning: string;
  checked_at: string;
}

export interface FraudContext {
  customer_id: string;
  store_id: number;
  item_id: number;
  quantity?: number;
  total: number;
  delivery_address?: string;
  customer_ip?: string;
  entity_type: 'ORDER' | 'BOOKING';
}

// ─── Thresholds ───────────────────────────────────────────────────────────────

const SCORE_THRESHOLDS = {
  safe: 25,
  suspicious: 55,
  high_risk: 75,
};

// ─── Step 1: Collecte des signaux heuristiques depuis Supabase ────────────────

async function collectHeuristicSignals(
  ctx: FraudContext
): Promise<FraudSignal[]> {
  const supabase = createClient();
  const signals: FraudSignal[] = [];
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const isOrder = ctx.entity_type === 'ORDER';
  const table = isOrder ? 'orders' : 'bookings';

  // ── Signal 1: Compte très récent ──────────────────────────────────────────
  const { data: profile } = await supabase
    .from("users")
    .select("created_at, phone, email")
    .eq("id", ctx.customer_id)
    .single();

  if (profile) {
    const createdAt = profile.created_at ? new Date(profile.created_at) : now;
    const accountAge = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60); // en heures

    if (accountAge < 1) {
      signals.push({
        type: "new_account_under_1h",
        severity: "high",
        description: "Compte créé il y a moins d'1 heure",
        weight: 30,
      });
    } else if (accountAge < 24) {
      signals.push({
        type: "new_account_under_24h",
        severity: "medium",
        description: `Compte créé il y a ${Math.round(accountAge)}h`,
        weight: 15,
      });
    }

    if (!profile.phone) {
      signals.push({
        type: "no_phone",
        severity: "low",
        description: "Aucun numéro de téléphone vérifié",
        weight: 10,
      });
    }
  }

  // ── Signal 2: Rafale d'activités ──────────────────────────────────────────
  const { count: activitiesLastHour } = await (supabase
    .from(table) as any)
    .select("*", { count: "exact", head: true })
    .eq("customer_id", ctx.customer_id)
    .gte("created_at", oneHourAgo);

  const burstThresholdHigh = isOrder ? 5 : 3;
  const burstThresholdMed = isOrder ? 3 : 2;

  if ((activitiesLastHour ?? 0) >= burstThresholdHigh) {
    signals.push({
      type: `${ctx.entity_type.toLowerCase()}_burst_1h`,
      severity: "high",
      description: `${activitiesLastHour} ${isOrder ? 'commandes' : 'réservations'} en 1 heure`,
      weight: 35,
    });
  } else if ((activitiesLastHour ?? 0) >= burstThresholdMed) {
    signals.push({
      type: `${ctx.entity_type.toLowerCase()}_burst_1h_moderate`,
      severity: "medium",
      description: `${activitiesLastHour} ${isOrder ? 'commandes' : 'réservations'} en 1 heure`,
      weight: 20,
    });
  }

  // ── Signal 3: Activités annulées / rejetées ────────────────────────────────
  const { count: cancelledActivities } = await (supabase
    .from(table) as any)
    .select("*", { count: "exact", head: true })
    .eq("customer_id", ctx.customer_id)
    .in("status", ["CANCELLED", "REJECTED"])
    .gte("created_at", oneDayAgo);

  if ((cancelledActivities ?? 0) >= 3) {
    signals.push({
      type: "high_cancellation_rate",
      severity: "medium",
      description: `${cancelledActivities} ${isOrder ? 'commandes' : 'réservations'} annulées/rejetées en 24h`,
      weight: 20,
    });
  }

  // ── Signal 4: Montant anormalement élevé ──────────────────────────────────
  const priceColumn = isOrder ? "total_price" : "price";
  const { data: avgActivity } = await (supabase
    .from(table) as any)
    .select(priceColumn)
    .eq("store_id", ctx.store_id)
    .eq("status", "COMPLETED")
    .limit(50);

  let avg = 500; // Baseline fallback average price in TND
  let hasEnoughHistory = false;
  if (avgActivity && avgActivity.length > 5) {
    avg = avgActivity.reduce((sum: number, o: any) => sum + (o[priceColumn] ?? 0), 0) / avgActivity.length;
    hasEnoughHistory = true;
  }

  if (ctx.total > avg * 4) {
    signals.push({
      type: "abnormal_amount",
      severity: "high",
      description: `Montant ${ctx.total} TND — ${Math.round(ctx.total / avg)}x la moyenne ${hasEnoughHistory ? '' : 'estimée '}(${Math.round(avg)} TND)`,
      weight: 25,
    });
  } else if (ctx.total > avg * 2.5) {
    signals.push({
      type: "high_amount",
      severity: "low",
      description: `Montant élevé vs moyenne boutique`,
      weight: 10,
    });
  }

  // ── Signal 5: Quantité suspecte (Seulement pour les commandes) ──────────────
  if (isOrder && ctx.quantity && ctx.quantity > 20) {
    signals.push({
      type: "bulk_quantity",
      severity: "medium",
      description: `Quantité inhabituelle: ${ctx.quantity} unités`,
      weight: 15,
    });
  }

  // ── Signal 6: Adresse de livraison (Seulement pour les commandes) ────────────
  if (isOrder && (!ctx.delivery_address || ctx.delivery_address.trim().length < 10)) {
    signals.push({
      type: "invalid_address",
      severity: "medium",
      description: "Adresse de livraison incomplète ou invalide",
      weight: 15,
    });
  }

  // ── Signal 7: Même boutique, activités répétées ───────────────────────────
  const { count: sameBusinessActivities } = await (supabase
    .from(table) as any)
    .select("*", { count: "exact", head: true })
    .eq("customer_id", ctx.customer_id)
    .eq("store_id", ctx.store_id)
    .eq("status", "PENDING")
    .gte("created_at", oneHourAgo);

  if ((sameBusinessActivities ?? 0) >= 3) {
    signals.push({
      type: `same_business_spam`,
      severity: "high",
      description: `${sameBusinessActivities} ${isOrder ? 'commandes' : 'réservations'} PENDING chez le même merchant en 1h`,
      weight: 30,
    });
  }

  return signals;
}

// ─── Step 2: Score heuristique ────────────────────────────────────────────────

function computeHeuristicScore(signals: FraudSignal[]): number {
  const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
  return Math.min(100, rawScore);
}

// ─── Step 3: Analyse IA via OpenRouter ───────────────────────────────────────

async function analyzeWithAI(
  ctx: FraudContext,
  signals: FraudSignal[],
  heuristicScore: number
): Promise<string> {
  // Si pas de signaux ou score très bas, pas besoin de l'IA
  if (signals.length === 0 || heuristicScore < 15) {
    return "Aucun signal suspect détecté. Activité conforme aux patterns habituels.";
  }

  const signalsSummary = signals
    .map((s) => `- [${s.severity.toUpperCase()}] ${s.description} (+${s.weight}pts)`)
    .join("\n");

  const prompt = `Tu es un système anti-fraude pour Ro2ya, une marketplace tunisienne.

Analyse cette ${ctx.entity_type === 'ORDER' ? 'commande' : 'réservation'} suspecte et donne un avis court (2-3 phrases max) en français:

CONTEXTE:
- Type: ${ctx.entity_type}
- Montant: ${ctx.total} TND
${ctx.quantity ? `- Quantité: ${ctx.quantity} unités` : ''}
${ctx.delivery_address ? `- Adresse: "${ctx.delivery_address}"` : ''}
- Score heuristique: ${heuristicScore}/100

SIGNAUX DÉTECTÉS:
${signalsSummary}

Donne uniquement ton analyse du risque et si le merchant doit approuver, vérifier manuellement ou rejeter. Sois direct et concis.`;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    if (heuristicScore >= 75) return "Score de risque très élevé. Vérification manuelle fortement recommandée avant validation.";
    if (heuristicScore >= 55) return "Plusieurs signaux suspects détectés. Contacter le client pour vérification.";
    return "Signaux mineurs détectés. Peut être approuvé avec vigilance.";
  }

  const modelChain = [
    process.env.OPENROUTER_MODEL,
    "meta-llama/llama-3.2-3b-instruct",
    "meta-llama/llama-3.3-70b-instruct",
    "meta-llama/llama-3.2-3b-instruct:free",
    "meta-llama/llama-3.3-70b-instruct:free",
  ].filter(Boolean) as string[];
  const uniqueModels = [...new Set(modelChain)];

  let lastErr: any = null;
  for (const model of uniqueModels) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
            "X-Title": "Ro2ya Fraud Detection",
          },
          body: JSON.stringify({
            model,
            max_tokens: 200,
            temperature: 0.2, // déterministe pour la sécurité
            messages: [{ role: "user", content: prompt }],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenRouter error (${model}): ${response.status} - ${await response.text()}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch (err: any) {
      console.warn(`[AI Fraud Analysis] Model ${model} failed, trying next... Error:`, err.message || err);
      lastErr = err;
    }
  }

  console.error('[AI Fraud Analysis] All models failed. Fallback to heuristics.', lastErr);
  if (heuristicScore >= 75) return "Score de risque très élevé. Vérification manuelle fortement recommandée avant validation.";
  if (heuristicScore >= 55) return "Plusieurs signaux suspects détectés. Contacter le client pour vérification.";
  return "Signaux mineurs détectés. Peut être approuvé avec vigilance.";
}

// ─── Step 4: Niveau et recommandation finale ──────────────────────────────────

function computeLevel(score: number): FraudAnalysis["level"] {
  if (score < SCORE_THRESHOLDS.safe) return "safe";
  if (score < SCORE_THRESHOLDS.suspicious) return "suspicious";
  if (score < SCORE_THRESHOLDS.high_risk) return "high_risk";
  return "blocked";
}

function computeRecommendation(
  level: FraudAnalysis["level"]
): FraudAnalysis["recommendation"] {
  if (level === "safe") return "approve";
  if (level === "suspicious") return "review";
  return "reject";
}

// ─── Fonction principale exportée ─────────────────────────────────────────────

/**
 * Analyse une commande ou une réservation pour détecter d'éventuelles fraudes
 */
export async function analyzeFraud(ctx: FraudContext): Promise<FraudAnalysis> {
  const signals = await collectHeuristicSignals(ctx);
  const heuristicScore = computeHeuristicScore(signals);
  const ai_reasoning = await analyzeWithAI(ctx, signals, heuristicScore);
  const level = computeLevel(heuristicScore);

  return {
    score: heuristicScore,
    level,
    signals,
    recommendation: computeRecommendation(level),
    ai_reasoning,
    checked_at: new Date().toISOString(),
  };
}

// ─── Sauvegarde en DB ─────────────────────────────────────────────────────────

/**
 * Sauvegarde le résultat de l'analyse dans la base de données
 */
export async function saveFraudAnalysis(
  entityId: number,
  analysis: FraudAnalysis,
  type: 'ORDER' | 'BOOKING'
): Promise<void> {
  const supabase = createClient();
  const table = type === 'ORDER' ? "order_fraud_checks" : "booking_fraud_checks";
  const idColumn = type === 'ORDER' ? 'order_id' : 'booking_id';

  const { error } = await (supabase as any).from(table).upsert({
    [idColumn]: entityId,
    score: analysis.score,
    level: analysis.level,
    signals: analysis.signals,
    recommendation: analysis.recommendation,
    ai_reasoning: analysis.ai_reasoning,
    checked_at: analysis.checked_at,
  }, { onConflict: idColumn });

  if (error) {
    console.error(`[Fraud Detection] Error saving ${type} analysis:`, error);
  }
}
