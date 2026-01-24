-- Marketplace Products Table
CREATE TABLE IF NOT EXISTS public.marketplace_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entrepreneur_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  image_url TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Marketplace Orders Table
-- Note: To simplify logic and RLS, an order is specific to one entrepreneur.
-- If a user buys from multiple entrepreneurs, the frontend/backend should split this into multiple orders.
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) NOT NULL,
  entrepreneur_id UUID REFERENCES public.profiles(id) NOT NULL,
  total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Completed', 'Cancelled', 'Dispute')),
  escrow_status TEXT DEFAULT 'Held' CHECK (escrow_status IN ('Held', 'Released', 'Refunded')),
  shipping_address TEXT,
  estimated_delivery_date TIMESTAMP WITH TIME ZONE,
  payment_intent_id TEXT, -- For tracking Stripe/Crypto payments
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Marketplace Order Items Table
CREATE TABLE IF NOT EXISTS public.marketplace_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.marketplace_orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.marketplace_products(id) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase NUMERIC NOT NULL CHECK (price_at_purchase >= 0)
);

-- RLS Policies

-- Products
ALTER TABLE public.marketplace_products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
CREATE POLICY "Public read products" ON public.marketplace_products 
  FOR SELECT USING (true);

-- Entrepreneurs can manage their own products
CREATE POLICY "Entrepreneurs manage own products" ON public.marketplace_products 
  FOR ALL 
  USING (auth.uid() = entrepreneur_id)
  WITH CHECK (auth.uid() = entrepreneur_id);

-- Orders
ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers view own orders" ON public.marketplace_orders 
  FOR SELECT 
  USING (auth.uid() = buyer_id);

-- Entrepreneurs can view orders assigned to them
CREATE POLICY "Entrepreneurs view assigned orders" ON public.marketplace_orders 
  FOR SELECT 
  USING (auth.uid() = entrepreneur_id);

-- Entrepreneurs can update orders assigned to them (e.g. mark as shipped)
CREATE POLICY "Entrepreneurs update assigned orders" ON public.marketplace_orders 
  FOR UPDATE
  USING (auth.uid() = entrepreneur_id);

-- Buyers can update their own orders (e.g. confirm receipt)
CREATE POLICY "Buyers update own orders" ON public.marketplace_orders 
  FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Admins can view all orders (assuming admin role check exists or handled via service key/dashboard)
-- Adding a policy for admins if they are authenticated users with role 'admin'
CREATE POLICY "Admins view all orders" ON public.marketplace_orders 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all orders (for releasing funds)
CREATE POLICY "Admins update all orders" ON public.marketplace_orders 
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- Order Items
ALTER TABLE public.marketplace_order_items ENABLE ROW LEVEL SECURITY;

-- Viewable if the user can view the parent order
CREATE POLICY "View order items via parent" ON public.marketplace_order_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.marketplace_orders 
      WHERE id = marketplace_order_items.order_id 
      AND (
        buyer_id = auth.uid() 
        OR entrepreneur_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Insertable by authenticated users (during checkout)
CREATE POLICY "Authenticated insert order items" ON public.marketplace_order_items 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
