// ─────────────────────────────────────────────
//  Types — Comment Intelligence System
//  Tunisian Marketplace · Reels Feature
// ─────────────────────────────────────────────

export type Sentiment = "positive" | "negative" | "neutral";
export type AlertLevel = "critical" | "warning" | "info" | "success";

export type UserIntent =
  | "achat_imminent"
  | "demande_info"
  | "plainte"
  | "compliment"
  | "question_livraison"
  | "question_prix"
  | "question_qualite"
  | "partage_experience"
  | "comparaison_concurrent"
  | "demande_promo"
  | "abandon_panier"
  | "demande_disponibilite"
  | "question_taille_couleur"
  | "signalement_probleme";

export type CommentTopic =
  | "prix"
  | "qualite"
  | "livraison"
  | "service_client"
  | "produit"
  | "paiement"
  | "interface_app"
  | "contenu_reel"
  | "stock"
  | "retour_remboursement"
  | "authenticite"
  | "emballage";

export type UserEmotion =
  | "satisfait"
  | "enthousiaste"
  | "frustre"
  | "impatient"
  | "decu"
  | "curieux"
  | "hesitant"
  | "en_colere"
  | "neutre"
  | "surpris"
  | "sceptique";

export type Language = "darija" | "arabic" | "french" | "mixed";

// ─── Request ───────────────────────────────────

export interface AnalyzeCommentRequest {
  comment: string;
  reelId?: string;        // ID du reel concerné
  businessId?: string;    // ID du business/service owner
  productId?: string;     // ID produit si mentionné
  userId?: string;        // ID commentateur (anonymisé possible)
  context?: {
    productCategory?: string;  // ex: "vetements", "electronique"
    previousSentiment?: Sentiment; // contexte historique
    reelType?: "product_showcase" | "tutorial" | "promotion" | "review";
  };
}

export interface BatchAnalyzeRequest {
  comments: AnalyzeCommentRequest[];
  businessId: string;
}

// ─── AI Raw Output ─────────────────────────────

export interface AIAnalysisRaw {
  sentiment: Sentiment;
  confidence: number;                    // 0.0 → 1.0
  sentiment_label_fr: string;
  detected_language: Language;
  original_text_normalized: string;      // texte nettoyé/normalisé
  intentions: UserIntent[];
  topics: CommentTopic[];
  emotions: UserEmotion[];
  purchase_signals: {
    has_purchase_intent: boolean;
    urgency_level: "low" | "medium" | "high" | "none";
    price_sensitivity: boolean;
    competitor_mention: boolean;
  };
  key_phrases: string[];                 // phrases clés extraites
  summary_fr: string;                    // résumé 1 phrase
  suggested_solution?: string;           // proposition d'amélioration/solution
}

// ─── Business Alerts ───────────────────────────

export interface BusinessAlert {
  id: string;
  level: AlertLevel;
  type:
    | "improvement_needed"
    | "positive_reinforcement"
    | "purchase_opportunity"
    | "competitor_threat"
    | "service_issue"
    | "content_feedback"
    | "pricing_concern";
  title: string;
  message: string;
  recommendations: BusinessRecommendation[];
  priority: number;   // 1 (high) → 5 (low)
  auto_reply_suggestion?: string;  // suggestion de réponse au commentaire
}

export interface BusinessRecommendation {
  action: string;           // action concrète
  category: "pricing" | "content" | "service" | "product" | "marketing" | "logistics";
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  timeframe: "immediate" | "short_term" | "long_term";
}

// ─── Full Analysis Result ──────────────────────

export interface CommentAnalysisResult {
  // Meta
  commentId: string;
  analyzedAt: string;       // ISO timestamp
  processingMs: number;

  // Input (sanitized)
  originalComment: string;
  reelId?: string;
  businessId?: string;
  productId?: string;

  // AI Analysis
  analysis: AIAnalysisRaw;

  // Business Intelligence
  alerts: BusinessAlert[];
  engagementScore: number;       // 0–100 — score d'engagement potentiel
  conversionProbability: number; // 0–100 — prob. de conversion en achat
  riskScore: number;             // 0–100 — risque de churn/bad press

  // Metadata
  modelUsed: string;
  tokensUsed?: number;
}

// ─── Batch Result ──────────────────────────────

export interface BatchAnalysisResult {
  batchId: string;
  businessId: string;
  totalComments: number;
  processedAt: string;
  results: CommentAnalysisResult[];
  aggregate: {
    sentimentBreakdown: Record<Sentiment, number>;
    topIntents: Array<{ intent: UserIntent; count: number }>;
    topTopics: Array<{ topic: CommentTopic; count: number }>;
    avgEngagementScore: number;
    avgConversionProbability: number;
    criticalAlerts: number;
    overallHealthScore: number;     // 0–100
  };
  globalRecommendations: BusinessRecommendation[];
}

// ─── API Responses ─────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;