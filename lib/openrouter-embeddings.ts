/**
 * OpenRouter Embeddings Client
 * Model: baai/bge-m3 (1024 dimensions, state-of-the-art multilingual)
 * API: https://openrouter.ai/api/v1/embeddings
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/embeddings';
const EMBEDDING_MODEL = 'baai/bge-m3';
const EMBEDDING_DIMENSIONS = 1024;

// Simple in-memory cache to avoid duplicate API calls
const embeddingCache = new Map<string, number[]>();

/**
 * Generate a single embedding vector for a text string using OpenRouter
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const key = text.trim().toLowerCase();
  
  // Check cache
  const cached = embeddingCache.get(key);
  if (cached) return cached;

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Tunisian Marketplace Semantic Search',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Embedding API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const embedding: number[] = data.data?.[0]?.embedding;

  if (!embedding || embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Invalid embedding: expected ${EMBEDDING_DIMENSIONS} dims, got ${embedding?.length}`);
  }

  // Cache result
  embeddingCache.set(key, embedding);

  return embedding;
}

/**
 * Generate a query embedding (alias for consistency with existing search logic)
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(query);
}

/**
 * Generate embeddings for multiple texts in a single batch
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  }

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Tunisian Marketplace Semantic Search',
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter Batch Embedding API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data.map((d: any) => d.embedding);
}

export { EMBEDDING_DIMENSIONS };
