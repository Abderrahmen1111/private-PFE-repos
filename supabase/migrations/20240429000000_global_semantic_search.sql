-- ============================================================================
-- Migration: Add Store & Directory Embeddings & Global Semantic Search
-- Description: Adds vector column to stores, business_directory and service_directory
--             and creates a unified global search function.
-- ============================================================================

-- 1. Add embedding columns to all tables
ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS embedding vector(1024);
ALTER TABLE public.business_directory_tunisia ADD COLUMN IF NOT EXISTS embedding vector(1024);
ALTER TABLE public.service_directory ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- 2. Create HNSW indexes for performance
CREATE INDEX IF NOT EXISTS idx_stores_embedding ON public.stores USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_business_directory_embedding ON public.business_directory_tunisia USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_service_directory_embedding ON public.service_directory USING hnsw (embedding vector_cosine_ops);

-- 3. Fix existing items search (ensure 1024 dims and correct params)
CREATE OR REPLACE FUNCTION public.search_items_semantic(
  query_embedding vector(1024),
  item_type_filter TEXT DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.3,
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
    AND i.status = 'AVAILABLE'
    AND s.status = 'PUBLISHED'
    AND (item_type_filter IS NULL OR i.item_type::TEXT = item_type_filter)
    AND (city_filter IS NULL OR s.city ILIKE '%' || city_filter || '%')
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Create GLOBAL search function (Items + Stores + Directories)
CREATE OR REPLACE FUNCTION public.search_global_semantic(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  result_type TEXT, -- 'ITEM', 'STORE', 'BUSINESS_DIR', 'SERVICE_DIR'
  image_url TEXT,
  similarity FLOAT,
  location_city TEXT,
  category TEXT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  -- 1. Items
  (
    SELECT 
      i.id,
      i.name::TEXT,
      i.description::TEXT,
      'ITEM'::TEXT AS result_type,
      i.main_image::TEXT AS image_url,
      (1 - (i.embedding <=> query_embedding))::FLOAT AS similarity,
      s.city::TEXT AS location_city,
      i.item_type::TEXT AS category,
      jsonb_build_object(
        'price', i.price,
        'store_id', i.store_id,
        'store_name', s.name
      ) AS metadata
    FROM public.items i
    JOIN public.stores s ON i.store_id = s.id
    WHERE i.embedding IS NOT NULL
      AND i.status = 'AVAILABLE'
      AND s.status = 'PUBLISHED'
      AND 1 - (i.embedding <=> query_embedding) > match_threshold
  )
  UNION ALL
  -- 2. Stores
  (
    SELECT 
      s.id,
      s.name::TEXT,
      s.description::TEXT,
      'STORE'::TEXT AS result_type,
      s.logo_url::TEXT AS image_url,
      (1 - (s.embedding <=> query_embedding))::FLOAT AS similarity,
      s.city::TEXT AS location_city,
      s.category::TEXT AS category,
      jsonb_build_object(
        'rating', s.rating_average,
        'total_reviews', s.total_reviews
      ) AS metadata
    FROM public.stores s
    WHERE s.embedding IS NOT NULL
      AND s.status = 'PUBLISHED'
      AND 1 - (s.embedding <=> query_embedding) > match_threshold
  )
  UNION ALL
  -- 3. Business Directory (Google Maps etc.)
  (
    SELECT 
      b.id,
      b.title::TEXT AS name,
      b.description::TEXT,
      'BUSINESS_DIR'::TEXT AS result_type,
      (CASE WHEN b.photos IS NOT NULL AND array_length(b.photos, 1) > 0 THEN b.photos[1] ELSE NULL END)::TEXT AS image_url,
      (1 - (b.embedding <=> query_embedding))::FLOAT AS similarity,
      b.city::TEXT AS location_city,
      b."categoryName"::TEXT AS category,
      jsonb_build_object(
        'address', b.full_address,
        'score', b."totalScore",
        'reviews', b."reviewsCount"
      ) AS metadata
    FROM public.business_directory_tunisia b
    WHERE b.embedding IS NOT NULL
      AND 1 - (b.embedding <=> query_embedding) > match_threshold
  )
  UNION ALL
  -- 4. Service Directory
  (
    SELECT 
      sd.service_id AS id,
      sd.name::TEXT,
      sd.description::TEXT,
      'SERVICE_DIR'::TEXT AS result_type,
      NULL::TEXT AS image_url,
      (1 - (sd.embedding <=> query_embedding))::FLOAT AS similarity,
      sd.city::TEXT AS location_city,
      sd.category::TEXT AS category,
      jsonb_build_object(
        'address', sd.address,
        'rating', sd.rating_average
      ) AS metadata
    FROM public.service_directory sd
    WHERE sd.embedding IS NOT NULL
      AND 1 - (sd.embedding <=> query_embedding) > match_threshold
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
