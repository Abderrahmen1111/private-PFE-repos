-- Migration: add_messages_update_policy.sql
-- Description: Allow participants to update message status (is_read) and metadata (deleted_for)

-- Allow receiver to mark messages as read
-- Allow sender/receiver to update metadata (e.g., for local deletion)

CREATE POLICY "Users can update messages they are part of"
ON public.messages
FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
WITH CHECK (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own sent messages"
ON public.messages
FOR DELETE
USING (auth.uid() = sender_id);
