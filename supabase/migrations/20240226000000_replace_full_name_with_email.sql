-- Migration: 20240226000000_add_email_to_users.sql
-- Description: Ajouter le champ email à la table public.users et synchroniser

-- 1. Ajouter la colonne email si elle n'existe pas
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email') THEN
    ALTER TABLE public.users ADD COLUMN email TEXT;
  END IF;
END $$;

-- 2. Mettre à jour la fonction de synchronisation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_metadata->>'full_name',
    COALESCE(NEW.raw_user_metadata->>'role', 'CLIENT')::user_role
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Mettre à jour les emails existants
UPDATE public.users u
SET email = a.email
FROM auth.users a
WHERE u.id = a.id AND u.email IS NULL;
