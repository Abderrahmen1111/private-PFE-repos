-- ============================================================
-- Migration: user_push_tokens table
-- Stores Expo push tokens for mobile push notifications
-- Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,
  device_id   TEXT,                    -- optional device fingerprint
  platform    TEXT,                    -- 'ios' | 'android' | 'web'
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One token per user+device combination
CREATE UNIQUE INDEX IF NOT EXISTS user_push_tokens_user_device_idx
  ON public.user_push_tokens (user_id, device_id)
  WHERE device_id IS NOT NULL;

-- RLS: users can only read/write their own tokens
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own push tokens"
  ON public.user_push_tokens
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (server actions) bypasses RLS automatically

COMMENT ON TABLE public.user_push_tokens IS
  'Stores Expo push notification tokens for mobile devices.';
