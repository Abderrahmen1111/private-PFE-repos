-- 1. Activer l'extension PostGIS (si ce n'est pas déjà fait)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Création de la table de cache pour Geoapify
CREATE TABLE IF NOT EXISTS geo_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT UNIQUE NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter un index pour accélérer la recherche par requête
CREATE INDEX IF NOT EXISTS idx_geo_cache_query ON geo_cache (query);

-- Fonction pour nettoyer le cache vieux de plus de 24h (optionnel, peut être appelé par un Cron Supabase)
CREATE OR REPLACE FUNCTION clean_old_geo_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM geo_cache WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;


-- 3. Fonction RPC pour trouver les boutiques à proximité (ST_DWithin)
-- Paramètres : 
--   search_lat: Latitude du centre
--   search_lng: Longitude du centre
--   radius_meters: Rayon de recherche en mètres (ex: 5000 pour 5km)
CREATE OR REPLACE FUNCTION get_nearby_stores(search_lat DOUBLE PRECISION, search_lng DOUBLE PRECISION, radius_meters DOUBLE PRECISION)
RETURNS TABLE (
    id BIGINT,
    name TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance DOUBLE PRECISION,
    rating_average DOUBLE PRECISION,
    total_reviews BIGINT,
    logo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.category::text,
        s.address,
        s.city,
        s.latitude,
        s.longitude,
        -- Calcul de la distance en mètres
        ST_DistanceSphere(st_makepoint(s.longitude, s.latitude), st_makepoint(search_lng, search_lat)) AS distance,
        s.rating_average,
        s.total_reviews,
        s.logo_url
    FROM 
        stores s
    WHERE 
        s.latitude IS NOT NULL 
        AND s.longitude IS NOT NULL
        -- Filtre PostGIS très rapide
        AND ST_DWithin(
            st_makepoint(s.longitude, s.latitude)::geography, 
            st_makepoint(search_lng, search_lat)::geography, 
            radius_meters
        )
        AND s.status = 'ACTIVE'
    ORDER BY 
        distance ASC;
END;
$$ LANGUAGE plpgsql;
