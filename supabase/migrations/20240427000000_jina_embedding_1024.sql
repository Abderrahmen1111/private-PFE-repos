-- ============================================================================
-- Migration: Passer embedding de vector(384) à vector(1024) pour Jina AI
-- Modèle: jina-embeddings-v3 (1024 dimensions)
-- ============================================================================

-- 1. Supprimer l'ancien index
DROP INDEX IF EXISTS idx_items_embedding;

-- 2. Supprimer TOUTES les vues qui dépendent de la table items
-- (PostgreSQL ne permet pas d'ALTER une colonne utilisée par une vue)
DO $$
DECLARE
  v RECORD;
BEGIN
  FOR v IN
    SELECT DISTINCT dependee.relname AS view_name
    FROM pg_depend d
    JOIN pg_rewrite r ON r.oid = d.objid
    JOIN pg_class dependee ON dependee.oid = r.ev_class
    JOIN pg_class depended ON depended.oid = d.refobjid
    WHERE depended.relname = 'items'
      AND dependee.relkind = 'v'
      AND dependee.relname != 'items'
  LOOP
    EXECUTE 'DROP VIEW IF EXISTS public.' || quote_ident(v.view_name) || ' CASCADE';
    RAISE NOTICE 'Dropped view: %', v.view_name;
  END LOOP;
END $$;

-- 3. Modifier la colonne pour 1024 dimensions
ALTER TABLE public.items
ALTER COLUMN embedding TYPE vector(1024)
USING NULL; -- Reset tous les embeddings existants

-- 4. Recréer les vues
CREATE OR REPLACE VIEW public.products_only AS
  SELECT * FROM public.items WHERE item_type = 'PRODUCT';

CREATE OR REPLACE VIEW public.services_only AS
  SELECT * FROM public.items WHERE item_type = 'SERVICE';

CREATE OR REPLACE VIEW public.services_with_schedules AS
  SELECT i.*, s.day_of_week, s.start_time, s.end_time, s.max_bookings
  FROM public.items i
  LEFT JOIN public.service_schedules s ON s.item_id = i.id
  WHERE i.item_type = 'SERVICE';

-- 5. Recréer l'index HNSW pour 1024 dimensions
CREATE INDEX IF NOT EXISTS idx_items_embedding 
ON public.items
USING hnsw (embedding vector_cosine_ops);

-- 4. Nettoyer TOUTES les anciennes versions de la fonction de recherche
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT oid::regprocedure AS func_signature 
    FROM pg_proc 
    WHERE proname = 'search_items_semantic'
  ) LOOP
    EXECUTE 'DROP FUNCTION ' || r.func_signature || ' CASCADE';
    RAISE NOTICE 'Dropped function: %', r.func_signature;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION search_items_semantic(
  query_embedding vector(1024),
  item_type_filter TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  item_type TEXT,
  price DECIMAL,
  price_unit TEXT,
  stock_quantity INTEGER,
  duration_minutes INTEGER,
  main_image TEXT,
  store_id BIGINT,
  store_name TEXT,
  store_city TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.name::TEXT,
    i.description::TEXT,
    i.item_type::TEXT,
    i.price,
    i.price_unit::TEXT,
    i.stock_quantity,
    i.duration_minutes,
    i.main_image::TEXT,
    i.store_id,
    s.name::TEXT AS store_name,
    s.city::TEXT AS store_city,
    (1 - (i.embedding <=> query_embedding))::FLOAT AS similarity
  FROM public.items i
  JOIN public.stores s ON i.store_id = s.id
  WHERE 
    i.embedding IS NOT NULL
    AND i.status IN ('AVAILABLE', 'ON_DEMAND')
    AND s.status = 'ACTIVE'
    AND (item_type_filter IS NULL OR i.item_type::TEXT = item_type_filter)
    AND (city_filter IS NULL OR s.city ILIKE '%' || city_filter || '%')
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_items_semantic(vector(1024), TEXT, TEXT, FLOAT, INT) IS 
  'Recherche sémantique via Jina AI jina-embeddings-v3 (1024 dimensions)';
