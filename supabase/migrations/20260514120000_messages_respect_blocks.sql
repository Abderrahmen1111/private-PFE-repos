-- Block personal (and any) DMs between users when a BLOCKED friendship row exists for that pair.

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages if not blocked"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.friendships f
      WHERE f.status = 'BLOCKED'::public.friendship_status
        AND (
          (f.user_id = sender_id AND f.friend_id = receiver_id)
          OR (f.user_id = receiver_id AND f.friend_id = sender_id)
        )
    )
  );
