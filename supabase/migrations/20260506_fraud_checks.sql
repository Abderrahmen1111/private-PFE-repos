-- =============================================================
-- Ro2ya — Migration : Détection de fraude sur les commandes
-- Adapté au schéma existant (orders.id = BIGINT, store_id, statuts réels)
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Colonnes rapides sur orders
--    (fraud_score, fraud_level, merchant_override_fraud)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS fraud_score     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fraud_level     TEXT    DEFAULT 'safe'
    CHECK (fraud_level IN ('safe', 'suspicious', 'high_risk', 'blocked')),
  ADD COLUMN IF NOT EXISTS merchant_override_fraud BOOLEAN DEFAULT FALSE;


-- ─────────────────────────────────────────────────────────────
-- 2. Ajout de PENDING_REVIEW au type ENUM order_status
--    Méthode : recréation complète (transactionnelle, rollbackable)
--    On supprime d'abord les vues qui dépendent de la colonne status
-- ─────────────────────────────────────────────────────────────

-- 2a. Supprimer les vues qui bloquent l'ALTER COLUMN TYPE
DROP VIEW IF EXISTS orders_with_fraud;

-- 2b. Créer un nouveau type avec toutes les valeurs + PENDING_REVIEW
CREATE TYPE order_status_new AS ENUM (
  'PENDING',
  'PENDING_REVIEW',
  'VALIDATED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

-- 2c. Supprimer le DEFAULT sur status (bloque le cast automatique)
ALTER TABLE orders ALTER COLUMN status DROP DEFAULT;

-- 2d. Migrer la colonne orders.status vers le nouveau type
ALTER TABLE orders
  ALTER COLUMN status TYPE order_status_new
  USING status::text::order_status_new;

-- 2e. Remettre le DEFAULT avec le nouveau type
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'PENDING'::order_status_new;

-- 2f. Supprimer l'ancien type
DROP TYPE order_status;

-- 2g. Renommer le nouveau type pour garder le nom original
ALTER TYPE order_status_new RENAME TO order_status;


-- ─────────────────────────────────────────────────────────────
-- 3. Table détaillée order_fraud_checks
--    Référence orders.id (BIGINT, pas UUID)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_fraud_checks (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      BIGINT      NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  score         INTEGER     NOT NULL CHECK (score >= 0 AND score <= 100),
  level         TEXT        NOT NULL
    CHECK (level IN ('safe', 'suspicious', 'high_risk', 'blocked')),
  signals       JSONB       NOT NULL DEFAULT '[]',
  recommendation TEXT       NOT NULL
    CHECK (recommendation IN ('approve', 'review', 'reject')),
  ai_reasoning  TEXT,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id)
);

COMMENT ON TABLE order_fraud_checks IS
  'Analyse de fraude IA pour chaque commande — score, signaux et recommandation.';


-- ─────────────────────────────────────────────────────────────
-- 4. Index pour les requêtes dashboard merchant
-- ─────────────────────────────────────────────────────────────

-- Index sur store_id + fraud_level pour filtrage rapide dans le dashboard
CREATE INDEX IF NOT EXISTS idx_orders_fraud_level
  ON orders(store_id, fraud_level);

-- Index pour trier par score décroissant (cas les plus risqués en premier)
CREATE INDEX IF NOT EXISTS idx_orders_fraud_score
  ON orders(fraud_score DESC);

-- Index sur order_fraud_checks.order_id pour les JOINs
CREATE INDEX IF NOT EXISTS idx_order_fraud_checks_order_id
  ON order_fraud_checks(order_id);


-- ─────────────────────────────────────────────────────────────
-- 5. Row Level Security (RLS) sur order_fraud_checks
--    Merchants ne voient que les checks de leurs propres commandes
-- ─────────────────────────────────────────────────────────────
ALTER TABLE order_fraud_checks ENABLE ROW LEVEL SECURITY;

-- Merchants : lecture seule de leurs propres commandes
-- (utilise store_id → stores.owner_id pour relier à auth.uid())
DROP POLICY IF EXISTS "merchants_read_own_fraud_checks" ON order_fraud_checks;
CREATE POLICY "merchants_read_own_fraud_checks"
  ON order_fraud_checks
  FOR SELECT
  USING (
    order_id IN (
      SELECT o.id FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE s.owner_id = auth.uid()
    )
  );

-- Service role : accès complet (pour les workers/API routes backend)
DROP POLICY IF EXISTS "service_role_all_fraud_checks" ON order_fraud_checks;
CREATE POLICY "service_role_all_fraud_checks"
  ON order_fraud_checks
  FOR ALL
  USING (auth.role() = 'service_role');



-- ─────────────────────────────────────────────────────────────
-- 6. Vue pratique pour le dashboard merchant
--    Jointure orders + order_fraud_checks (LEFT JOIN)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW orders_with_fraud AS
  SELECT
    o.*,
    ofc.score             AS fraud_score_detail,   -- score précis (0-100)
    ofc.signals           AS fraud_signals,         -- tableau JSON de signaux déclenchés
    ofc.ai_reasoning      AS fraud_reasoning,       -- explication IA
    ofc.recommendation    AS fraud_recommendation,  -- approve | review | reject
    ofc.checked_at        AS fraud_checked_at
  FROM orders o
  LEFT JOIN order_fraud_checks ofc ON ofc.order_id = o.id;

COMMENT ON VIEW orders_with_fraud IS
  'Vue enrichie des commandes avec les données de fraude (LEFT JOIN).';
