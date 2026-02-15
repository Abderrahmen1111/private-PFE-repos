-- ============================================================================
-- Migration: 20240105000000_functions.sql
-- Description: Fonctions SQL, Triggers et Vues
-- ============================================================================

-- ====================================================================
-- 1. FONCTION: RECHERCHE SÉMANTIQUE AVEC PGVECTOR
-- ====================================================================

DROP FUNCTION IF EXISTS public.search_items_semantic(vector(384), item_type, TEXT, FLOAT, INT);

CREATE OR REPLACE FUNCTION search_items_semantic(
  query_embedding vector(384),
  item_type_filter item_type DEFAULT NULL,
  city_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  item_type item_type,
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
    i.name,
    i.description,
    i.item_type,
    i.price,
    i.price_unit,
    i.stock_quantity,
    i.duration_minutes,
    i.main_image,
    i.store_id,
    s.name AS store_name,
    s.city AS store_city,
    1 - (i.embedding <=> query_embedding) AS similarity
  FROM public.items i
  JOIN public.stores s ON i.store_id = s.id
  WHERE 
    i.embedding IS NOT NULL
    AND i.status IN ('AVAILABLE', 'ON_DEMAND')
    AND s.status = 'ACTIVE'
    AND (item_type_filter IS NULL OR i.item_type = item_type_filter)
    AND (city_filter IS NULL OR s.city ILIKE '%' || city_filter || '%')
    AND 1 - (i.embedding <=> query_embedding) > match_threshold
  ORDER BY i.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_items_semantic(vector(384), item_type, TEXT, FLOAT, INT) IS 
  'Recherche sémantique d''items par similarité d''embeddings avec filtres optionnels';

-- ====================================================================
-- 2. FONCTION: VÉRIFIER DISPONIBILITÉ CRÉNEAU
-- ====================================================================

DROP FUNCTION IF EXISTS public.check_slot_availability(BIGINT, DATE, TIME, TIME);

CREATE OR REPLACE FUNCTION check_slot_availability(
  p_item_id BIGINT,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_day_of_week INTEGER;
  v_schedule_exists BOOLEAN;
  v_max_bookings INTEGER;
  v_current_bookings INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_date);

  SELECT EXISTS (
    SELECT 1 
    FROM public.service_schedules
    WHERE item_id = p_item_id
      AND day_of_week = v_day_of_week
      AND start_time <= p_start_time
      AND end_time >= p_end_time
  ) INTO v_schedule_exists;

  IF NOT v_schedule_exists THEN
    RETURN FALSE;
  END IF;

  SELECT max_bookings INTO v_max_bookings
  FROM public.service_schedules
  WHERE item_id = p_item_id
    AND day_of_week = v_day_of_week
    AND start_time <= p_start_time
    AND end_time >= p_end_time
  LIMIT 1;

  SELECT COUNT(*) INTO v_current_bookings
  FROM public.bookings
  WHERE item_id = p_item_id
    AND booking_date = p_date
    AND status NOT IN ('CANCELLED', 'NO_SHOW')
    AND ((start_time, end_time) OVERLAPS (p_start_time, p_end_time));

  RETURN v_current_bookings < v_max_bookings;
END;
$$;

COMMENT ON FUNCTION check_slot_availability(BIGINT, DATE, TIME, TIME) IS 
  'Vérifie si un créneau horaire est disponible pour une réservation';

-- ====================================================================
-- 3. TRIGGERS: GENERATE ORDER_NUMBER
-- ====================================================================

DROP FUNCTION IF EXISTS public.generate_order_number();

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('orders_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_order_number ON public.orders;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

COMMENT ON FUNCTION generate_order_number() IS 
  'Génère automatiquement un numéro de commande unique au format ORD-YYYYMMDD-XXXXXX';

-- ====================================================================
-- 4. TRIGGERS: GENERATE BOOKING_NUMBER
-- ====================================================================

DROP FUNCTION IF EXISTS public.generate_booking_number();

CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := 'BKG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('bookings_id_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_generate_booking_number ON public.bookings;

CREATE TRIGGER trigger_generate_booking_number
  BEFORE INSERT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION generate_booking_number();

COMMENT ON FUNCTION generate_booking_number() IS 
  'Génère automatiquement un numéro de réservation unique au format BKG-YYYYMMDD-XXXXXX';

-- ====================================================================
-- 5. TRIGGERS: UPDATE STORE STATS
-- ====================================================================

DROP FUNCTION IF EXISTS public.update_store_stats();

CREATE OR REPLACE FUNCTION update_store_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_store_id BIGINT;
  v_avg_rating DECIMAL;
  v_total_reviews INTEGER;
  v_positive_count INTEGER;
  v_total_count INTEGER;
BEGIN
  v_store_id := COALESCE(NEW.store_id, OLD.store_id);

  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO v_avg_rating, v_total_reviews
  FROM public.reviews
  WHERE store_id = v_store_id AND is_approved = true AND is_spam = false;

  SELECT COUNT(*) FILTER (WHERE sentiment_label='POSITIVE'), COUNT(*) INTO v_positive_count, v_total_count
  FROM public.reviews
  WHERE store_id = v_store_id AND is_approved=true AND is_spam=false AND sentiment_label IS NOT NULL;

  UPDATE public.stores
  SET rating_average = v_avg_rating,
      total_reviews = v_total_reviews,
      sentiment_positive_percent = CASE WHEN v_total_count>0 THEN (v_positive_count::DECIMAL/v_total_count)*100 ELSE 0 END
  WHERE id = v_store_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_store_stats_insert ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_store_stats_update ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_store_stats_delete ON public.reviews;

CREATE TRIGGER trigger_update_store_stats_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_store_stats();

CREATE TRIGGER trigger_update_store_stats_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (OLD.rating IS DISTINCT FROM NEW.rating OR
        OLD.sentiment_label IS DISTINCT FROM NEW.sentiment_label OR
        OLD.is_approved IS DISTINCT FROM NEW.is_approved OR
        OLD.is_spam IS DISTINCT FROM NEW.is_spam)
  EXECUTE FUNCTION update_store_stats();

CREATE TRIGGER trigger_update_store_stats_delete
  AFTER DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_store_stats();

COMMENT ON FUNCTION update_store_stats() IS 
  'Met à jour automatiquement les statistiques du store (rating, reviews, sentiment)';

-- ====================================================================
-- 6. UPDATE ITEM STATS
-- ====================================================================

DROP FUNCTION IF EXISTS public.update_item_stats();

CREATE OR REPLACE FUNCTION update_item_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_item_id BIGINT;
  v_avg_rating DECIMAL;
  v_total_reviews INTEGER;
BEGIN
  v_item_id := COALESCE(NEW.item_id, OLD.item_id);

  IF v_item_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(AVG(rating),0), COUNT(*) INTO v_avg_rating, v_total_reviews
  FROM public.reviews
  WHERE item_id = v_item_id AND is_approved=true AND is_spam=false;

  UPDATE public.items
  SET rating_average=v_avg_rating, total_reviews=v_total_reviews
  WHERE id=v_item_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_item_stats_insert ON public.reviews;
DROP TRIGGER IF EXISTS trigger_update_item_stats_update ON public.reviews;

CREATE TRIGGER trigger_update_item_stats_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  WHEN (NEW.item_id IS NOT NULL)
  EXECUTE FUNCTION update_item_stats();

CREATE TRIGGER trigger_update_item_stats_update
  AFTER UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (NEW.item_id IS NOT NULL AND 
        (OLD.rating IS DISTINCT FROM NEW.rating OR
         OLD.is_approved IS DISTINCT FROM NEW.is_approved OR
         OLD.is_spam IS DISTINCT FROM NEW.is_spam))
  EXECUTE FUNCTION update_item_stats();

COMMENT ON FUNCTION update_item_stats() IS 
  'Met à jour automatiquement les statistiques de l''item (rating, total reviews)';

-- ====================================================================
-- 7. FONCTION: INCREMENT VIEW COUNT
-- ====================================================================

DROP FUNCTION IF EXISTS public.increment_view_count(TEXT, BIGINT);

CREATE OR REPLACE FUNCTION increment_view_count(
  p_table TEXT,
  p_id BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET view_count = view_count + 1 WHERE id = $1', p_table)
  USING p_id;
END;
$$;

COMMENT ON FUNCTION increment_view_count(TEXT, BIGINT) IS 
  'Incrémente le compteur de vues pour une table donnée';

-- ====================================================================
-- 8. FONCTION: CLEANUP OLD BOOKINGS
-- ====================================================================

DROP FUNCTION IF EXISTS public.cleanup_old_bookings();

CREATE OR REPLACE FUNCTION cleanup_old_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.bookings
    SET status = 'NO_SHOW'
    WHERE status='CONFIRMED' AND booking_date < CURRENT_DATE - INTERVAL '1 day'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM updated;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_bookings() IS 
  'Marque les anciennes réservations non complétées comme NO_SHOW';

-- ====================================================================
-- 9. FONCTION: GLOBAL STATS
-- ====================================================================

DROP FUNCTION IF EXISTS public.get_global_stats();

CREATE OR REPLACE FUNCTION get_global_stats()
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT JSON_BUILD_OBJECT(
    'total_users', (SELECT COUNT(*) FROM public.users),
    'total_stores', (SELECT COUNT(*) FROM public.stores WHERE status='ACTIVE'),
    'total_items', (SELECT COUNT(*) FROM public.items WHERE status IN ('AVAILABLE','ON_DEMAND')),
    'total_orders', (SELECT COUNT(*) FROM public.orders),
    'total_bookings', (SELECT COUNT(*) FROM public.bookings),
    'total_reviews', (SELECT COUNT(*) FROM public.reviews WHERE is_approved=true),
    'avg_rating', (SELECT ROUND(AVG(rating_average),2) FROM public.stores WHERE status='ACTIVE')
  ) INTO result;

  RETURN result;
END;
$$;

COMMENT ON FUNCTION get_global_stats() IS 
  'Retourne les statistiques globales de la plateforme en JSON';
