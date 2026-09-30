-- ==============================================================================
-- FASHION NAILS MORLEY GALLERIA - NEON POSTGRESQL DATABASE SCHEMA & SEED SCRIPT
-- ==============================================================================
-- Instructions for Neon (https://neon.tech):
-- 1. Open your Neon Console -> Select your Project -> Go to "SQL Editor".
-- 2. Paste the entire content of this file and click "Run".
-- 3. All tables, indexes, and full 28 official salon services will be created & seeded!
-- 4. English-only schema: Drops any legacy _vi columns if present in Neon.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. CLEANUP LEGACY VIETNAMESE COLUMNS (English Only Project)
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS categories DROP COLUMN IF EXISTS name_vi;
ALTER TABLE IF EXISTS categories DROP COLUMN IF EXISTS description_vi;
ALTER TABLE IF EXISTS services DROP COLUMN IF EXISTS name_vi;
ALTER TABLE IF EXISTS services DROP COLUMN IF EXISTS description_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS title_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS category_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS service_name_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS shape_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS duration_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS technique_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS description_vi;
ALTER TABLE IF EXISTS gallery DROP COLUMN IF EXISTS highlights_vi;

-- ------------------------------------------------------------------------------
-- 1. CATEGORIES TABLE (Category management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 2. BOOKINGS TABLE (Customer appointment bookings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT '',
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    message TEXT DEFAULT '',
    voucher VARCHAR(50) DEFAULT '',
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    guests INT DEFAULT 1,
    price NUMERIC(10, 2) DEFAULT 0,
    original_price NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE INDEX IF NOT EXISTS idx_bookings_category ON bookings(category);

-- ------------------------------------------------------------------------------
-- 3. SERVICES TABLE (Salon services & AUD pricing, foreign key to categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    duration INT DEFAULT 45,
    price NUMERIC(10, 2) NOT NULL,
    price_prefix VARCHAR(50) DEFAULT '',
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Services
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_sort_order ON services(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 4. PROMOTIONS TABLE (Promotional banners & pop-ups)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promotions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) DEFAULT '',
    subtitle TEXT DEFAULT '',
    badge VARCHAR(100) DEFAULT '',
    image_url TEXT NOT NULL,
    voucher_code VARCHAR(50) DEFAULT '',
    discount_text VARCHAR(100) DEFAULT '',
    active BOOLEAN DEFAULT true,
    start_date VARCHAR(50) DEFAULT '',
    end_date VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

-- ------------------------------------------------------------------------------
-- 5. GALLERY TABLE (Salon nail design showcase)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(100) PRIMARY KEY,
    src TEXT NOT NULL,
    category_key VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    category_name VARCHAR(100) DEFAULT '',
    category_en VARCHAR(100) DEFAULT '',
    service_id VARCHAR(100) DEFAULT '',
    service_name VARCHAR(255) DEFAULT '',
    service_name_en VARCHAR(255) DEFAULT '',
    shape VARCHAR(100) DEFAULT '',
    shape_en VARCHAR(100) DEFAULT '',
    duration VARCHAR(50) DEFAULT '',
    duration_en VARCHAR(50) DEFAULT '',
    price VARCHAR(50) DEFAULT '$60',
    technique TEXT DEFAULT '',
    technique_en TEXT DEFAULT '',
    description TEXT DEFAULT '',
    description_en TEXT DEFAULT '',
    highlights TEXT DEFAULT '[]',
    highlights_en TEXT DEFAULT '[]',
    active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery(category_key);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery(active);
CREATE INDEX IF NOT EXISTS idx_gallery_sort_order ON gallery(sort_order ASC);

-- ------------------------------------------------------------------------------
-- 6. SCHEDULE LOCKS TABLE (Admin closed dates / blocked time slots)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_locks (
    id SERIAL PRIMARY KEY,
    date VARCHAR(50) NOT NULL,
    slot VARCHAR(50) DEFAULT '',
    reason VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, slot)
);

CREATE INDEX IF NOT EXISTS idx_schedule_locks_date ON schedule_locks(date);

-- ------------------------------------------------------------------------------
-- 7. SCHEDULE CUSTOM SLOTS TABLE (Custom slot additions/removals)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_custom_slots (
    id SERIAL PRIMARY KEY,
    date VARCHAR(50) NOT NULL,
    slot VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL DEFAULT 'add',
    note VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, slot, action)
);

CREATE INDEX IF NOT EXISTS idx_custom_slots_date ON schedule_custom_slots(date);

-- ------------------------------------------------------------------------------
-- 8. SCHEDULE DATE HOURS TABLE (Opening/closing hours per specific date)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schedule_date_hours (
    id SERIAL PRIMARY KEY,
    date VARCHAR(50) UNIQUE NOT NULL,
    open_time VARCHAR(50) NOT NULL,
    close_time VARCHAR(50) NOT NULL,
    is_closed BOOLEAN DEFAULT false,
    note VARCHAR(255) DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_date_hours_date ON schedule_date_hours(date);

-- ------------------------------------------------------------------------------
-- 9. VOUCHERS TABLE (Discount codes and vouchers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vouchers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' | 'fixed'
    discount_value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) DEFAULT 0,
    max_discount NUMERIC(10, 2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    start_date VARCHAR(50) DEFAULT '',
    end_date VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_vouchers_code_upper ON vouchers(UPPER(code));
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_vouchers_end_date ON vouchers(end_date);

-- ==============================================================================
-- SEED INITIAL CATEGORIES DATA
-- ==============================================================================
INSERT INTO categories (id, name, name_en, description, description_en, sort_order, active)
VALUES
('biab', 'Builder Gel - BIAB', 'Builder Gel - BIAB', 'Reinforced BIAB apex overlay and sculpting for natural nails.', 'Reinforced BIAB apex overlay and sculpting for natural nails.', 1, true),
('shellac', 'Shellac Nails', 'Shellac Nails', 'High-gloss long-wear Shellac gel polish, manicure and pedicure care.', 'High-gloss long-wear Shellac gel polish, manicure and pedicure care.', 2, true),
('acrylic', 'Acrylic Nails', 'Acrylic Nails', 'Durable sculpted acrylic extensions, infill and permanent French.', 'Durable sculpted acrylic extensions, infill and permanent French.', 3, true),
('gelx', 'Gel X Extensions', 'Gel X Extensions', '100% soft gel full-cover tip extensions for a natural feel.', '100% soft gel full-cover tip extensions for a natural feel.', 4, true),
('sns', 'SNS Dipping', 'SNS Dipping', 'Vitamin & calcium infused dipping powder, no UV light needed.', 'Vitamin & calcium infused dipping powder, no UV light needed.', 5, true),
('polish', 'Nail Polish', 'Nail Polish', 'Classic manicure, pedicure, spa treatments with regular polish.', 'Classic manicure, pedicure, spa treatments with regular polish.', 6, true),
('extra', 'Extra Services', 'Extra Services', 'Cat eye, chrome mirror, ombre airbrush, repairs and custom art.', 'Cat eye, chrome mirror, ombre airbrush, repairs and custom art.', 7, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    description_en = EXCLUDED.description_en,
    sort_order = EXCLUDED.sort_order;

-- ==============================================================================
-- SEED INITIAL SERVICES DATA (28 Services of Fashion Nails Morley Galleria)
-- ==============================================================================
INSERT INTO services (id, category, name, name_en, description, description_en, duration, price, price_prefix, featured, active, sort_order)
VALUES
-- 1. BUILDER GEL - BIAB
('biab-natural', 'biab', 'Builder Gel - BIAB (Natural nails)', 'Builder Gel - BIAB (Natural nails)', 'Reinforced BIAB apex overlay on natural nails to protect and encourage healthy natural nail growth.', 'Reinforced BIAB apex overlay on natural nails to protect and encourage healthy natural nail growth.', 50, 60.00, '', false, true, 1),
('biab-fullset', 'biab', 'Builder Gel - BIAB (FULL SET)', 'Builder Gel - BIAB (FULL SET)', 'Complete new set of Builder in a Bottle gel sculpting with immaculate architecture and apex detailing.', 'Complete new set of Builder in a Bottle gel sculpting with immaculate architecture and apex detailing.', 70, 80.00, '', true, true, 2),
('biab-refill', 'biab', 'Builder Gel - BIAB (Refill)', 'Builder Gel - BIAB (Refill)', 'Maintenance rebalance, cuticle care, and BIAB gel infill for enduring flawless wear.', 'Maintenance rebalance, cuticle care, and BIAB gel infill for enduring flawless wear.', 55, 65.00, '', false, true, 3),

-- 2. SHELLAC
('shellac-cut-buff-shape', 'shellac', 'Cut buff shape shellac', 'Cut buff shape shellac', 'Essential nail trimming, shaping, buffing, and long-wear Shellac gel polish finish.', 'Essential nail trimming, shaping, buffing, and long-wear Shellac gel polish finish.', 35, 35.00, '', false, true, 4),
('shellac-manicure', 'shellac', 'Manicure shellac', 'Manicure shellac', 'Full manicure cuticle treatment, nail plate preparation, hydrating massage, and durable Shellac gel.', 'Full manicure cuticle treatment, nail plate preparation, hydrating massage, and durable Shellac gel.', 45, 50.00, '', false, true, 5),
('shellac-pedicure', 'shellac', 'Pedicure shellac', 'Pedicure shellac', 'Relaxing foot soak, heel buffing, meticulous toenail grooming, and instant-dry Shellac gel.', 'Relaxing foot soak, heel buffing, meticulous toenail grooming, and instant-dry Shellac gel.', 50, 55.00, '', false, true, 6),
('shellac-mani-pedi', 'shellac', 'Manicure & pedicure shellac combo', 'Manicure & pedicure shellac combo', 'Complete luxury care package for both hands and feet with long-wear Shellac gel polish.', 'Complete luxury care package for both hands and feet with long-wear Shellac gel polish.', 85, 100.00, '', true, true, 7),

-- 3. ACRYLIC NAILS
('acrylic-fullset-shellac', 'acrylic', 'FULL SET acrylic with shellac', 'FULL SET acrylic with shellac', 'Full set acrylic extensions sculpted to your desired length and shape, finished with high-gloss Shellac gel.', 'Full set acrylic extensions sculpted to your desired length and shape, finished with high-gloss Shellac gel.', 65, 70.00, '', false, true, 8),
('acrylic-fullset-toes-shellac', 'acrylic', 'FULL SET Toes with shellac', 'FULL SET Toes with shellac', 'Full set acrylic toe enhancement for uniform, flawless toenails finished with durable Shellac.', 'Full set acrylic toe enhancement for uniform, flawless toenails finished with durable Shellac.', 60, 75.00, '', false, true, 9),
('acrylic-permanent-french', 'acrylic', 'FULL SET Permanent French (white tips)', 'FULL SET Permanent French (white tips)', 'Classic pink and permanent white powder sculpted French tips with enduring elegance.', 'Classic pink and permanent white powder sculpted French tips with enduring elegance.', 65, 65.00, '', false, true, 10),
('acrylic-overlay-shellac', 'acrylic', 'Overlay on natural nails with shellac', 'Overlay on natural nails with shellac', 'Thin strengthening acrylic overlay applied directly over natural nails, completed with Shellac gel.', 'Thin strengthening acrylic overlay applied directly over natural nails, completed with Shellac gel.', 50, 60.00, '', false, true, 11),
('acrylic-refill-shellac', 'acrylic', 'Refill acrylic with shellac', 'Refill acrylic with shellac', 'Acrylic regrowth rebalance and infill, cuticle maintenance, and fresh Shellac gel application.', 'Acrylic regrowth rebalance and infill, cuticle maintenance, and fresh Shellac gel application.', 50, 55.00, '', false, true, 12),

-- 4. GEL X EXTENSIONS
('gelx-natural', 'gelx', 'GEL X EXTENSIONS (Natural nails)', 'GEL X EXTENSIONS (Natural nails)', 'Soft gel full-cover tip extensions crafted with 100% gel for a featherlight, natural feel.', 'Soft gel full-cover tip extensions crafted with 100% gel for a featherlight, natural feel.', 65, 80.00, '', true, true, 13),
('gelx-refill', 'gelx', 'GEL X EXTENSIONS (Refill)', 'GEL X EXTENSIONS (Refill)', 'Maintenance rebalance and infill for Gel X extensions with cuticle care.', 'Maintenance rebalance and infill for Gel X extensions with cuticle care.', 55, 70.00, '', false, true, 14),

-- 5. SNS (DIPPING POWDER)
('sns-natural', 'sns', 'SNS on natural nails', 'SNS on natural nails', 'Nutrient-rich dipping powder fortified with vitamins and calcium on natural nails. No UV light required.', 'Nutrient-rich dipping powder fortified with vitamins and calcium on natural nails. No UV light required.', 45, 55.00, '', false, true, 15),
('sns-fullset', 'sns', 'FULL SET SNS', 'FULL SET SNS', 'Full set extensions with organic SNS dipping powder for durable, lightweight, long-lasting beauty.', 'Full set extensions with organic SNS dipping powder for durable, lightweight, long-lasting beauty.', 60, 70.00, '', false, true, 16),

-- 6. NAIL POLISH
('polish-cut-buff-shape', 'polish', 'Cut buff shape nail polish', 'Cut buff shape nail polish', 'Basic quick grooming: nail trimming, shaping, buffing, and traditional nail polish.', 'Basic quick grooming: nail trimming, shaping, buffing, and traditional nail polish.', 25, 25.00, '', false, true, 17),
('polish-manicure', 'polish', 'Manicure with nail polish', 'Manicure with nail polish', 'Traditional full manicure with cuticle treatment, hand massage, and professional lacquer.', 'Traditional full manicure with cuticle treatment, hand massage, and professional lacquer.', 35, 40.00, '', false, true, 18),
('polish-pedicure', 'polish', 'Pedicure with nail polish', 'Pedicure with nail polish', 'Warm foot bath, exfoliating scrub, toenail detailing, and classic polish.', 'Warm foot bath, exfoliating scrub, toenail detailing, and classic polish.', 45, 45.00, '', false, true, 19),
('polish-spa-mani-pedi', 'polish', 'Spa pedicure & manicure with nail polish', 'Spa pedicure & manicure with nail polish', 'Comprehensive relaxing spa session for hands and feet with invigorating scrub and classic polish.', 'Comprehensive relaxing spa session for hands and feet with invigorating scrub and classic polish.', 75, 80.00, '', false, true, 20),

-- 7. EXTRA SERVICES
('extra-cat-eyes', 'extra', 'Cat eyes gel effect', 'Cat eyes gel effect', 'Magnetic cat-eye gel shimmer reflecting velvety depth and light movement.', 'Magnetic cat-eye gel shimmer reflecting velvety depth and light movement.', 20, 20.00, '', false, true, 21),
('extra-chrome-colours', 'extra', 'Chrome colours (Glazed / Mirror finish)', 'Chrome colours (Glazed / Mirror finish)', 'High-fashion chrome glazed donut or metallic mirror finish over your gel base.', 'High-fashion chrome glazed donut or metallic mirror finish over your gel base.', 20, 20.00, '', false, true, 22),
('extra-airbrush-ombre', 'extra', 'Air brush ombre', 'Air brush ombre', 'Flawlessly blended airbrushed gradient ombre transition across the nails.', 'Flawlessly blended airbrushed gradient ombre transition across the nails.', 25, 25.00, '', false, true, 23),
('extra-take-off-strengthen', 'extra', 'Take off & shape strengthen', 'Take off & shape strengthen', 'Gentle professional removal of acrylic/gel, nail re-shaping, and strengthening treatment.', 'Gentle professional removal of acrylic/gel, nail re-shaping, and strengthening treatment.', 30, 25.00, '', false, true, 24),
('extra-single-repair', 'extra', 'Single nails repair', 'Single nails repair', 'Fast repair or re-sculpting for an individual damaged or chipped nail.', 'Fast repair or re-sculpting for an individual damaged or chipped nail.', 15, 10.00, '', false, true, 25),
('extra-french-hand', 'extra', 'French style by hand', 'French style by hand', 'Artisan hand-painted French smile lines customized to your nail length and curvature.', 'Artisan hand-painted French smile lines customized to your nail length and curvature.', 25, 20.00, 'From ', false, true, 26),
('extra-nail-art-design', 'extra', 'Nail art & bespoke design', 'Nail art & bespoke design', 'Bespoke custom nail art, marble textures, Swarovski crystals, foils, or trend designs.', 'Bespoke custom nail art, marble textures, Swarovski crystals, foils, or trend designs.', 35, 25.00, 'From ', false, true, 27),
('extra-express-manicure', 'extra', 'Express manicure (Add-on)', 'Express manicure (Add-on)', 'Quick cuticle tidy and clean-up add-on service alongside any enhancement.', 'Quick cuticle tidy and clean-up add-on service alongside any enhancement.', 15, 15.00, 'Extra ', false, true, 28)
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    name_en = EXCLUDED.name_en,
    description = EXCLUDED.description,
    description_en = EXCLUDED.description_en,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price,
    price_prefix = EXCLUDED.price_prefix,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- Seed default vouchers
INSERT INTO vouchers (code, name, discount_type, discount_value, min_spend, max_discount, usage_limit, used_count, start_date, end_date, is_active)
VALUES
('WELCOME10', 'Welcome 10% Off for New Clients', 'percentage', 10, 30, 20, 100, 8, '2026-09-01', '2026-12-31', true),
('FASHION5', '$5 Off Any Nail Service from $40', 'fixed', 5, 40, 5, 50, 14, '2026-09-01', '2026-12-31', true),
('VIP20', 'VIP Loyalty Appreciation 20% Off', 'percentage', 20, 50, 35, 30, 5, '2026-09-15', '2026-11-30', true)
ON CONFLICT (code) DO NOTHING;
