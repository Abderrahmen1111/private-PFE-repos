// ─────────────────────────────────────────────
//  lib/actions/groq-service.ts
//  Core AI analysis via Groq API
//  Model: llama-3.3-70b-versatile (State-of-the-art, fast, handles Darija perfectly)
// ─────────────────────────────────────────────

import type {
  AIAnalysisRaw,
  AnalyzeCommentRequest,
  Language,
} from "@/types/comment.types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ─── Prompt Builder (Same logic as existing service) ───────────────────

function buildAnalysisPrompt(req: AnalyzeCommentRequest): string {
  const contextBlock = req.context
    ? `
CONTEXTE ADDITIONNEL:
- Catégorie produit: ${req.context.productCategory ?? "non précisée"}
- Type de Reel: ${req.context.reelType ?? "non précisé"}
- Sentiment précédent du user: ${req.context.previousSentiment ?? "inconnu"}
`
    : "";

  return `Tu es un expert en analyse de commentaires pour une marketplace tunisienne (Ro2ya) avec une fonctionnalité Reels.

Les commentaires peuvent être en:
- Tunisien dialectal (Darija)
- Arabe standard
- Français
- Mix Darija/Français/Arabe

${contextBlock}

Analyse ce commentaire: "${req.comment}"

Réponds UNIQUEMENT avec un objet JSON valide. Pas de markdown, pas de texte avant ou après.

{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <nombre entre 0.5 et 1.0>,
  "sentiment_label_fr": "Positif" | "Négatif" | "Neutre",
  "detected_language": "darija" | "arabic" | "french" | "mixed",
  "original_text_normalized": "<texte normalisé, corrigé>",
  "intentions": [<achat_imminent, demande_info, plainte, compliment, question_livraison, question_prix, question_qualite, partage_experience, comparaison_concurrent, demande_promo, abandon_panier, demande_disponibilite, question_taille_couleur, signalement_probleme>],
  "topics": [<prix, qualite, livraison, service_client, produit, paiement, interface_app, contenu_reel, stock, retour_remboursement, authenticite, emballage>],
  "emotions": [<satisfait, enthousiaste, frustre, impatient, decu, curieux, hesitant, en_colere, neutre, surpris, sceptique>],
  "purchase_signals": {
    "has_purchase_intent": <true | false>,
    "urgency_level": "none" | "low" | "medium" | "high",
    "price_sensitivity": <true | false>,
    "competitor_mention": <true | false>
  },
  "key_phrases": [<2-5 phrases ou mots clés importants extraits>],
  "summary_fr": "<résumé du commentaire en 1 phrase courte en français>",
  "suggested_solution": "<proposition concrète de solution ou d'amélioration basée sur ce commentaire spécifique>"
}`;
}

// ─── Groq Call ─────────────────────────────────

export async function analyzeCommentWithGroq(
  req: AnalyzeCommentRequest,
  apiKey: string
): Promise<{ raw: AIAnalysisRaw; tokensUsed: number; model: string }> {
  // Using 8B Instant for maximum reliability and speed on free tier
  const model = "llama-3.1-8b-instant";
  const prompt = buildAnalysisPrompt(req);

  console.log(`[Groq] Analyzing comment with ${model}...`);

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new GroqError(
      errorBody?.error?.message ?? `Groq HTTP ${response.status}`,
      response.status,
      errorBody
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const tokensUsed = data.usage?.total_tokens ?? 0;

  console.log(`[Analyzer] ✅ Analysis success for: "${req.comment.slice(0, 30)}..."`);

  const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();

  let parsed: AIAnalysisRaw;
  try {
    parsed = JSON.parse(cleaned) as AIAnalysisRaw;
  } catch {
    throw new ParseError(`Failed to parse Groq response: ${cleaned.slice(0, 200)}`);
  }

  validateAIResponse(parsed);

  return { raw: parsed, tokensUsed, model: data.model || model };
}

// ─── Validation & Errors ───────────────────────

function validateAIResponse(data: unknown): asserts data is AIAnalysisRaw {
  const d = data as Record<string, unknown>;
  const validSentiments = ["positive", "negative", "neutral"];
  const validLanguages: Language[] = ["darija", "arabic", "french", "mixed"];

  if (!validSentiments.includes(d.sentiment as string)) d.sentiment = "neutral";
  if (!validLanguages.includes(d.detected_language as Language)) d.detected_language = "mixed";
  if (typeof d.confidence !== "number") d.confidence = 0.75;
  if (!Array.isArray(d.intentions)) d.intentions = [];
  if (!Array.isArray(d.topics)) d.topics = [];
  if (!Array.isArray(d.emotions)) d.emotions = [];
  if (!Array.isArray(d.key_phrases)) d.key_phrases = [];
  if (!d.purchase_signals || typeof d.purchase_signals !== "object") {
    d.purchase_signals = {
      has_purchase_intent: false,
      urgency_level: "none",
      price_sensitivity: false,
      competitor_mention: false,
    };
  }
}

export class GroqError extends Error {
  constructor(message: string, public statusCode: number, public body?: unknown) {
    super(message);
    this.name = "GroqError";
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}
