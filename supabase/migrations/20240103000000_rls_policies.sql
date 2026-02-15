-- ============================================================================
-- Migration: 20240103000000_rls_policies.sql
-- Description: Row Level Security (RLS) - Politiques de sécurité
-- ============================================================================

-- ============================================================================
-- 1. ACTIVER RLS SUR TOUTES LES TABLES
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLICIES POUR LA TABLE USERS
-- ============================================================================

-- Lecture: Tout le monde peut voir les profils publics
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Insertion: Seulement lors de la création du compte (via trigger auth)
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Mise à jour: Seulement son propre profil
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Suppression: Interdit (utiliser soft delete si nécessaire)
CREATE POLICY "Users cannot delete profiles"
  ON public.users FOR DELETE
  USING (false);

-- ============================================================================
-- 3. POLICIES POUR LA TABLE STORES
-- ============================================================================

-- Lecture: Tout le monde peut voir les stores ACTIFS
CREATE POLICY "Stores are viewable by everyone"
  ON public.stores FOR SELECT
  USING (
    status = 'ACTIVE' 
    OR owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Seulement les PRO peuvent créer des stores
CREATE POLICY "PRO users can create stores"
  ON public.stores FOR INSERT
  WITH CHECK (
    owner_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role IN ('PRO', 'ADMIN')
    )
  );

-- Mise à jour: Propriétaire ou admin
CREATE POLICY "Store owners can update their stores"
  ON public.stores FOR UPDATE
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  )
  WITH CHECK (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Suppression: Seulement admin
CREATE POLICY "Only admins can delete stores"
  ON public.stores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 4. POLICIES POUR LA TABLE ITEMS
-- ============================================================================

-- Lecture: Tout le monde peut voir les items AVAILABLE
CREATE POLICY "Items are viewable by everyone"
  ON public.items FOR SELECT
  USING (
    status IN ('AVAILABLE', 'ON_DEMAND')
    OR EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = items.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Propriétaire du store
CREATE POLICY "Store owners can create items"
  ON public.items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = store_id AND owner_id = auth.uid()
    )
  );

-- Mise à jour: Propriétaire du store
CREATE POLICY "Store owners can update their items"
  ON public.items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = items.store_id AND owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = items.store_id AND owner_id = auth.uid()
    )
  );

-- Suppression: Propriétaire du store ou admin
CREATE POLICY "Store owners can delete their items"
  ON public.items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = items.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 5. POLICIES POUR LA TABLE SERVICE_SCHEDULES
-- ============================================================================

-- Lecture: Tout le monde
CREATE POLICY "Schedules are viewable by everyone"
  ON public.service_schedules FOR SELECT
  USING (true);

-- Insertion: Propriétaire du store
CREATE POLICY "Store owners can create schedules"
  ON public.service_schedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.items 
      JOIN public.stores ON items.store_id = stores.id
      WHERE items.id = item_id AND stores.owner_id = auth.uid()
    )
  );

-- Mise à jour: Propriétaire du store
CREATE POLICY "Store owners can update schedules"
  ON public.service_schedules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.items 
      JOIN public.stores ON items.store_id = stores.id
      WHERE items.id = service_schedules.item_id AND stores.owner_id = auth.uid()
    )
  );

-- Suppression: Propriétaire du store
CREATE POLICY "Store owners can delete schedules"
  ON public.service_schedules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.items 
      JOIN public.stores ON items.store_id = stores.id
      WHERE items.id = service_schedules.item_id AND stores.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. POLICIES POUR LA TABLE ORDERS
-- ============================================================================

-- Lecture: Client propriétaire, vendeur, ou admin
CREATE POLICY "Orders viewable by customer, vendor, or admin"
  ON public.orders FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Clients authentifiés
CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND customer_id = auth.uid()
  );

-- Mise à jour: Vendeur peut modifier (statut, notes)
CREATE POLICY "Vendors can update their orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = orders.store_id AND owner_id = auth.uid()
    )
  );

-- Suppression: Interdit (garder l'historique)
CREATE POLICY "Orders cannot be deleted"
  ON public.orders FOR DELETE
  USING (false);

-- ============================================================================
-- 7. POLICIES POUR LA TABLE BOOKINGS
-- ============================================================================

-- Lecture: Client propriétaire, vendeur, ou admin
CREATE POLICY "Bookings viewable by customer, vendor, or admin"
  ON public.bookings FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = bookings.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Clients authentifiés
CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND customer_id = auth.uid()
  );

-- Mise à jour: Vendeur peut modifier
CREATE POLICY "Vendors can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = bookings.store_id AND owner_id = auth.uid()
    )
  );

-- Suppression: Interdit
CREATE POLICY "Bookings cannot be deleted"
  ON public.bookings FOR DELETE
  USING (false);

-- ============================================================================
-- 8. POLICIES POUR LA TABLE REVIEWS
-- ============================================================================

-- Lecture: Avis approuvés visibles par tous, tous avis pour auteur/vendeur/admin
CREATE POLICY "Reviews viewable based on approval"
  ON public.reviews FOR SELECT
  USING (
    (is_approved = true AND is_spam = false)
    OR author_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = reviews.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Clients authentifiés
CREATE POLICY "Authenticated users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = auth.uid()
  );

-- Mise à jour: Auteur (48h), vendeur (réponse), admin
CREATE POLICY "Reviews can be updated by author, vendor, or admin"
  ON public.reviews FOR UPDATE
  USING (
    (author_id = auth.uid() AND created_at > NOW() - INTERVAL '48 hours')
    OR EXISTS (
      SELECT 1 FROM public.stores 
      WHERE id = reviews.store_id AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Suppression: Seulement admin
CREATE POLICY "Only admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 9. POLICIES POUR LA TABLE SUBSCRIPTIONS
-- ============================================================================

-- Lecture: Propriétaire ou admin
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Insertion: Admin seulement (créé via système de paiement)
CREATE POLICY "Only admins can create subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Mise à jour: Admin seulement
CREATE POLICY "Only admins can update subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Suppression: Admin seulement
CREATE POLICY "Only admins can delete subscriptions"
  ON public.subscriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================================================
-- 10. VÉRIFICATION DES POLICIES
-- ============================================================================

-- Lister toutes les policies créées
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE 'Nombre total de policies créées: %', policy_count;
  
  IF policy_count < 30 THEN
    RAISE WARNING 'Nombre de policies inférieur à attendu (30+)';
  END IF;
END $$;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================

COMMENT ON SCHEMA public IS 'RLS activé sur toutes les tables avec policies complètes';