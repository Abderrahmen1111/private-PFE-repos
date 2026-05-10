-- RPC Functions to increment reel statistics safely
-- These use SECURITY DEFINER to bypass RLS if necessary, but we keep them simple for now.

-- Increment views
CREATE OR REPLACE FUNCTION public.increment_reel_view(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET views_count = views_count + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql;

-- Increment likes
CREATE OR REPLACE FUNCTION public.increment_reel_like(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET likes_count = likes_count + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql;

-- Increment saves
CREATE OR REPLACE FUNCTION public.increment_reel_save(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET saves_count = saves_count + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql;

-- Increment clicks (mapped to shares or external link clicks)
CREATE OR REPLACE FUNCTION public.increment_reel_click(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET clicks_count = clicks_count + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql;
