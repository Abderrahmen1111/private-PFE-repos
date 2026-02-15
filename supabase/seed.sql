# FICHIERS CONFIGURATION SUPABASE
## Tous les fichiers de configuration et migrations

## 📁 supabase/config.toml

```toml
# Supabase Local Development Configuration

[project]
name = "vitrine-2-0"

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[inbucket]
enabled = true
port = 54324
smtp_port = 54325
pop3_port = 54326

[storage]
enabled = true
file_size_limit = "50MiB"

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[auth.external.google]
enabled = false
client_id = ""
secret = ""

[edge_functions]
enabled = true

[functions.semantic-search]
verify_jwt = false

[functions.analyze-sentiment]
verify_jwt = false

[functions.generate-response]
verify_jwt = false
```

---

## 📁 supabase/seed.sql

```sql
-- ============================================================================
-- SEED DATA - Données de test pour développement
-- ============================================================================

-- Désactiver temporairement les triggers
SET session_replication_role = replica;

-- ============================================================================
-- 1. USERS (via auth.users car RLS)
-- ============================================================================

-- Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'authenticated',
  'authenticated',
  'admin@vitrine.tn',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Principal"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Profil admin
INSERT INTO public.users (id, role, full_name, phone, city)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'ADMIN',
  'Admin Principal',
  '+21620000000',
  'Tunis'
);

-- Business Owners
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'b1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'vendeur1@vitrine.tn', crypt('vendeur123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmed Coiffeur"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'b2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'vendeur2@vitrine.tn', crypt('vendeur123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Restaurant Le Palace"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'b3333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'vendeur3@vitrine.tn', crypt('vendeur123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Plomberie Express"}', NOW(), NOW());

-- Profils vendeurs
INSERT INTO public.users (id, role, full_name, phone, city) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'PRO', 'Ahmed Coiffeur', '+21620111111', 'Tunis'),
  ('b2222222-2222-2222-2222-222222222222', 'PRO', 'Restaurant Le Palace', '+21620222222', 'Tunis'),
  ('b3333333-3333-3333-3333-333333333333', 'PRO', 'Plomberie Express', '+21620333333', 'Tunis');

-- Clients
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
  ('00000000-0000-0000-0000-000000000000', 'c1111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'client1@gmail.com', crypt('client123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mohamed Ali"}', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000000', 'c2222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'client2@gmail.com', crypt('client123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Fatima Zahra"}', NOW(), NOW());

-- Profils clients
INSERT INTO public.users (id, role, full_name, phone, city) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'CLIENT', 'Mohamed Ali', '+21625111111', 'Tunis'),
  ('c2222222-2222-2222-2222-222222222222', 'CLIENT', 'Fatima Zahra', '+21625222222', 'Ariana');

-- ============================================================================
-- 2. STORES
-- ============================================================================

INSERT INTO public.stores (
  owner_id, name, slug, description, category,
  phone, email, address,
  latitude, longitude, city,
  status
) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'Salon Ahmed - Coiffure Homme',
    'salon-ahmed-coiffure',
    'Salon de coiffure pour hommes, spécialiste barbe et coupe moderne',
    'BEAUTY',
    '+21620111111',
    'contact@salonahmed.tn',
    '15 Avenue Habib Bourguiba, Tunis',
    36.8065,
    10.1815,
    'Tunis',
    'ACTIVE'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Restaurant Le Palace',
    'restaurant-le-palace',
    'Cuisine tunisienne traditionnelle et plats internationaux',
    'RESTAURANT',
    '+21620222222',
    'info@lepalace.tn',
    '88 Avenue de la Liberté, Tunis',
    36.8002,
    10.1816,
    'Tunis',
    'ACTIVE'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'Plomberie Express',
    'plomberie-express',
    'Interventions rapides 24h/24 pour tous vos problèmes de plomberie',
    'REPAIR',
    '+21620333333',
    'contact@plomberie-express.tn',
    'Cité Ennasr, Ariana',
    36.8625,
    10.1956,
    'Ariana',
    'ACTIVE'
  );

-- ============================================================================
-- 3. ITEMS (Produits et Services)
-- ============================================================================

-- Service: Coupe homme
INSERT INTO public.items (
  store_id, item_type, name, slug, description,
  price, price_unit, duration_minutes, is_bookable,
  stock_quantity, status, main_image
) VALUES (
  1,
  'SERVICE',
  'Coupe Homme Classique',
  'coupe-homme-classique',
  'Coupe de cheveux classique avec finitions précises',
  15.000,
  'session',
  30,
  TRUE,
  NULL,
  'AVAILABLE',
  '/images/coupe-homme.jpg'
);

-- Service: Coupe + Barbe
INSERT INTO public.items (
  store_id, item_type, name, slug, description,
  price, price_unit, duration_minutes, is_bookable,
  stock_quantity, status, main_image
) VALUES (
  1,
  'SERVICE',
  'Coupe + Taille Barbe',
  'coupe-barbe',
  'Coupe de cheveux + taille et modelage de barbe',
  25.000,
  'session',
  45,
  TRUE,
  NULL,
  'AVAILABLE',
  '/images/coupe-barbe.jpg'
);

-- Horaires pour services coiffure (Lundi-Samedi)
INSERT INTO public.service_schedules (item_id, day_of_week, start_time, end_time, max_bookings)
VALUES 
  (1, 1, '09:00', '18:00', 8), -- Lundi
  (1, 2, '09:00', '18:00', 8),
  (1, 3, '09:00', '18:00', 8),
  (1, 4, '09:00', '18:00', 8),
  (1, 5, '09:00', '18:00', 8),
  (1, 6, '09:00', '14:00', 4), -- Samedi
  (2, 1, '09:00', '18:00', 6),
  (2, 2, '09:00', '18:00', 6),
  (2, 3, '09:00', '18:00', 6),
  (2, 4, '09:00', '18:00', 6),
  (2, 5, '09:00', '18:00', 6),
  (2, 6, '09:00', '14:00', 3);

-- Produit: Couscous (Restaurant)
INSERT INTO public.items (
  store_id, item_type, name, slug, description,
  price, price_unit, stock_quantity, status, main_image
) VALUES (
  2,
  'PRODUCT',
  'Couscous Royal (4 personnes)',
  'couscous-royal-4p',
  'Couscous traditionnel avec viande, merguez et légumes frais du marché',
  45.000,
  'unit',
  0,
  'ON_DEMAND',
  '/images/couscous.jpg'
);

-- Produit: Ojja
INSERT INTO public.items (
  store_id, item_type, name, slug, description,
  price, price_unit, stock_quantity, status, main_image
) VALUES (
  2,
  'PRODUCT',
  'Ojja Merguez',
  'ojja-merguez',
  'Ojja tunisienne aux merguez et œufs',
  12.000,
  'unit',
  0,
  'ON_DEMAND',
  '/images/ojja.jpg'
);

-- Service: Réparation fuite
INSERT INTO public.items (
  store_id, item_type, name, slug, description,
  price, price_unit, duration_minutes, is_bookable,
  stock_quantity, status, main_image
) VALUES (
  3,
  'SERVICE',
  'Réparation Fuite Urgente',
  'reparation-fuite',
  'Intervention rapide pour réparation de fuite (robinet, WC, tuyauterie)',
  80.000,
  'hour',
  NULL,
  FALSE,
  NULL,
  'AVAILABLE',
  '/images/plomberie.jpg'
);

-- ============================================================================
-- 4. ORDERS & BOOKINGS (Exemples)
-- ============================================================================

-- Commande restaurant
INSERT INTO public.orders (
  customer_id, store_id, item_id,
  quantity, unit_price, total_price,
  customer_name, customer_phone, customer_email, delivery_address,
  status
) VALUES (
  'c1111111-1111-1111-1111-111111111111',
  2,
  3,
  1,
  45.000,
  45.000,
  'Mohamed Ali',
  '+21625111111',
  'client1@gmail.com',
  '10 Rue de la République, Tunis',
  'COMPLETED'
);

-- Réservation coiffure
INSERT INTO public.bookings (
  item_id, customer_id, store_id,
  booking_date, start_time, end_time, duration_minutes,
  customer_name, customer_phone, price, status
) VALUES (
  2,
  'c2222222-2222-2222-2222-222222222222',
  1,
  CURRENT_DATE + INTERVAL '2 days',
  '14:00',
  '14:45',
  45,
  'Fatima Zahra',
  '+21625222222',
  25.000,
  'PENDING'
);

-- ============================================================================
-- 5. REVIEWS
-- ============================================================================

INSERT INTO public.reviews (
  author_id, item_id, store_id, order_id,
  rating, title, comment,
  is_verified, sentiment_score, sentiment_label
) VALUES (
  'c1111111-1111-1111-1111-111111111111',
  3,
  2,
  1,
  5,
  'Excellent couscous!',
  'Vraiment délicieux, comme chez ma mère! Les portions sont généreuses et les prix corrects. Je recommande vivement!',
  TRUE,
  0.9,
  'POSITIVE'
);

-- Réactiver les triggers
SET session_replication_role = DEFAULT;

-- ============================================================================
-- RÉSUMÉ
-- ============================================================================

DO $$ 
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'SEED DATA CHARGÉES';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Comptes créés:';
  RAISE NOTICE '  • Admin:     admin@vitrine.tn / admin123';
  RAISE NOTICE '  • Vendeur 1: vendeur1@vitrine.tn / vendeur123';
  RAISE NOTICE '  • Vendeur 2: vendeur2@vitrine.tn / vendeur123';
  RAISE NOTICE '  • Vendeur 3: vendeur3@vitrine.tn / vendeur123';
  RAISE NOTICE '  • Client 1:  client1@gmail.com / client123';
  RAISE NOTICE '  • Client 2:  client2@gmail.com / client123';
  RAISE NOTICE '';
  RAISE NOTICE 'Données:';
  RAISE NOTICE '  • 3 Commerces (Coiffure, Restaurant, Plomberie)';
  RAISE NOTICE '  • 6 Items (3 services + 3 produits)';
  RAISE NOTICE '  • 1 Commande';
  RAISE NOTICE '  • 1 Réservation';
  RAISE NOTICE '  • 1 Avis';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
END $$;
```

Les migrations sont déjà dans le fichier `SUPABASE_Schema_Produits_Services.sql` que j'ai créé précédemment. Je vais maintenant créer les fichiers lib/, hooks/, etc.