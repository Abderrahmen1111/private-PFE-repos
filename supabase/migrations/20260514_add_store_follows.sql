-- Create store_follows table
CREATE TABLE IF NOT EXISTS public.store_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    store_id BIGINT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, store_id)
);

-- Enable RLS
ALTER TABLE public.store_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own follows"
    ON public.store_follows FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can follow stores"
    ON public.store_follows FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow stores"
    ON public.store_follows FOR DELETE
    USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_store_follows_user_id ON public.store_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_store_follows_store_id ON public.store_follows(store_id);
