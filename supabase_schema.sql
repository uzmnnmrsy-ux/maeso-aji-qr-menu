-- ==============================================================================
-- SKEMA SUPABASE UNTUK RESTO MAESO AJI BAROKAH (STATIC CLIENT-SIDE SPA)
-- Jalankan skrip ini di: Supabase Dashboard > SQL Editor > New Query > Run
-- ==============================================================================

-- 1. TABEL INFORMASI RESTORAN
CREATE TABLE IF NOT EXISTS restaurant_info (
  id TEXT PRIMARY KEY DEFAULT 'main',
  name TEXT NOT NULL,
  tagline TEXT,
  address TEXT,
  phone TEXT,
  hours TEXT,
  instagram TEXT,
  facebook TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL KATEGORI MENU
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL ITEM MENU
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  spice_level INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  variants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pastikan kolom variants tersedia jika tabel sudah ada sebelumnya
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- 4. BUCKET SUPABASE STORAGE UNTUK FOTO MENU ("menu-photos")
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-photos', 'menu-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- ==============================================================================
-- AKTIFKAN ROW LEVEL SECURITY (RLS)
-- ==============================================================================
ALTER TABLE restaurant_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES UNTUK RESTAURANT_INFO
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view restaurant info" ON restaurant_info;
DROP POLICY IF EXISTS "Authenticated can manage restaurant info" ON restaurant_info;

-- Publik (anon/tamu) boleh melihat info restoran
CREATE POLICY "Public can view restaurant info"
ON restaurant_info FOR SELECT
TO public
USING (true);

-- Hanya kasir (user login terautentikasi) yang boleh mengubah data restoran
CREATE POLICY "Authenticated can manage restaurant info"
ON restaurant_info FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- RLS POLICIES UNTUK CATEGORIES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Authenticated can manage categories" ON categories;

-- Publik boleh melihat kategori menu
CREATE POLICY "Public can view categories"
ON categories FOR SELECT
TO public
USING (true);

-- Hanya kasir yang boleh menambah/mengubah/menghapus kategori
CREATE POLICY "Authenticated can manage categories"
ON categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- RLS POLICIES UNTUK MENU_ITEMS
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Authenticated can manage menu items" ON menu_items;

-- Publik boleh melihat semua item menu (status habis/tersedia ditampilkan di UI)
CREATE POLICY "Public can view menu items"
ON menu_items FOR SELECT
TO public
USING (true);

-- Hanya kasir yang boleh menambah, mengubah (termasuk toggle stok), dan menghapus menu
CREATE POLICY "Authenticated can manage menu items"
ON menu_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- RLS POLICIES UNTUK SUPABASE STORAGE ("menu-photos")
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view menu photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload menu photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update menu photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete menu photos" ON storage.objects;

-- Publik boleh melihat foto menu di bucket menu-photos
CREATE POLICY "Public can view menu photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-photos');

-- Hanya user login (kasir) yang boleh upload foto
CREATE POLICY "Authenticated can upload menu photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-photos');

-- Hanya user login (kasir) yang boleh memperbarui foto
CREATE POLICY "Authenticated can update menu photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-photos');

-- Hanya user login (kasir) yang boleh menghapus foto
CREATE POLICY "Authenticated can delete menu photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-photos');

-- ==============================================================================
-- DATA AWAL RESTORAN (OPSIONAL / DEFAULT INITIAL SEED)
-- ==============================================================================
INSERT INTO restaurant_info (id, name, tagline, address, phone, hours, instagram, facebook)
VALUES (
  'main',
  'Resto Maeso Aji Barokah',
  'Warung Olahan Sop, Asem-Asem, Nasi Gandul, Rawon & Aneka Bakaran Khas Pati',
  'Gedong, Kedumulyo, Kec. Sukolilo, Kabupaten Pati, Jawa Tengah 59172',
  '082143800818',
  '08.00 - 21.00 WIB (Buka Setiap Hari)',
  '@maeso_ajiresto',
  'Resto Maeso Aji Barokah'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  hours = EXCLUDED.hours,
  instagram = EXCLUDED.instagram,
  facebook = EXCLUDED.facebook;
