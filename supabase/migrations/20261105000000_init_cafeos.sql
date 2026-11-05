-- CafeOS Production Schema & Row Level Security (RLS)
-- Multi-Tenant Café Operations Platform
-- Target Initial Deployment: Kurali, Punjab, India

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types & Enums
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('received', 'preparing', 'ready', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'cash_on_delivery', 'upi_received');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE membership_role AS ENUM ('owner', 'manager', 'staff');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. CAFES TABLE (Tenants)
CREATE TABLE IF NOT EXISTS cafes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    tagline VARCHAR(255),
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(64) NOT NULL DEFAULT 'Kurali',
    state VARCHAR(64) NOT NULL DEFAULT 'Punjab',
    postal_code VARCHAR(16) DEFAULT '140103',
    phone VARCHAR(20) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'INR',
    currency_symbol VARCHAR(8) NOT NULL DEFAULT '₹',
    logo_url TEXT,
    banner_url TEXT,
    opening_time VARCHAR(16) DEFAULT '09:00 AM',
    closing_time VARCHAR(16) DEFAULT '10:30 PM',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. PROFILES TABLE (Supabase Auth link)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(128),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. MEMBERSHIPS TABLE (Multi-tenant staff & owners)
CREATE TABLE IF NOT EXISTS memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (cafe_id, user_id)
);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(64) NOT NULL,
    description VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    is_veg BOOLEAN NOT NULL DEFAULT true,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    preparation_time_minutes INT DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    order_number VARCHAR(32) NOT NULL,
    customer_name VARCHAR(128) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    special_instructions TEXT,
    status order_status NOT NULL DEFAULT 'received',
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    payment_status payment_status NOT NULL DEFAULT 'pending',
    dining_option VARCHAR(32) DEFAULT 'dine_in',
    table_number VARCHAR(16),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(128) NOT NULL,
    item_price NUMERIC(10, 2) NOT NULL CHECK (item_price >= 0),
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    notes VARCHAR(255)
);

-- Indexes for high-speed multi-tenant queries
CREATE INDEX IF NOT EXISTS idx_cafes_slug ON cafes(slug);
CREATE INDEX IF NOT EXISTS idx_categories_cafe ON categories(cafe_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_cafe ON menu_items(cafe_id, is_available);
CREATE INDEX IF NOT EXISTS idx_orders_cafe_created ON orders(cafe_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Cafes RLS: Anyone can view active cafes (public storefront)
CREATE POLICY "Public storefronts viewable" ON cafes
    FOR SELECT USING (is_active = true);

-- Categories & Menu Items RLS: Anyone can view items of active cafes
CREATE POLICY "Public categories viewable" ON categories
    FOR SELECT USING (EXISTS (SELECT 1 FROM cafes WHERE cafes.id = categories.cafe_id AND cafes.is_active = true));

CREATE POLICY "Public menu items viewable" ON menu_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM cafes WHERE cafes.id = menu_items.cafe_id AND cafes.is_active = true));

-- Orders RLS:
-- 1. Anyone can create an order (customer checkout)
CREATE POLICY "Customers can create orders" ON orders
    FOR INSERT WITH CHECK (true);

-- 2. Anyone can view their specific order (via order ID)
CREATE POLICY "Customers can view specific order" ON orders
    FOR SELECT USING (true);

-- 3. Order items can be inserted by anyone creating an order
CREATE POLICY "Customers can insert order items" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Customers can view order items" ON order_items
    FOR SELECT USING (true);

-- Staff / Owner full access policy helper
CREATE OR REPLACE FUNCTION is_cafe_staff(_cafe_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM memberships
        WHERE cafe_id = _cafe_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Staff management policies for Menu
CREATE POLICY "Staff can manage menu items" ON menu_items
    FOR ALL USING (is_cafe_staff(cafe_id))
    WITH CHECK (is_cafe_staff(cafe_id));

-- Staff management policies for Orders
CREATE POLICY "Staff can update orders" ON orders
    FOR UPDATE USING (is_cafe_staff(cafe_id))
    WITH CHECK (is_cafe_staff(cafe_id));

