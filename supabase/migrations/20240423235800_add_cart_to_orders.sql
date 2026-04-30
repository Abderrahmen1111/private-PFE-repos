-- Complete migration to support the new multi-item cart and ordering system
-- Payment columns removed as requested by user (no payment logic)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cart JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS shipping_method TEXT DEFAULT 'PICKUP',
ADD COLUMN IF NOT EXISTS shipping_cost NUMERIC DEFAULT 0;

-- Comments for context
COMMENT ON COLUMN public.orders.cart IS 'Détails articles (Array of items)';
COMMENT ON COLUMN public.orders.items IS 'Panier (snapshot)';
COMMENT ON COLUMN public.orders.shipping_method IS 'Méthode de livraison (PICKUP, DELIVERY, etc.)';
COMMENT ON COLUMN public.orders.shipping_cost IS 'Frais de livraison';
