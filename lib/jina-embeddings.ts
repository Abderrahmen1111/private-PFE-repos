/**
 * Jina AI Embeddings Client
 * Model: jina-embeddings-v3 (1024 dimensions, multilingual — Arabic/Darija support)
 * API: https://api.jina.ai/v1/embeddings
 */

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings';
const JINA_MODEL = 'jina-embeddings-v3';
const EMBEDDING_DIMENSIONS = 1024;

// Simple in-memory cache to avoid duplicate API calls
const embeddingCache = new Map<string, number[]>();

/**
 * Generate a single embedding vector for a text string
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const key = text.trim().toLowerCase();
  
  // Check cache
  const cached = embeddingCache.get(key);
  if (cached) return cached;

  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('JINA_API_KEY is not set in environment variables');
  }

  const response = await fetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      task: 'retrieval.passage',
      dimensions: EMBEDDING_DIMENSIONS,
      input: [text],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Jina API error (${response.status}): ${err}`);
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
 * Generate a query embedding (uses 'retrieval.query' task for better search results)
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('JINA_API_KEY is not set in environment variables');
  }

  const response = await fetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: JINA_MODEL,
      task: 'retrieval.query',
      dimensions: EMBEDDING_DIMENSIONS,
      input: [query],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Jina API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.data?.[0]?.embedding;
}

/**
 * Generate embeddings for multiple texts in a single batch
 * Max batch size: 100 (Jina limit)
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) {
    throw new Error('JINA_API_KEY is not set in environment variables');
  }

  // Jina supports up to 2048 items per request, but we limit to 100 for safety
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    
    const response = await fetch(JINA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: JINA_MODEL,
        task: 'retrieval.passage',
        dimensions: EMBEDDING_DIMENSIONS,
        input: batch,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Jina batch API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const embeddings = data.data.map((d: any) => d.embedding);
    allEmbeddings.push(...embeddings);
    
    // Small delay between batches to respect rate limits
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return allEmbeddings;
}

export { EMBEDDING_DIMENSIONS };
