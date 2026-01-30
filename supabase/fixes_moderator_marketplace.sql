-- ALLOW MODERATORS TO ACCESS MARKETPLACE DATA

-- 1. Marketplace Orders
-- Allow moderators to VIEW all orders
DROP POLICY IF EXISTS "Admins view all orders" ON marketplace_orders;
CREATE POLICY "Admins and Moderators view all orders"
ON marketplace_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- Allow moderators to UPDATE orders (e.g. resolve disputes, though mainly for viewing now)
-- Let's give them update rights just in case they need to manage status
DROP POLICY IF EXISTS "Admins update all orders" ON marketplace_orders;
CREATE POLICY "Admins and Moderators update all orders"
ON marketplace_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  )
);

-- 2. Marketplace Order Items
-- Allow viewing items if user is Admin or Moderator
DROP POLICY IF EXISTS "View order items via parent" ON marketplace_order_items;
CREATE POLICY "View order items via parent enhanced"
ON marketplace_order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_orders 
    WHERE id = marketplace_order_items.order_id 
    AND (
      buyer_id = auth.uid() 
      OR entrepreneur_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    )
  )
);
