-- RPC Functions to increment reel statistics safely
-- These use SECURITY DEFINER to bypass RLS to ensure stats updates always succeed.

-- Increment views
CREATE OR REPLACE FUNCTION public.increment_reel_view(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET views_count = COALESCE(views_count, 0) + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment likes
CREATE OR REPLACE FUNCTION public.increment_reel_like(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET likes_count = COALESCE(likes_count, 0) + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment saves
CREATE OR REPLACE FUNCTION public.increment_reel_save(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET saves_count = COALESCE(saves_count, 0) + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Increment clicks (mapped to shares or external link clicks)
CREATE OR REPLACE FUNCTION public.increment_reel_click(reel_id_input bigint, x int default 1)
RETURNS void AS $$
BEGIN
  UPDATE public.reel_stats
  SET clicks_count = COALESCE(clicks_count, 0) + x,
      updated_at = now()
  WHERE reel_id = reel_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
