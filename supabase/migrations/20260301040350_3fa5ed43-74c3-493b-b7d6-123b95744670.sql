
-- 1. Add new statuses to order_status enum
ALTER TYPE public.order_status ADD VALUE IF NOT EXISTS 'awaiting_shipment';

-- 2. Add tracking fields to orders
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS tracking_code text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS awaiting_shipment_at timestamptz;

-- 3. Add origin_address to stores
ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS origin_address jsonb;

-- 4. Create tracking_history table
CREATE TABLE IF NOT EXISTS public.tracking_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status_code text NOT NULL,
  description text NOT NULL,
  location text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tracking_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer can view tracking" ON public.tracking_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = tracking_history.order_id AND o.buyer_id = auth.uid())
  );

CREATE POLICY "Store member can view tracking" ON public.tracking_history
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = tracking_history.order_id AND public.is_store_member(auth.uid(), o.store_id))
  );

CREATE POLICY "Store member can insert tracking" ON public.tracking_history
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders o WHERE o.id = tracking_history.order_id AND public.is_store_member(auth.uid(), o.store_id))
  );

-- 5. Create returns table
CREATE TABLE IF NOT EXISTS public.returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  store_id uuid NOT NULL REFERENCES public.stores(id),
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'requested',
  return_tracking_code text,
  return_label_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer can view own returns" ON public.returns
  FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Buyer can create returns" ON public.returns
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Store member can view returns" ON public.returns
  FOR SELECT USING (public.is_store_member(auth.uid(), store_id));

CREATE POLICY "Store member can update returns" ON public.returns
  FOR UPDATE USING (public.is_store_member(auth.uid(), store_id));

-- 6. Enable realtime for tracking_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_history;
