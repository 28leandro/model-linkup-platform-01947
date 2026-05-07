
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

CREATE TABLE public.payment_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  listing_id uuid REFERENCES public.listings(id) ON DELETE CASCADE,
  photo_count integer NOT NULL,
  amount_pyg integer NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
  payment_method text,
  pagopar_hash text,
  pagopar_token text,
  external_order_number text UNIQUE NOT NULL,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payment orders" ON public.payment_orders
FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_payment_orders_user ON public.payment_orders(user_id);
CREATE INDEX idx_payment_orders_listing ON public.payment_orders(listing_id);
CREATE INDEX idx_payment_orders_external ON public.payment_orders(external_order_number);

CREATE TRIGGER trg_payment_orders_updated_at BEFORE UPDATE ON public.payment_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
