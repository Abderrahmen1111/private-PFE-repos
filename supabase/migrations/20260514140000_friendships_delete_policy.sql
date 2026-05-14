-- Allow participants to delete friendship rows (unblock, decline request, cancel pending, etc.)
-- Previously only SELECT / INSERT / UPDATE existed, so DELETE always failed under RLS.

DROP POLICY IF EXISTS "Users can delete friendships they participate in" ON public.friendships;

CREATE POLICY "Users can delete friendships they participate in"
  ON public.friendships
  FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);
