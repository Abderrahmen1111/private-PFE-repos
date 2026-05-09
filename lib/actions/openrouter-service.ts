// ─────────────────────────────────────────────
//  lib/openrouter.service.ts
//  Core AI analysis via OpenRouter API
//  Model: mistralai/mistral-7b-instruct (multilingual, handles Darija well)
// ─────────────────────────────────────────────

import type {
  AIAnalysisRaw,
  AnalyzeCommentRequest,
  Language,
} from "@/types/comment.types";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Upgrade to a more powerful model for better Darija/Arabic support
const MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3-haiku";

// ─── Prompt Builder ────────────────────────────

function buildAnalysisPrompt(req: AnalyzeCommentRequest): string {
  const contextBlock = req.context
    ? `
CONTEXTE ADDITIONNEL:
- Catégorie produit: ${req.context.productCategory ?? "non précisée"}
- Type de Reel: ${req.context.reelType ?? "non précisé"}
- Sentiment précédent du user: ${req.context.previousSentiment ?? "inconnu"}
`
    : "";

  return `Tu es un expert en analyse de commentaires pour une marketplace tunisienne avec une fonctionnalité Reels (vidéos courtes de produits).

Les commentaires peuvent être en:
- Tunisien dialectal (Darija): ex "barcha behia", "ki3 ghalet", "mta3 el bel", "3ajebni"
- Arabe standard
- Français
- Mix Darija/Français/Arabe (très courant en Tunisie)

${contextBlock}

Analyse ce commentaire: "${req.comment}"

Réponds UNIQUEMENT avec un objet JSON valide et rien d'autre. Pas de markdown, pas de texte avant ou après.

{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": <nombre entre 0.5 et 1.0>,
  "sentiment_label_fr": "Positif" | "Négatif" | "Neutre",
  "detected_language": "darija" | "arabic" | "french" | "mixed",
  "original_text_normalized": "<texte normalisé, corrigé>",
  "intentions": [<liste parmi: achat_imminent, demande_info, plainte, compliment, question_livraison, question_prix, question_qualite, partage_experience, comparaison_concurrent, demande_promo, abandon_panier, demande_disponibilite, question_taille_couleur, signalement_probleme>],
  "topics": [<liste parmi: prix, qualite, livraison, service_client, produit, paiement, interface_app, contenu_reel, stock, retour_remboursement, authenticite, emballage>],
  "emotions": [<liste parmi: satisfait, enthousiaste, frustre, impatient, decu, curieux, hesitant, en_colere, neutre, surpris, sceptique>],
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

// ─── OpenRouter Call ───────────────────────────

async function callOpenRouter(
  prompt: string,
  apiKey: string
): Promise<{ raw: AIAnalysisRaw; tokensUsed: number; model: string }> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.APP_URL ?? "https://marketplace-tn.app",
      "X-Title": "Tunisian Marketplace Comment Analyzer",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,   // Low temp = deterministic JSON
      max_tokens: 1024,
      response_format: { type: "json_object" }, // force JSON mode if model supports it
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new OpenRouterError(
      errorBody?.error?.message ?? `OpenRouter HTTP ${response.status}`,
      response.status,
      errorBody
    );
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const tokensUsed = data.usage?.total_tokens ?? 0;

  // Strip any accidental markdown fences
  const cleaned = content.replace(/```json\n?|```\n?/g, "").trim();

  let parsed: AIAnalysisRaw;
  try {
    parsed = JSON.parse(cleaned) as AIAnalysisRaw;
  } catch {
    throw new ParseError(`Failed to parse AI response: ${cleaned.slice(0, 200)}`);
  }

  validateAIResponse(parsed);

  return { raw: parsed, tokensUsed, model: data.model ?? MODEL };
}

// ─── Validation ────────────────────────────────

function validateAIResponse(data: unknown): asserts data is AIAnalysisRaw {
  const d = data as Record<string, unknown>;
  const validSentiments = ["positive", "negative", "neutral"];
  const validLanguages: Language[] = ["darija", "arabic", "french", "mixed"];

  if (!validSentiments.includes(d.sentiment as string)) {
    throw new ParseError(`Invalid sentiment: ${d.sentiment}`);
  }
  if (!validLanguages.includes(d.detected_language as Language)) {
    // Fallback silently — non-blocking
    d.detected_language = "mixed";
  }
  if (typeof d.confidence !== "number") {
    d.confidence = 0.75;
  }
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

// ─── Main Export ───────────────────────────────

export async function analyzeCommentWithAI(
  req: AnalyzeCommentRequest,
  apiKey: string
): Promise<{ raw: AIAnalysisRaw; tokensUsed: number; model: string }> {
  const prompt = buildAnalysisPrompt(req);
  return callOpenRouter(prompt, apiKey);
}

// ─── Custom Errors ─────────────────────────────

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class ParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}