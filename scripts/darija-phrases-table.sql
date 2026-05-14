-- ============================================================
-- TABLE: darija_phrases
-- Stores Darija phrases with vector embeddings for RAG search.
-- Run this in the Supabase SQL editor BEFORE migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS darija_phrases (
  id            BIGSERIAL PRIMARY KEY,
  darija_phrase TEXT NOT NULL,
  french_meaning TEXT NOT NULL,
  category      TEXT DEFAULT 'phrases_embedding',
  embedding     vector(768),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast approximate nearest neighbor search
-- lists = 100 is good for ~500K vectors
CREATE INDEX IF NOT EXISTS darija_phrases_embedding_idx
  ON darija_phrases
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Text index for fallback keyword search
CREATE INDEX IF NOT EXISTS darija_phrases_phrase_idx
  ON darija_phrases USING GIN (to_tsvector('simple', darija_phrase));

-- ── Search function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_darija_phrases(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count     int   DEFAULT 5
)
RETURNS TABLE(
  id             bigint,
  darija_phrase  text,
  french_meaning text,
  category       text,
  similarity     float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    darija_phrase,
    french_meaning,
    category,
    1 - (embedding <=> query_embedding) AS similarity
  FROM darija_phrases
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── Keyword fallback ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION keyword_search_darija(
  query_text text,
  match_count int DEFAULT 5
)
RETURNS TABLE(
  id             bigint,
  darija_phrase  text,
  french_meaning text
)
LANGUAGE sql STABLE
AS $$
  SELECT id, darija_phrase, french_meaning
  FROM darija_phrases
  WHERE darija_phrase ILIKE '%' || query_text || '%'
     OR french_meaning ILIKE '%' || query_text || '%'
  LIMIT match_count;
$$;
