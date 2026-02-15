-- ============================================================================
-- Migration: 20240104000000_storage_buckets.sql
-- Description: Configuration Storage Supabase - Buckets, Policies et Helpers
-- ============================================================================

-- ============================================================================
-- 1. CRÉER LES BUCKETS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('store-images', 'store-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
('store-documents', 'store-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
('review-images', 'review-images', true, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. POLICIES POUR PRODUCT-IMAGES (PUBLIC)
-- ============================================================================

DROP POLICY IF EXISTS "Product images are publicly accessible" ON storage.objects;
CREATE POLICY "Product images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Store owners can upload product images" ON storage.objects;
CREATE POLICY "Store owners can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can update product images" ON storage.objects;
CREATE POLICY "Store owners can update product images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can delete product images" ON storage.objects;
CREATE POLICY "Store owners can delete product images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 3. POLICIES POUR STORE-IMAGES (PUBLIC)
-- ============================================================================

DROP POLICY IF EXISTS "Store images are publicly accessible" ON storage.objects;
CREATE POLICY "Store images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-images');

DROP POLICY IF EXISTS "Store owners can upload store images" ON storage.objects;
CREATE POLICY "Store owners can upload store images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can update store images" ON storage.objects;
CREATE POLICY "Store owners can update store images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store owners can delete store images" ON storage.objects;
CREATE POLICY "Store owners can delete store images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-images'
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. POLICIES POUR STORE-DOCUMENTS (PRIVATE)
-- ============================================================================

DROP POLICY IF EXISTS "Store documents are private" ON storage.objects;
CREATE POLICY "Store documents are private"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'store-documents'
    AND (
      (storage.foldername(name))[1]::bigint IN (
        SELECT id FROM public.stores WHERE owner_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
      )
    )
  );

DROP POLICY IF EXISTS "Store owners can upload documents" ON storage.objects;
CREATE POLICY "Store owners can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1]::bigint IN (
      SELECT id FROM public.stores WHERE owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Store documents cannot be updated" ON storage.objects;
CREATE POLICY "Store documents cannot be updated"
  ON storage.objects FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Only admins can delete store documents" ON storage.objects;
CREATE POLICY "Only admins can delete store documents"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-documents'
    AND EXISTS (
      SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 5. POLICIES POUR REVIEW-IMAGES (PUBLIC)
-- ============================================================================

DROP POLICY IF EXISTS "Review images are publicly accessible" ON storage.objects;
CREATE POLICY "Review images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "Users can upload review images" ON storage.objects;
CREATE POLICY "Users can upload review images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'review-images'
    AND auth.uid() IS NOT NULL
  );

DROP POLICY IF EXISTS "Review images cannot be updated" ON storage.objects;
CREATE POLICY "Review images cannot be updated"
  ON storage.objects FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "Authors can delete review images" ON storage.objects;
CREATE POLICY "Authors can delete review images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'review-images'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'ADMIN'
      )
    )
  );

-- ============================================================================
-- 6. POLICIES POUR AVATARS (PUBLIC)
-- ============================================================================

DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
-- 7. STRUCTURE DES CHEMINS DE FICHIERS
-- ============================================================================

/*
ORGANISATION DES FICHIERS DANS LES BUCKETS:

1. product-images/{store_id}/{timestamp}_{filename}.jpg
2. store-images/{store_id}/logo.png
3. store-documents/{store_id}/kyc_document.pdf
4. review-images/{user_id}/{review_id}_1.jpg
5. avatars/{user_id}/avatar.jpg
*/

-- ============================================================================
-- 8. VÉRIFICATION DES BUCKETS
-- ============================================================================

DO $$
DECLARE
  bucket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO bucket_count
  FROM storage.buckets
  WHERE id IN (
    'product-images',
    'store-images',
    'store-documents',
    'review-images',
    'avatars'
  );

  RAISE NOTICE 'Nombre de buckets créés: %/5', bucket_count;

  IF bucket_count < 5 THEN
    RAISE WARNING 'Tous les buckets n''ont pas été créés';
  ELSE
    RAISE NOTICE 'Tous les buckets ont été créés avec succès';
  END IF;
END $$;

-- ============================================================================
-- 9. FONCTIONS HELPERS DANS LE SCHEMA PUBLIC
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_filename(
  original_filename TEXT,
  prefix TEXT DEFAULT ''
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  extension TEXT;
  timestamp_str TEXT;
  random_str TEXT;
BEGIN
  extension := LOWER(SUBSTRING(original_filename FROM '\.([^.]+)$'));
  timestamp_str := TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS');
  random_str := SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8);

  IF prefix != '' THEN
    RETURN prefix || '_' || timestamp_str || '_' || random_str || '.' || extension;
  ELSE
    RETURN timestamp_str || '_' || random_str || '.' || extension;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_public_url(
  bucket_name TEXT,
  file_path TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  project_url TEXT;
BEGIN
  project_url := CURRENT_SETTING('app.settings.supabase_url', true);
  IF project_url IS NULL THEN
    project_url := 'https://YOUR_PROJECT.supabase.co';
  END IF;
  RETURN project_url || '/storage/v1/object/public/' || bucket_name || '/' || file_path;
END;
$$;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
