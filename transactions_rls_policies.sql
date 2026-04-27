-- Politique pour permettre aux propriétaires de boutiques d'insérer des transactions pour leur boutique
CREATE POLICY "Merchants can insert their own transactions" 
ON "public"."transactions" 
AS PERMISSIVE FOR INSERT 
TO public 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = transactions.merchant_id 
    AND stores.owner_id = auth.uid()
  )
);

-- Politique pour permettre aux propriétaires de boutiques de mettre à jour les transactions de leur boutique
CREATE POLICY "Merchants can update their own transactions" 
ON "public"."transactions" 
AS PERMISSIVE FOR UPDATE 
TO public 
USING (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = transactions.merchant_id 
    AND stores.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores 
    WHERE stores.id = transactions.merchant_id 
    AND stores.owner_id = auth.uid()
  )
);
