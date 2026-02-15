-- ============================================================================
-- Migration: 20240101000000_initial_schema.sql
-- Description: Schéma initial - Tables principales
-- ============================================================================

-- ============================================================================
-- 1. TYPES ENUM
-- ============================================================================

CREATE TYPE user_role AS ENUM ('CLIENT', 'PRO', 'ADMIN');
CREATE TYPE store_category AS ENUM (
  'RESTAURANT',
  'RETAIL',
  'BEAUTY',
  'REPAIR',
  'HEALTH',
  'EDUCATION',
  'OTHER'
);
CREATE TYPE store_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED');
CREATE TYPE item_type AS ENUM ('PRODUCT', 'SERVICE');
CREATE TYPE item_status AS ENUM ('AVAILABLE', 'OUT_OF_STOCK', 'ON_DEMAND', 'UNAVAILABLE');
CREATE TYPE order_status AS ENUM ('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE sentiment_label AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- ============================================================================
-- 2. TABLE USERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- Clé primaire liée à auth.users
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  role user_role NOT NULL DEFAULT 'CLIENT',
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  
  -- Localisation
  city TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_city ON public.users(city);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TABLE STORES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.stores (
  id BIGSERIAL PRIMARY KEY,
  
  -- Propriétaire
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Informations de base
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category store_category NOT NULL,
  
  -- Contact
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  
  -- Adresse et localisation
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  city TEXT NOT NULL,
  
  -- Médias
  logo_url TEXT,
  banner_url TEXT,
  
  -- KYC et validation
  business_registration TEXT,
  tax_id TEXT,
  kyc_document_url TEXT,
  kyc_verified_at TIMESTAMPTZ,
  
  -- Statut
  status store_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  
  -- Horaires (JSON)
  opening_hours JSONB,
  
  -- Statistiques
  view_count INTEGER NOT NULL DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  sentiment_positive_percent DECIMAL(5, 2) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT positive_rating CHECK (rating_average >= 0 AND rating_average <= 5),
  CONSTRAINT positive_reviews CHECK (total_reviews >= 0)
);

-- Index
CREATE INDEX idx_stores_owner ON public.stores(owner_id);
CREATE INDEX idx_stores_slug ON public.stores(slug);
CREATE INDEX idx_stores_city ON public.stores(city);
CREATE INDEX idx_stores_category ON public.stores(category);
CREATE INDEX idx_stores_status ON public.stores(status);
CREATE INDEX idx_stores_location ON public.stores(latitude, longitude);

-- Trigger updated_at
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABLE ITEMS (Produits ET Services)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.items (
  id BIGSERIAL PRIMARY KEY,
  
  -- Commerce
  store_id BIGINT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Type
  item_type item_type NOT NULL,
  
  -- Informations de base
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  
  -- Prix
  price DECIMAL(10, 3) NOT NULL,
  price_unit TEXT NOT NULL DEFAULT 'unit', -- 'unit', 'hour', 'day', 'session'
  
  -- Spécifique PRODUIT
  stock_quantity INTEGER,
  
  -- Spécifique SERVICE
  duration_minutes INTEGER,
  is_bookable BOOLEAN DEFAULT FALSE,
  
  -- Disponibilité
  available_days JSONB, -- Pour services: [0,1,2,3,4,5] = Lun-Sam
  
  -- Médias
  main_image TEXT,
  image_2 TEXT,
  image_3 TEXT,
  
  -- Statut
  status item_status NOT NULL DEFAULT 'AVAILABLE',
  
  -- Statistiques
  view_count INTEGER NOT NULL DEFAULT 0,
  order_count INTEGER NOT NULL DEFAULT 0,
  booking_count INTEGER NOT NULL DEFAULT 0,
  rating_average DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT stock_for_products CHECK (
    (item_type = 'PRODUCT' AND stock_quantity IS NOT NULL) OR
    (item_type = 'SERVICE' AND stock_quantity IS NULL)
  ),
  CONSTRAINT duration_for_services CHECK (
    (item_type = 'SERVICE' AND duration_minutes IS NOT NULL AND duration_minutes > 0) OR
    (item_type = 'PRODUCT' AND duration_minutes IS NULL)
  )
);

-- Index
CREATE INDEX idx_items_store ON public.items(store_id);
CREATE INDEX idx_items_type ON public.items(item_type);
CREATE INDEX idx_items_status ON public.items(status);
CREATE INDEX idx_items_slug ON public.items(slug);

-- Trigger updated_at
CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. TABLE SERVICE_SCHEDULES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.service_schedules (
  id BIGSERIAL PRIMARY KEY,
  
  -- Service
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  
  -- Jour de la semaine (0=Dimanche, 6=Samedi)
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Horaires
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Capacité
  max_bookings INTEGER NOT NULL DEFAULT 1,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT positive_capacity CHECK (max_bookings > 0)
);

-- Index
CREATE INDEX idx_schedules_item ON public.service_schedules(item_id);
CREATE INDEX idx_schedules_day ON public.service_schedules(day_of_week);

-- ============================================================================
-- 6. TABLE ORDERS (Commandes produits)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  
  -- Numéro de commande unique
  order_number TEXT NOT NULL UNIQUE,
  
  -- Relations
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE SET NULL,
  
  -- Détails commande
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 3) NOT NULL,
  total_price DECIMAL(10, 3) NOT NULL,
  
  -- Informations client
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  customer_notes TEXT,
  
  -- Statut
  status order_status NOT NULL DEFAULT 'PENDING',
  
  -- Suivi
  tracking_code TEXT,
  vendor_notes TEXT,
  
  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT positive_quantity CHECK (quantity > 0),
  CONSTRAINT positive_prices CHECK (unit_price >= 0 AND total_price >= 0)
);

-- Index
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_store ON public.orders(store_id);
CREATE INDEX idx_orders_item ON public.orders(item_id);
CREATE INDEX idx_orders_number ON public.orders(order_number);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- ============================================================================
-- 7. TABLE BOOKINGS (Réservations services)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id BIGSERIAL PRIMARY KEY,
  
  -- Numéro de réservation unique
  booking_number TEXT NOT NULL UNIQUE,
  
  -- Relations
  item_id BIGINT NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Date et heure
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  
  -- Informations client
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  notes TEXT,
  
  -- Prix
  price DECIMAL(10, 3) NOT NULL,
  
  -- Statut
  status booking_status NOT NULL DEFAULT 'PENDING',
  
  -- Dates
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT future_booking CHECK (booking_date >= CURRENT_DATE),
  CONSTRAINT valid_time_range CHECK (end_time > start_time),
  CONSTRAINT positive_duration CHECK (duration_minutes > 0),
  CONSTRAINT positive_price CHECK (price >= 0)
);

-- Index
CREATE INDEX idx_bookings_item ON public.bookings(item_id);
CREATE INDEX idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX idx_bookings_store ON public.bookings(store_id);
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);
CREATE INDEX idx_bookings_number ON public.bookings(booking_number);
CREATE INDEX idx_bookings_status ON public.bookings(status);

-- ============================================================================
-- 8. TABLE REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  
  -- Auteur
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Cible
  item_id BIGINT REFERENCES public.items(id) ON DELETE CASCADE,
  store_id BIGINT NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Lien avec commande/réservation (pour vérification)
  order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
  booking_id BIGINT REFERENCES public.bookings(id) ON DELETE SET NULL,
  
  -- Contenu
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT NOT NULL,
  
  -- Médias
  image_1 TEXT,
  image_2 TEXT,
  
  -- Vérification
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  qr_token TEXT UNIQUE,
  verified_at TIMESTAMPTZ,
  
  -- IA Sentiment Analysis
  sentiment_score DECIMAL(4, 3), -- -1.0 à 1.0
  sentiment_label sentiment_label,
  sentiment_themes JSONB,
  
  -- Réponse vendeur
  vendor_response TEXT,
  vendor_response_ai_suggestion TEXT,
  responded_at TIMESTAMPTZ,
  
  -- Modération
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  is_spam BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_notes TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT one_order_or_booking CHECK (
    (order_id IS NOT NULL AND booking_id IS NULL) OR
    (order_id IS NULL AND booking_id IS NOT NULL) OR
    (order_id IS NULL AND booking_id IS NULL)
  )
);

-- Index
CREATE INDEX idx_reviews_author ON public.reviews(author_id);
CREATE INDEX idx_reviews_item ON public.reviews(item_id);
CREATE INDEX idx_reviews_store ON public.reviews(store_id);
CREATE INDEX idx_reviews_order ON public.reviews(order_id);
CREATE INDEX idx_reviews_booking ON public.reviews(booking_id);
CREATE INDEX idx_reviews_qr ON public.reviews(qr_token);
CREATE INDEX idx_reviews_sentiment ON public.reviews(sentiment_label);
CREATE INDEX idx_reviews_created ON public.reviews(created_at DESC);

-- Trigger updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. TABLE SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id BIGSERIAL PRIMARY KEY,
  
  -- Utilisateur
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Plan
  plan_name TEXT NOT NULL,
  plan_features JSONB,
  
  -- Prix
  price DECIMAL(10, 3) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TND',
  billing_period TEXT NOT NULL DEFAULT 'monthly', -- monthly, yearly
  
  -- Statut
  status TEXT NOT NULL DEFAULT 'active', -- active, cancelled, expired
  
  -- Dates
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancelled_at TIMESTAMPTZ,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT valid_period CHECK (current_period_end > current_period_start)
);

-- Index
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_period ON public.subscriptions(current_period_end);

-- Trigger updated_at
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

-- Commentaire de fin
COMMENT ON SCHEMA public IS 'Schéma principal de Vitrine 2.0';