-- Migration: 20240423221800_ensure_user_sync.sql
-- Description: Ensure all auth users are synced to public.users with default role CLIENT

-- 0. Ensure user_role enum has all necessary values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'user_role' AND e.enumlabel = 'BUSINESS_OWNER') THEN
    ALTER TYPE public.user_role ADD VALUE 'BUSINESS_OWNER';
  END IF;
END $$;

-- 1. Ensure public.users table has all necessary columns
DO $$ 
BEGIN 
  -- Add missing columns to public.users if they don't exist
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'status') THEN
    ALTER TABLE public.users ADD COLUMN status character varying DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'two_factor_enabled') THEN
    ALTER TABLE public.users ADD COLUMN two_factor_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'email_notifications_enabled') THEN
    ALTER TABLE public.users ADD COLUMN email_notifications_enabled boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'login_alerts_enabled') THEN
    ALTER TABLE public.users ADD COLUMN login_alerts_enabled boolean DEFAULT true;
  END IF;
END $$;

-- 2. Update the sync function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    role, 
    avatar_url,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    REPLACE(UPPER(COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT')), ' ', '_')::public.user_role,
    NEW.raw_user_meta_data->>'avatar_url',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
    
  -- Also sync to profiles if it exists (for backward compatibility)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
      -- Note: profiles might expect lowercase roles, adjusting accordingly
      LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'client')),
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET 
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger is active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Initial sync for any missing users
INSERT INTO public.users (id, email, full_name, role, status, created_at, updated_at)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name'), 
  REPLACE(UPPER(COALESCE(raw_user_meta_data->>'role', 'CLIENT')), ' ', '_')::public.user_role,
  'active',
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM auth.users
ON CONFLICT (id) DO NOTHING;
