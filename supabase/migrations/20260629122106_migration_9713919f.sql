-- eBay OAuth tokens storage
CREATE TABLE ebay_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamptz NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ebay_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_ebay_tokens" ON ebay_tokens FOR ALL USING (auth.uid() IS NOT NULL);

-- CJ Dropshipping credentials
CREATE TABLE cj_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key text NOT NULL,
  access_token text,
  expires_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cj_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_cj_credentials" ON cj_credentials FOR ALL USING (auth.uid() IS NOT NULL);

-- App settings/configuration
CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_margin_percent numeric DEFAULT 30.0,
  sync_interval_minutes integer DEFAULT 10,
  category_blacklist text[] DEFAULT '{}',
  brand_keyword_blacklist text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_settings" ON settings FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert default settings row
INSERT INTO settings (id) VALUES (gen_random_uuid());

-- Product discovery queue
CREATE TABLE product_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cj_product_id text NOT NULL,
  title text NOT NULL,
  image_url text,
  supplier_price numeric NOT NULL,
  suggested_ebay_price numeric NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE product_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_product_queue" ON product_queue FOR ALL USING (auth.uid() IS NOT NULL);

-- Active eBay listings
CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cj_product_id text NOT NULL,
  ebay_sku text NOT NULL UNIQUE,
  ebay_offer_id text NOT NULL,
  title text NOT NULL,
  current_price numeric NOT NULL,
  current_quantity integer NOT NULL DEFAULT 0,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_listings" ON listings FOR ALL USING (auth.uid() IS NOT NULL);

-- Orders and fulfillment tracking
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ebay_order_id text NOT NULL UNIQUE,
  cj_order_id text,
  status text NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'shipped')),
  tracking_number text,
  carrier_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_orders" ON orders FOR ALL USING (auth.uid() IS NOT NULL);

-- Activity log for automation events
CREATE TABLE activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  level text NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'error')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all_activity_log" ON activity_log FOR ALL USING (auth.uid() IS NOT NULL);

-- Create indexes for common queries
CREATE INDEX idx_product_queue_status ON product_queue(status);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX idx_listings_ebay_sku ON listings(ebay_sku);