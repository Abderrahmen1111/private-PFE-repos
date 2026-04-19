-- ============================================================================
-- Migration: 20240415192200_messaging_attachments.sql
-- Description: Support pour le partage d'images et notes vocales (Stockage + DB)
-- ============================================================================

-- 1. TYPES ET COLONNES SUPPLÉMENTAIRES
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
        CREATE TYPE public.message_type AS ENUM ('text', 'image', 'audio', 'file');
    END IF;
END $$;

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS type public.message_type DEFAULT 'text',
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 2. CRÉATION DU BUCKET DE STOCKAGE
-- Note: Supabase Storage est géré dans le schéma 'storage'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'chat-attachments', 
    'chat-attachments', 
    true, 
    10485760, -- 10 Mo
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'audio/webm', 'audio/mpeg', 'audio/mp4', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;

-- 3. POLITIQUES DE SÉCURITÉ POUR LE STOCKAGE (RLS)

-- Lecture: Accessible si l'utilisateur fait partie de la conversation (Simplifié ici en public_url car bucket public=true)
-- Pour plus de sécurité, on pourrait utiliser des URLs signées, mais ici on reste sur un accès public par URL.

-- Insertion: Autoriser les utilisateurs authentifiés à uploader dans leur propre dossier
DROP POLICY IF EXISTS "Users can upload chat attachments" ON storage.objects;
CREATE POLICY "Users can upload chat attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'chat-attachments' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Suppression: Autoriser l'auteur à supprimer ses propres fichiers
DROP POLICY IF EXISTS "Users can delete their own chat attachments" ON storage.objects;
CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'chat-attachments' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. COMMENTAIRES
COMMENT ON COLUMN public.messages.type IS 'Type de message (text, image, audio, etc.)';
COMMENT ON COLUMN public.messages.attachment_url IS 'Lien vers le fichier stocké dans Supabase Storage';
