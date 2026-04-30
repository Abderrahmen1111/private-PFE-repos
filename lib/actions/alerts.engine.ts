// ─────────────────────────────────────────────
//  lib/alerts.engine.ts
//  Transforms raw AI analysis → Business Alerts
//  & Actionable Recommendations for service owners
// ─────────────────────────────────────────────

import { randomUUID } from "crypto";
import type {
  AIAnalysisRaw,
  AlertLevel,
  BusinessAlert,
  BusinessRecommendation,
  CommentAnalysisResult,
} from "@/types/comment.types";

// ─── Scoring Engine ────────────────────────────

export function computeScores(analysis: AIAnalysisRaw): {
  engagementScore: number;
  conversionProbability: number;
  riskScore: number;
} {
  const { sentiment, confidence, intentions, emotions, purchase_signals } = analysis;

  // ── Engagement Score (0–100) ──────────────────
  // High engagement = clear intent + strong emotion
  let engagement = 40; // baseline

  if (purchase_signals.has_purchase_intent) engagement += 25;
  if (purchase_signals.urgency_level === "high") engagement += 15;
  else if (purchase_signals.urgency_level === "medium") engagement += 8;

  if (intentions.includes("achat_imminent")) engagement += 20;
  if (intentions.includes("demande_info")) engagement += 10;
  if (intentions.includes("partage_experience")) engagement += 12;

  if (emotions.includes("enthousiaste")) engagement += 10;
  if (emotions.includes("curieux")) engagement += 8;
  if (emotions.includes("impatient")) engagement += 5;

  // ── Conversion Probability (0–100) ───────────
  let conversion = 10; // baseline

  if (purchase_signals.has_purchase_intent) conversion += 35;
  if (purchase_signals.urgency_level === "high") conversion += 20;
  else if (purchase_signals.urgency_level === "medium") conversion += 10;
  if (!purchase_signals.price_sensitivity) conversion += 10;
  if (purchase_signals.competitor_mention) conversion -= 15;

  if (intentions.includes("achat_imminent")) conversion += 25;
  if (intentions.includes("demande_disponibilite")) conversion += 15;
  if (intentions.includes("abandon_panier")) conversion -= 20;

  if (sentiment === "positive") conversion += 15;
  else if (sentiment === "negative") conversion -= 25;

  conversion = Math.min(100, Math.max(0, Math.round(conversion * confidence)));

  // ── Risk Score (0–100) — higher = more dangerous ──
  let risk = 0;

  if (sentiment === "negative") risk += 40;
  if (purchase_signals.competitor_mention) risk += 20;

  if (emotions.includes("en_colere")) risk += 25;
  if (emotions.includes("decu")) risk += 15;
  if (emotions.includes("frustre")) risk += 12;
  if (emotions.includes("sceptique")) risk += 8;

  if (intentions.includes("plainte")) risk += 20;
  if (intentions.includes("signalement_probleme")) risk += 25;
  if (intentions.includes("comparaison_concurrent")) risk += 15;

  risk = Math.min(100, Math.round(risk * confidence));

  return {
    engagementScore: Math.min(100, Math.round(engagement * confidence)),
    conversionProbability: conversion,
    riskScore: risk,
  };
}

// ─── Alert Generator ───────────────────────────

export function generateAlerts(analysis: AIAnalysisRaw): BusinessAlert[] {
  const alerts: BusinessAlert[] = [];
  const {
    sentiment,
    confidence,
    intentions,
    topics,
    emotions,
    purchase_signals,
    summary_fr,
    key_phrases,
  } = analysis;

  // ── 1. Purchase Opportunity ───────────────────
  if (
    purchase_signals.has_purchase_intent &&
    purchase_signals.urgency_level !== "none" &&
    sentiment !== "negative"
  ) {
    const urgencyLabels = {
      high: "⚡ URGENT",
      medium: "🔔 Moyen terme",
      low: "📅 Long terme",
      none: "",
    };

    alerts.push({
      id: randomUUID(),
      level: purchase_signals.urgency_level === "high" ? "critical" : "warning",
      type: "purchase_opportunity",
      title: `${urgencyLabels[purchase_signals.urgency_level]} — Intention d'achat détectée`,
      message: `Un utilisateur montre une forte intention d'achat: "${summary_fr}". ${
        purchase_signals.price_sensitivity
          ? "Il est sensible au prix — pensez à proposer une offre."
          : ""
      }`,
      priority: purchase_signals.urgency_level === "high" ? 1 : 2,
      recommendations: buildPurchaseRecommendations(purchase_signals, topics),
      auto_reply_suggestion: buildAutoReply("purchase", key_phrases, analysis.detected_language),
    });
  }

  // ── 2. Service Issue / Complaint ──────────────
  if (
    intentions.includes("plainte") ||
    intentions.includes("signalement_probleme") ||
    (sentiment === "negative" && confidence > 0.75)
  ) {
    const level: AlertLevel =
      emotions.includes("en_colere") || confidence > 0.9 ? "critical" : "warning";

    alerts.push({
      id: randomUUID(),
      level,
      type: "service_issue",
      title: `🚨 Plainte détectée — Action immédiate requise`,
      message: `Commentaire négatif avec ${Math.round(confidence * 100)}% de confiance: "${summary_fr}". Sujets concernés: ${topics.join(", ")}.`,
      priority: level === "critical" ? 1 : 2,
      recommendations: buildComplaintRecommendations(topics, emotions),
      auto_reply_suggestion: buildAutoReply("complaint", key_phrases, analysis.detected_language),
    });
  }

  // ── 3. Pricing Concern ────────────────────────
  if (topics.includes("prix") || purchase_signals.price_sensitivity) {
    const isPricingComplaint = sentiment === "negative" && topics.includes("prix");

    alerts.push({
      id: randomUUID(),
      level: isPricingComplaint ? "warning" : "info",
      type: "pricing_concern",
      title: isPricingComplaint
        ? "💸 Problème de prix signalé"
        : "💡 Sensibilité prix détectée",
      message: isPricingComplaint
        ? `L'utilisateur trouve le prix trop élevé. Vérifiez votre positionnement tarifaire.`
        : `L'utilisateur compare les prix — une promotion ou un justificatif de valeur pourrait convertir.`,
      priority: isPricingComplaint ? 2 : 3,
      recommendations: [
        {
          action: isPricingComplaint
            ? "Analyser les prix de vos concurrents sur ce segment"
            : "Ajouter une section 'Pourquoi ce prix' dans la description produit ou le Reel",
          category: "pricing",
          impact: "high",
          effort: "medium",
          timeframe: "short_term",
        },
        {
          action: "Proposer un code promo via DM automatique aux commentateurs prix-sensibles",
          category: "marketing",
          impact: "high",
          effort: "low",
          timeframe: "immediate",
        },
      ],
    });
  }

  // ── 4. Competitor Threat ──────────────────────
  if (purchase_signals.competitor_mention) {
    alerts.push({
      id: randomUUID(),
      level: "warning",
      type: "competitor_threat",
      title: "⚔️ Concurrent mentionné dans les commentaires",
      message: `Un utilisateur compare votre offre à un concurrent. Risque de perte de client.`,
      priority: 2,
      recommendations: [
        {
          action: "Identifier le concurrent mentionné et analyser son avantage perçu",
          category: "marketing",
          impact: "high",
          effort: "low",
          timeframe: "immediate",
        },
        {
          action: "Créer un Reel comparatif mettant en avant vos avantages uniques",
          category: "content",
          impact: "high",
          effort: "medium",
          timeframe: "short_term",
        },
      ],
    });
  }

  // ── 5. Positive Reinforcement ─────────────────
  if (sentiment === "positive" && confidence > 0.75) {
    alerts.push({
      id: randomUUID(),
      level: "success",
      type: "positive_reinforcement",
      title: "✅ Commentaire positif — À capitaliser",
      message: `Retour très positif: "${summary_fr}". Utilisez ce témoignage dans votre stratégie de contenu.`,
      priority: 4,
      recommendations: [
        {
          action: "Épingler ce commentaire en haut du Reel pour booster la preuve sociale",
          category: "marketing",
          impact: "medium",
          effort: "low",
          timeframe: "immediate",
        },
        {
          action:
            "Demander à l'utilisateur s'il accepte de faire un témoignage vidéo ou story",
          category: "content",
          impact: "high",
          effort: "low",
          timeframe: "immediate",
        },
        {
          action: "Répliquer le format de ce Reel — il génère des retours positifs",
          category: "content",
          impact: "high",
          effort: "medium",
          timeframe: "short_term",
        },
      ],
    });
  }

  // ── 6. Delivery / Logistics Issue ────────────
  if (topics.includes("livraison") && sentiment !== "positive") {
    alerts.push({
      id: randomUUID(),
      level: emotions.includes("en_colere") ? "critical" : "warning",
      type: "service_issue",
      title: "🚚 Problème de livraison signalé",
      message: `Un client se plaint de la livraison. Chaque commentaire visible peut dissuader d'autres acheteurs.`,
      priority: 2,
      recommendations: [
        {
          action: "Contacter le client en DM dans les 2h pour résoudre le problème",
          category: "service",
          impact: "high",
          effort: "low",
          timeframe: "immediate",
        },
        {
          action: "Ajouter les délais de livraison réels dans la description du Reel/produit",
          category: "product",
          impact: "medium",
          effort: "low",
          timeframe: "immediate",
        },
        {
          action: "Négocier des délais de livraison plus courts avec votre transporteur",
          category: "logistics",
          impact: "high",
          effort: "high",
          timeframe: "long_term",
        },
      ],
    });
  }

  // ── 7. Content Feedback ───────────────────────
  if (topics.includes("contenu_reel") || intentions.includes("partage_experience")) {
    alerts.push({
      id: randomUUID(),
      level: sentiment === "negative" ? "warning" : "info",
      type: "content_feedback",
      title:
        sentiment === "negative"
          ? "📹 Feedback négatif sur le contenu Reel"
          : "📹 Feedback sur le contenu Reel",
      message: `L'utilisateur réagit au format/contenu du Reel lui-même. Indicateur pour votre stratégie de contenu.`,
      priority: 3,
      recommendations: [
        {
          action:
            sentiment === "negative"
              ? "Analyser ce Reel — durée, qualité, clarté du message à améliorer"
              : "Documenter ce format de Reel comme template à reproduire",
          category: "content",
          impact: "medium",
          effort: "medium",
          timeframe: "short_term",
        },
      ],
    });
  }

  // ── 8. AI Strategic Advice ────────────────────
  if (analysis.suggested_solution) {
    alerts.push({
      id: randomUUID(),
      level: sentiment === "negative" ? "critical" : "info",
      type: "improvement_needed",
      title: "💡 Conseil Stratégique IA",
      message: analysis.suggested_solution,
      priority: sentiment === "negative" ? 1 : 3,
      recommendations: [
        {
          action: "Appliquer la solution suggérée par l'IA pour ce cas spécifique",
          category: "service",
          impact: "high",
          effort: "medium",
          timeframe: "immediate",
        }
      ],
    });
  }

  // Sort by priority
  return alerts.sort((a, b) => a.priority - b.priority);
}

// ─── Sub-builders ──────────────────────────────

function buildPurchaseRecommendations(
  signals: AIAnalysisRaw["purchase_signals"],
  topics: AIAnalysisRaw["topics"]
): BusinessRecommendation[] {
  const recs: BusinessRecommendation[] = [];

  recs.push({
    action: "Répondre au commentaire avec un lien direct vers la page produit ou panier",
    category: "marketing",
    impact: "high",
    effort: "low",
    timeframe: "immediate",
  });

  if (signals.price_sensitivity) {
    recs.push({
      action: "Envoyer un code promo personnalisé via DM pour déclencher l'achat",
      category: "pricing",
      impact: "high",
      effort: "low",
      timeframe: "immediate",
    });
  }

  if (topics.includes("stock")) {
    recs.push({
      action: "Confirmer la disponibilité du stock dans la réponse publique",
      category: "product",
      impact: "medium",
      effort: "low",
      timeframe: "immediate",
    });
  }

  recs.push({
    action: "Activer le bouton 'Acheter maintenant' dans ce Reel si pas encore fait",
    category: "marketing",
    impact: "high",
    effort: "low",
    timeframe: "immediate",
  });

  return recs;
}

function buildComplaintRecommendations(
  topics: AIAnalysisRaw["topics"],
  emotions: AIAnalysisRaw["emotions"]
): BusinessRecommendation[] {
  const recs: BusinessRecommendation[] = [];

  recs.push({
    action: "Répondre publiquement dans les 30 minutes avec empathie et solution concrète",
    category: "service",
    impact: "high",
    effort: "low",
    timeframe: "immediate",
  });

  if (emotions.includes("en_colere") || emotions.includes("frustre")) {
    recs.push({
      action: "Proposer un remboursement ou geste commercial immédiat via DM",
      category: "service",
      impact: "high",
      effort: "low",
      timeframe: "immediate",
    });
  }

  if (topics.includes("qualite")) {
    recs.push({
      action: "Auditer le lot de produits concerné — vérifier s'il y a un problème systémique",
      category: "product",
      impact: "high",
      effort: "medium",
      timeframe: "short_term",
    });
  }

  if (topics.includes("service_client")) {
    recs.push({
      action: "Revoir le script de réponse du service client pour ce type de problème",
      category: "service",
      impact: "medium",
      effort: "medium",
      timeframe: "short_term",
    });
  }

  return recs;
}

// ─── Auto-Reply Suggestions ────────────────────

function buildAutoReply(
  type: "purchase" | "complaint",
  keyPhrases: string[],
  lang: string
): string {
  const isArabic = lang === "arabic" || lang === "darija";

  if (type === "purchase") {
    return isArabic
      ? `مرحبا! يسعدنا إهتمامك 🙏 تقدر تطلب مباشرتن من هنا 👉 [LIEN_PRODUIT] أو تكلمنا في DM وين يوجد أي سؤال`
      : `Merci de votre intérêt ! 🙏 Vous pouvez commander directement ici 👉 [LIEN_PRODUIT] ou contactez-nous en DM pour toute question.`;
  }

  return isArabic
    ? `آسفين على هذه التجربة 🙏 تواصل معانا مباشرتن في DM باش نحلو المشكل سريعاً`
    : `Nous sommes désolés pour cette expérience 🙏 Contactez-nous en DM et nous réglerons cela rapidement.`;
}

// ─── Global Health Score (for batch) ──────────

export function computeHealthScore(results: CommentAnalysisResult[]): number {
  if (!results.length) return 0;

  const positiveRatio =
    results.filter((r) => r.analysis.sentiment === "positive").length / results.length;
  const avgConversion =
    results.reduce((s, r) => s + r.conversionProbability, 0) / results.length;
  const avgRisk = results.reduce((s, r) => s + r.riskScore, 0) / results.length;

  const health = positiveRatio * 50 + (avgConversion / 100) * 30 - (avgRisk / 100) * 20;
  return Math.min(100, Math.max(0, Math.round(health)));
}