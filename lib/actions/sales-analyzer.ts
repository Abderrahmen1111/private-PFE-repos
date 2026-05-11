/**
 * Sales Analyzer - Groq-powered promotion recommendations
 * Analyzes real sales data to provide AI recommendations
 * 
 * OPTIMIZATIONS:
 * - Uses mixtral (faster, cheaper tokens) as primary model
 * - Falls back to llama-3.1-8b-instant if rate limited
 * - Implements simple in-memory cache (5 min TTL)
 * - Includes retry logic with exponential backoff
 * - Optimized prompt for token efficiency
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Simple in-memory cache for recommendations (5 minutes TTL)
const RECOMMENDATION_CACHE = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(storeId: number): string {
  return `sales-recs-${storeId}`;
}

function getFromCache(storeId: number): any | null {
  const key = getCacheKey(storeId);
  const cached = RECOMMENDATION_CACHE.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[SalesAnalyzer] Cache HIT for store ${storeId}`);
    return cached.data;
  }
  if (cached) {
    RECOMMENDATION_CACHE.delete(key);
  }
  return null;
}

function setInCache(storeId: number, data: any): void {
  const key = getCacheKey(storeId);
  RECOMMENDATION_CACHE.set(key, { data, timestamp: Date.now() });
}

export interface SalesData {
  items: Array<{
    id: number;
    name: string;
    type: string;
    price: number;
    views: number;
    sales: number;
    bookings: number;
    viewToSaleRatio: string | number;
  }>;
  orders: Array<{
    itemId: number;
    quantity: number;
    price: number;
    date: string;
    status: string;
  }>;
  bookings: Array<{
    itemId: number;
    price: number;
    date: string;
    status: string;
  }>;
}

export interface Recommendation {
  type: "dormant_product" | "happy_hour" | "bundle" | "upsell";
  title: string;
  description: string;
  suggested_action: string;
  suggestedDiscount?: number;
  targetItems: number[];
  targetItemNames: string[];
  urgency: "low" | "medium" | "high";
  estimatedImpact: string;
  confidence: number;
}

function buildSalesAnalysisPrompt(data: SalesData): string {
  // Ultra-compact data for token efficiency
  const compactItems = data.items.slice(0, 10).map(i => 
    `${i.id}:${i.name.slice(0,10)}|v${i.views}|s${i.sales}`
  ).join(';');

  return `Expert Retail. Analyse: ${compactItems}. Cmds:${data.orders.length}.
  Sortie JSON UNIQUEMENT (Tableau):
  [{"type":"dormant_product"|"happy_hour"|"bundle"|"upsell","title":"","description":"","suggested_action":"","suggestedDiscount":number,"targetItems":[id],"targetItemNames":[""],"urgency":"low"|"medium"|"high","estimatedImpact":"","confidence":0.9}]`;
}

export async function analyzeSalesDataWithGroq(
  data: SalesData,
  apiKey: string,
  storeId?: number
): Promise<Recommendation[]> {
  // Try cache first
  if (storeId) {
    const cached = getFromCache(storeId);
    if (cached) {
      return cached;
    }
  }

  const prompt = buildSalesAnalysisPrompt(data);
  
  // Try with models in order (mixtral is cheaper/faster)
  const models = ["mixtral-8x7b-32768", "llama-3.1-8b-instant"];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[SalesAnalyzer] Trying ${model}...`);
      const recommendations = await callGroqAPI(prompt, apiKey, model);
      
      // Cache on success
      if (storeId) {
        setInCache(storeId, recommendations);
      }
      
      return recommendations;
    } catch (err: any) {
      lastError = err;
      
      // If rate limited, try next model
      if (err.message?.includes("Rate limit")) {
        console.warn(`[SalesAnalyzer] Rate limit on ${model}, trying next...`);
        // Wait a bit before trying next
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      
      // For other errors, try next model
      console.warn(`[SalesAnalyzer] Error with ${model}:`, err.message);
      continue;
    }
  }

  // If all models failed
  throw lastError || new Error("All Groq models failed");
}

async function callGroqAPI(
  prompt: string,
  apiKey: string,
  model: string,
  retryCount = 0
): Promise<Recommendation[]> {
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 2000; // ms, will be multiplied by retry count

  try {
    console.log(`[SalesAnalyzer] Calling ${model} (attempt ${retryCount + 1})...`);

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2, // Very low for consistency
        max_tokens: 1024,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = errorBody?.error?.message ?? `HTTP ${response.status}`;

      // Check for rate limit
      if (response.status === 429 || errorMsg.includes("rate")) {
        const err = new Error(errorMsg);
        (err as any).statusCode = 429;
        throw err;
      }

      throw new Error(errorMsg);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content ?? "";

    if (!content) {
      throw new Error("Empty response from Groq");
    }

    // Parse JSON response
    return parseRecommendations(content);
  } catch (err: any) {
    // Retry with backoff for rate limits
    if (err.statusCode === 429 && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY * (retryCount + 1);
      console.log(`[SalesAnalyzer] Rate limited, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return callGroqAPI(prompt, apiKey, model, retryCount + 1);
    }

    throw err;
  }
}

function parseRecommendations(content: string): Recommendation[] {
  try {
    // Try to parse as direct array or as object with array property
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // If direct parse fails, try extracting JSON array
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (!arrayMatch) throw new Error("No JSON array found in response");
      parsed = JSON.parse(arrayMatch[0]);
    }

    // Ensure it's an array
    const recommendations = Array.isArray(parsed) ? parsed : parsed.recommendations || [];

    if (!Array.isArray(recommendations)) {
      throw new Error("Response is not an array of recommendations");
    }

    // Validate each recommendation
    return recommendations.filter(
      (rec: any): rec is Recommendation =>
        rec &&
        typeof rec === "object" &&
        ["dormant_product", "happy_hour", "bundle", "upsell"].includes(rec.type) &&
        typeof rec.title === "string" &&
        typeof rec.description === "string" &&
        typeof rec.suggested_action === "string" &&
        Array.isArray(rec.targetItems) &&
        Array.isArray(rec.targetItemNames) &&
        ["low", "medium", "high"].includes(rec.urgency) &&
        typeof rec.confidence === "number"
    );
  } catch (err: any) {
    console.error("[SalesAnalyzer] Parse error:", err, "Content:", content.slice(0, 200));
    throw new Error(`Failed to parse Groq response: ${err.message}`);
  }
}  
