-- ============================================================================
-- Migration: 20240102000000_enable_pgvector.sql
-- Description: Activation de pgvector pour la recherche sémantique IA
-- ============================================================================

-- ============================================================================
-- 1. ACTIVER L'EXTENSION PGVECTOR
-- ============================================================================

-- Installation de l'extension pgvector pour les embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Vérification de l'installation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE NOTICE 'Extension vector activée avec succès';
  ELSE
    RAISE EXCEPTION 'Échec de l''activation de l''extension vector';
  END IF;
END $$;

-- ============================================================================
-- 2. AJOUTER LA COLONNE EMBEDDING À LA TABLE ITEMS
-- ============================================================================

-- Colonne pour stocker les embeddings (vecteurs de 384 dimensions)
-- OpenAI text-embedding-3-small génère des vecteurs de 384 dimensions
ALTER TABLE public.items
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Index pour la recherche vectorielle rapide
-- HNSW (Hierarchical Navigable Small World) est optimal pour les grandes données
CREATE INDEX IF NOT EXISTS idx_items_embedding 
ON public.items 
USING hnsw (embedding vector_cosine_ops);

-- Alternative: IVFFlat (plus rapide à créer, mais moins performant)
-- CREATE INDEX IF NOT EXISTS idx_items_embedding 
-- ON public.items 
-- USING ivfflat (embedding vector_cosine_ops)
-- WITH (lists = 100);

-- ============================================================================
-- 3. COMMENTAIRES ET DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.items.embedding IS 
  'Vecteur d''embedding (384 dimensions) généré par OpenAI text-embedding-3-small pour la recherche sémantique';

COMMENT ON INDEX idx_items_embedding IS 
  'Index HNSW pour la recherche vectorielle par similarité cosinus';

-- ============================================================================
-- 4. VÉRIFICATION
-- ============================================================================

-- Vérifier que la colonne a été créée
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'items' 
      AND column_name = 'embedding'
  ) THEN
    RAISE NOTICE 'Colonne embedding créée avec succès dans la table items';
  ELSE
    RAISE EXCEPTION 'Échec de la création de la colonne embedding';
  END IF;
END $$;

-- Vérifier que l'index a été créé
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND tablename = 'items' 
      AND indexname = 'idx_items_embedding'
  ) THEN
    RAISE NOTICE 'Index embedding créé avec succès';
  ELSE
    RAISE EXCEPTION 'Échec de la création de l''index embedding';
  END IF;
END $$;

-- ============================================================================
-- 5. NOTES D'UTILISATION
-- ============================================================================

/*
UTILISATION DE PGVECTOR DANS L'APPLICATION:

1. Génération d'embeddings (dans le code TypeScript):
   ```typescript
   import OpenAI from 'openai'
   
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
   
   const response = await openai.embeddings.create({
     model: 'text-embedding-3-small',
     input: 'Coupe de cheveux pour homme'
   })
   
   const embedding = response.data[0].embedding // Array de 384 nombres
   ```

2. Insertion avec embedding:
   ```sql
   INSERT INTO items (name, description, embedding, ...)
   VALUES (
     'Coupe homme',
     'Coupe classique',
     '[0.123, -0.456, ...]'::vector(384),
     ...
   );
   ```

3. Recherche par similarité (voir fonction dans 20240105000000_functions.sql):
   ```sql
   SELECT name, 1 - (embedding <=> query_embedding) AS similarity
   FROM items
   WHERE 1 - (embedding <=> query_embedding) > 0.7
   ORDER BY embedding <=> query_embedding
   LIMIT 10;
   ```

OPÉRATEURS DISPONIBLES:
- <-> : Distance L2 (Euclidienne)
- <#> : Produit scalaire (inner product)
- <=> : Distance cosinus (recommandé pour les embeddings texte)

PERFORMANCES:
- HNSW: Recherche très rapide, création d'index plus lente
- IVFFlat: Création rapide, recherche moins rapide
- Pour <100k items: HNSW recommandé
- Pour >100k items: IVFFlat peut être considéré

DIMENSIONNALITÉ:
- text-embedding-3-small: 384 dimensions (optimal prix/performance)
- text-embedding-3-large: 1536 dimensions (meilleure qualité, plus cher)
- text-embedding-ada-002: 1536 dimensions (ancien modèle)
*/

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================