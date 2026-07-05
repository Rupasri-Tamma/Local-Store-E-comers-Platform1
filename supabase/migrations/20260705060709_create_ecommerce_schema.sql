
/*
# Local Store E-Commerce Platform Schema

## Summary
Creates all tables needed for a local store e-commerce platform.

## New Tables

### products
Stores all product catalog entries.
- id (uuid, PK)
- name (text) - product name
- description (text) - detailed product description
- price (numeric) - price in USD
- image_url (text) - Pexels photo URL
- category (text) - product category for filtering
- stock (integer) - available inventory
- featured (boolean) - whether to show on homepage hero
- created_at (timestamptz)

### orders
Stores customer orders.
- id (uuid, PK)
- tracking_number (text, unique) - human-readable order tracking code
- customer_name (text)
- customer_email (text)
- customer_phone (text)
- customer_address (text)
- status (text) - pending | processing | shipped | delivered
- total (numeric) - order total in USD
- notes (text) - optional customer notes
- created_at (timestamptz)

### order_items
Line items belonging to an order.
- id (uuid, PK)
- order_id (uuid, FK -> orders)
- product_id (uuid, FK -> products)
- product_name (text) - snapshot at time of order
- product_image (text) - snapshot at time of order
- quantity (integer)
- unit_price (numeric)

### reviews
Customer product reviews.
- id (uuid, PK)
- product_id (uuid, FK -> products)
- reviewer_name (text)
- rating (integer 1-5)
- comment (text)
- created_at (timestamptz)

### support_tickets
Customer support inquiries.
- id (uuid, PK)
- name (text)
- email (text)
- subject (text)
- message (text)
- status (text) - open | closed
- created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All policies grant anon + authenticated access (no sign-in required).
- Data is intentionally public/shared (single-tenant store).

## Seed Data
Inserts 12 sample products across 4 categories.
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  category text NOT NULL,
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_products" ON products;
CREATE POLICY "anon_insert_products" ON products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_products" ON products;
CREATE POLICY "anon_update_products" ON products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_products" ON products;
CREATE POLICY "anon_delete_products" ON products FOR DELETE TO anon, authenticated USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','shipped','delivered')),
  total numeric(10,2) NOT NULL CHECK (total >= 0),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_orders" ON orders;
CREATE POLICY "anon_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_orders" ON orders;
CREATE POLICY "anon_update_orders" ON orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_orders" ON orders;
CREATE POLICY "anon_delete_orders" ON orders FOR DELETE TO anon, authenticated USING (true);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL CHECK (unit_price >= 0)
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_order_items" ON order_items;
CREATE POLICY "anon_select_order_items" ON order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_order_items" ON order_items;
CREATE POLICY "anon_insert_order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_order_items" ON order_items;
CREATE POLICY "anon_update_order_items" ON order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_order_items" ON order_items;
CREATE POLICY "anon_delete_order_items" ON order_items FOR DELETE TO anon, authenticated USING (true);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE TO anon, authenticated USING (true);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_support_tickets" ON support_tickets;
CREATE POLICY "anon_select_support_tickets" ON support_tickets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_support_tickets" ON support_tickets;
CREATE POLICY "anon_insert_support_tickets" ON support_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_support_tickets" ON support_tickets;
CREATE POLICY "anon_update_support_tickets" ON support_tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_support_tickets" ON support_tickets;
CREATE POLICY "anon_delete_support_tickets" ON support_tickets FOR DELETE TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_number);

-- Seed products (idempotent: only insert if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
    INSERT INTO products (name, description, price, image_url, category, stock, featured) VALUES
    ('Organic Whole Milk', 'Fresh farm-to-table whole milk, sourced from local grass-fed cows. Rich in calcium and vitamins for the whole family.', 4.99, 'https://images.pexels.com/photos/3735170/pexels-photo-3735170.jpeg?auto=compress&cs=tinysrgb&w=600', 'Dairy', 50, true),
    ('Artisan Sourdough Bread', 'Slow-fermented sourdough baked fresh daily. Crispy crust with a soft, chewy interior. No preservatives added.', 7.49, 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600', 'Bakery', 30, true),
    ('Free-Range Eggs (12 pack)', 'Certified free-range eggs from happy hens. Bright golden yolks and rich flavor guaranteed.', 6.99, 'https://images.pexels.com/photos/1556707/pexels-photo-1556707.jpeg?auto=compress&cs=tinysrgb&w=600', 'Dairy', 40, false),
    ('Local Wildflower Honey', 'Raw, unfiltered honey harvested from local beehives. Packed with antioxidants and natural enzymes.', 12.99, 'https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg?auto=compress&cs=tinysrgb&w=600', 'Pantry', 25, true),
    ('Heirloom Tomatoes', 'A colorful mix of heirloom tomatoes bursting with flavor. Perfect for salads, sauces, and snacking.', 3.99, 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=600', 'Produce', 60, false),
    ('Extra Virgin Olive Oil', 'Cold-pressed extra virgin olive oil with a rich, fruity flavor. Ideal for dressings and light cooking.', 14.99, 'https://images.pexels.com/photos/1028361/pexels-photo-1028361.jpeg?auto=compress&cs=tinysrgb&w=600', 'Pantry', 35, false),
    ('Fresh Spinach (200g)', 'Tender baby spinach leaves, washed and ready to use. High in iron, vitamins A and C.', 2.99, 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=600', 'Produce', 45, false),
    ('Aged Cheddar Cheese', 'Sharp, nutty aged cheddar aged for 12 months. Pairs perfectly with crackers, fruits, and wines.', 9.49, 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=600', 'Dairy', 20, false),
    ('Croissants (4 pack)', 'Buttery, flaky croissants baked fresh each morning. Made with pure butter and no artificial additives.', 8.99, 'https://images.pexels.com/photos/1775033/pexels-photo-1775033.jpeg?auto=compress&cs=tinysrgb&w=600', 'Bakery', 25, false),
    ('Greek Yogurt (500g)', 'Thick and creamy Greek yogurt made from whole milk. High in protein and probiotics.', 5.49, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600', 'Dairy', 30, false),
    ('Avocados (3 pack)', 'Perfectly ripened Hass avocados. Creamy texture and mild flavor — ideal for guacamole or toast.', 5.99, 'https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&w=600', 'Produce', 35, false),
    ('Organic Granola', 'Wholesome oat granola with honey, almonds and dried berries. Perfect for breakfast or snacking.', 8.49, 'https://images.pexels.com/photos/1359326/pexels-photo-1359326.jpeg?auto=compress&cs=tinysrgb&w=600', 'Pantry', 40, false);
  END IF;
END $$;
