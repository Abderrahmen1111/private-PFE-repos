-- Add metadata column to items table to store extra media and other flexible data
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update the schema cache (if running manually in Supabase SQL editor, this happens automatically)
-- NOTIFY pgrst, 'reload schema';
