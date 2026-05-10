-- Migration: Add Embedding to Reels & Update Global Search
-- Description: Adds vector(1024) to reels, creates index, and integrates into search_global_semantic.

-- 1. Add embedding column to reels
ALTER TABLE public.reels ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- 2. Create HNSW index for reels
CREATE INDEX IF NOT EXISTS idx_reels_embedding ON public.reels USING hnsw (embedding vector_cosine_ops);

-- 3. Update GLOBAL search function to include Reels
CREATE OR REPLACE FUNCTION public.search_global_semantic(
  query_embedding vector(1024),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  result_type TEXT,
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
  -- 3. Business Directory
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
  UNION ALL
  -- 5. Reels (NEW)
  (
    SELECT 
      r.id,
      r.title::TEXT AS name,
      r.subtitle::TEXT AS description,
      'REEL'::TEXT AS result_type,
      r.media_path::TEXT AS image_url,
      (1 - (r.embedding <=> query_embedding))::FLOAT AS similarity,
      s.city::TEXT AS location_city,
      r.category::TEXT AS category,
      jsonb_build_object(
        'store_name', s.name,
        'price', r.price,
        'media_type', r.media_type,
        'cta_type', r.cta_type,
        'views', COALESCE(rs.views_count, 0),
        'likes', COALESCE(rs.likes_count, 0)
      ) AS metadata
    FROM public.reels r
    JOIN public.stores s ON r.store_id = s.id
    LEFT JOIN public.reel_stats rs ON r.id = rs.reel_id
    WHERE r.embedding IS NOT NULL
      AND r.status = 'active'
      AND s.status = 'PUBLISHED'
      AND 1 - (r.embedding <=> query_embedding) > match_threshold
  )
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
