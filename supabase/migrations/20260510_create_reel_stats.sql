-- 1. Create the reel_stats table as requested
CREATE TABLE IF NOT EXISTS public.reel_stats (
  reel_id bigint not null,
  views_count integer null default 0,
  likes_count integer null default 0,
  clicks_count integer null default 0,
  contact_count integer null default 0,
  updated_at timestamp without time zone null default now(),
  saves_count integer null default 0,
  constraint reel_stats_pkey primary key (reel_id),
  constraint reel_stats_reel_id_fkey foreign KEY (reel_id) references reels (id) on delete CASCADE
) TABLESPACE pg_default;

-- 2. Create a function to automatically initialize stats
CREATE OR REPLACE FUNCTION public.handle_new_reel_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.reel_stats (reel_id)
  VALUES (NEW.id)
  ON CONFLICT (reel_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Create the trigger that fires on every new reel
DROP TRIGGER IF EXISTS on_reel_created_stats ON public.reels;
CREATE TRIGGER on_reel_created_stats
  AFTER INSERT ON public.reels
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_reel_stats();

-- 4. Backfill existing reels (insert stats for reels that were created before this trigger)
INSERT INTO public.reel_stats (reel_id)
SELECT id FROM public.reels
ON CONFLICT (reel_id) DO NOTHING;
