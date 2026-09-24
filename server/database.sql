-- ==============================================================================
-- FASHION NAILS MORLEY GALLERIA - NEON POSTGRESQL DATABASE SCHEMA & SEED SCRIPT
-- ==============================================================================
-- Instructions for Neon (https://neon.tech):
-- 1. Open your Neon Console -> Select your Project -> Go to "SQL Editor".
-- 2. Paste the entire content of this file and click "Run".
-- 3. All tables, indexes, and full 28 official salon services will be created & seeded!
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BOOKINGS TABLE (Lưu thông tin lịch hẹn khách hàng)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL,
    message TEXT DEFAULT '',
    voucher VARCHAR(50) DEFAULT '',
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);

-- ------------------------------------------------------------------------------
-- 2. SERVICES TABLE (Quản lý dịch vụ & Giá tiền AUD)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id VARCHAR(100) PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    name_vi VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description_vi TEXT DEFAULT '',
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
-- 3. PROMOTIONS TABLE (Hình ảnh Pop-up Giảm giá / Dịp lễ do Admin Upload)
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

-- Performance Index for Active Promotion
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(active);

-- ==============================================================================
-- 4. SEED INITIAL SERVICES DATA (28 Dịch vụ chuẩn của Fashion Nails Morley Galleria)
-- ==============================================================================
INSERT INTO services (id, category, name_vi, name_en, description_vi, description_en, duration, price, price_prefix, featured, active, sort_order)
VALUES
-- 1. BUILDER GEL - BIAB
('biab-natural', 'biab', 'Builder Gel - BIAB trên móng thật (Natural nails)', 'Builder Gel - BIAB (Natural nails)', 'Tạo vòm móng dẻo dai và gia cố móng tự nhiên với lớp gel tăng cường BIAB cao cấp, chống gãy nứt.', 'Reinforced BIAB apex overlay on natural nails to protect and encourage healthy natural nail growth.', 50, 60.00, '', false, true, 1),
('biab-fullset', 'biab', 'FULL SET Builder Gel - BIAB', 'Builder Gel - BIAB (FULL SET)', 'Đắp mới toàn bộ bộ móng với gel tăng cường BIAB định hình hoàn hảo, chuẩn phom thẩm mỹ cao.', 'Complete new set of Builder in a Bottle gel sculpting with immaculate architecture and apex detailing.', 70, 80.00, '', true, true, 2),
('biab-refill', 'biab', 'Dặm Refill Builder Gel - BIAB', 'Builder Gel - BIAB (Refill)', 'Chăm sóc da chân móng, làm mịn và dặm lại lớp gel BIAB sau 3-4 tuần phát triển.', 'Maintenance rebalance, cuticle care, and BIAB gel infill for enduring flawless wear.', 55, 65.00, '', false, true, 3),

-- 2. SHELLAC
('shellac-cut-buff-shape', 'shellac', 'Cắt da, dũa phom & Sơn Shellac (Cut buff shape shellac)', 'Cut buff shape shellac', 'Chăm sóc nhanh: cắt tỉa gọn gàng, dũa tạo phom móng thanh lịch và sơn gel Shellac bền màu.', 'Essential nail trimming, shaping, buffing, and long-wear Shellac gel polish finish.', 35, 35.00, '', false, true, 4),
('shellac-manicure', 'shellac', 'Chăm sóc móng tay & Sơn Shellac (Manicure shellac)', 'Manicure shellac', 'Làm sạch da tay chuyên sâu, dưỡng ẩm biểu bì và sơn gel Shellac sáng bóng, bền màu hơn 3 tuần.', 'Full manicure cuticle treatment, nail plate preparation, hydrating massage, and durable Shellac gel.', 45, 50.00, '', false, true, 5),
('shellac-pedicure', 'shellac', 'Chăm sóc móng chân & Sơn Shellac (Pedicure shellac)', 'Pedicure shellac', 'Ngâm chân thư giãn, chà gót chân, cắt tỉa da móng chân và sơn gel Shellac khô tức thì.', 'Relaxing foot soak, heel buffing, meticulous toenail grooming, and instant-dry Shellac gel.', 50, 55.00, '', false, true, 6),
('shellac-mani-pedi', 'shellac', 'Gói Trọn Bộ Tay & Chân Shellac (Manicure & pedicure shellac)', 'Manicure & pedicure shellac combo', 'Trải nghiệm chăm sóc toàn diện cả tay và chân cùng sơn Shellac cao cấp, tiết kiệm thời gian và chi phí.', 'Complete luxury care package for both hands and feet with long-wear Shellac gel polish.', 85, 100.00, '', true, true, 7),

-- 3. ACRYLIC NAILS
('acrylic-fullset-shellac', 'acrylic', 'FULL SET móng bột Acrylic kèm sơn Shellac', 'FULL SET acrylic with shellac', 'Nối móng đắp bột Acrylic tạo độ dài và phom dáng chuẩn, phủ sơn gel Shellac bóng mượt.', 'Full set acrylic extensions sculpted to your desired length and shape, finished with high-gloss Shellac gel.', 65, 70.00, '', false, true, 8),
('acrylic-fullset-toes-shellac', 'acrylic', 'FULL SET móng chân Acrylic kèm sơn Shellac', 'FULL SET Toes with shellac', 'Đắp bột chỉnh dáng móng chân thẩm mỹ đều đẹp, phủ sơn gel Shellac chống bong tróc.', 'Full set acrylic toe enhancement for uniform, flawless toenails finished with durable Shellac.', 60, 75.00, '', false, true, 9),
('acrylic-permanent-french', 'acrylic', 'FULL SET Permanent French (Đầu móng trắng vĩnh viễn)', 'FULL SET Permanent French (white tips)', 'Kỹ thuật đắp bột hồng trắng vĩnh viễn tạo đầu móng French cổ điển sang trọng, không lo phai màu.', 'Classic pink and permanent white powder sculpted French tips with enduring elegance.', 65, 65.00, '', false, true, 10),
('acrylic-overlay-shellac', 'acrylic', 'Đắp bột trên móng thật kèm sơn Shellac (Overlay natural nails)', 'Overlay on natural nails with shellac', 'Phủ lớp bột Acrylic gia cố trực tiếp trên móng tự nhiên, bảo vệ móng yếu và phủ sơn Shellac.', 'Thin strengthening acrylic overlay applied directly over natural nails, completed with Shellac gel.', 50, 60.00, '', false, true, 11),
('acrylic-refill-shellac', 'acrylic', 'Dặm bột Acrylic kèm sơn Shellac (Refill acrylic)', 'Refill acrylic with shellac', 'Dặm lại phần chân móng bột mọc ra, chỉnh lại phom dáng và thay màu sơn Shellac mới.', 'Acrylic regrowth rebalance and infill, cuticle maintenance, and fresh Shellac gel application.', 50, 55.00, '', false, true, 12),

-- 4. GEL X EXTENSIONS
('gelx-natural', 'gelx', 'Nối móng Gel X cao cấp (Gel X on Natural nails)', 'GEL X EXTENSIONS (Natural nails)', 'Công nghệ nối móng mềm 100% gel không hoá chất nặng, nhẹ tự nhiên và ôm khít form móng thật.', 'Soft gel full-cover tip extensions crafted with 100% gel for a featherlight, natural feel.', 65, 80.00, '', true, true, 13),
('gelx-refill', 'gelx', 'Dặm Refill móng Gel X', 'GEL X EXTENSIONS (Refill)', 'Bảo dưỡng chân móng mọc dài và phục hồi kết cấu gel mềm Gel X sau 3-4 tuần.', 'Maintenance rebalance and infill for Gel X extensions with cuticle care.', 55, 70.00, '', false, true, 14),

-- 5. SNS (DIPPING POWDER)
('sns-natural', 'sns', 'Nhúng bột SNS trên móng thật (SNS on natural nails)', 'SNS on natural nails', 'Công nghệ nhúng bột giàu vitamin E và Canxi bảo vệ móng thật, không cần sấy đèn UV.', 'Nutrient-rich dipping powder fortified with vitamins and calcium on natural nails. No UV light required.', 45, 55.00, '', false, true, 15),
('sns-fullset', 'sns', 'FULL SET Nhúng bột SNS nối móng', 'FULL SET SNS', 'Nối dài móng và nhúng bột SNS sắc nét, nhẹ móng và độ bền ấn tượng hơn 3 tuần.', 'Full set extensions with organic SNS dipping powder for durable, lightweight, long-lasting beauty.', 60, 70.00, '', false, true, 16),

-- 6. NAIL POLISH
('polish-cut-buff-shape', 'polish', 'Cắt da, dũa phom & Sơn thường (Cut buff shape nail polish)', 'Cut buff shape nail polish', 'Chăm sóc cơ bản nhanh gọn: tỉa da, dũa phom và sơn nước bóng mịn.', 'Basic quick grooming: nail trimming, shaping, buffing, and traditional nail polish.', 25, 25.00, '', false, true, 17),
('polish-manicure', 'polish', 'Chăm sóc móng tay & Sơn thường (Manicure with nail polish)', 'Manicure with nail polish', 'Làm sạch da tay kỹ lưỡng, massage dưỡng ẩm nhẹ nhàng và hoàn thiện với sơn thường cao cấp.', 'Traditional full manicure with cuticle treatment, hand massage, and professional lacquer.', 35, 40.00, '', false, true, 18),
('polish-pedicure', 'polish', 'Chăm sóc móng chân & Sơn thường (Pedicure with nail polish)', 'Pedicure with nail polish', 'Ngâm chân nước ấm thảo mộc, chà tẩy da chết gót chân và sơn móng chân bóng đẹp.', 'Warm foot bath, exfoliating scrub, toenail detailing, and classic polish.', 45, 45.00, '', false, true, 19),
('polish-spa-mani-pedi', 'polish', 'Spa trọn gói tay & chân kèm sơn thường', 'Spa pedicure & manicure with nail polish', 'Gói spa thư giãn toàn diện cho cả bàn tay và bàn chân, tẩy tế bào chết sâu và sơn thường.', 'Comprehensive relaxing spa session for hands and feet with invigorating scrub and classic polish.', 75, 80.00, '', false, true, 20),

-- 7. EXTRA SERVICES
('extra-cat-eyes', 'extra', 'Hiệu ứng Mắt Mèo (Cat eyes)', 'Cat eyes gel effect', 'Sơn gel từ tính tạo dải ánh sáng lấp lánh như ngọc mắt mèo huyền bí.', 'Magnetic cat-eye gel shimmer reflecting velvety depth and light movement.', 20, 20.00, '', false, true, 21),
('extra-chrome-colours', 'extra', 'Phủ bột Chrome tráng gương (Chrome colours)', 'Chrome colours (Glazed / Mirror finish)', 'Lớp bột chrome tráng gương bóng loáng xu hướng ngọc trai hoặc ánh kim sang trọng.', 'High-fashion chrome glazed donut or metallic mirror finish over your gel base.', 20, 20.00, '', false, true, 22),
('extra-airbrush-ombre', 'extra', 'Phun màu chuyển sắc Ombre (Air brush ombre)', 'Air brush ombre', 'Công nghệ phun màu airbrush siêu mịn mượt tạo hiệu ứng loang màu ombre tinh tế.', 'Flawlessly blended airbrushed gradient ombre transition across the nails.', 25, 25.00, '', false, true, 23),
('extra-take-off-strengthen', 'extra', 'Tháo móng & Dưỡng chắc móng (Take off & shape strengthen)', 'Take off & shape strengthen', 'Tháo bỏ móng bột/gel an toàn không tổn hại móng, dũa phom và thoa tinh chất dưỡng móng chắc khoẻ.', 'Gentle professional removal of acrylic/gel, nail re-shaping, and strengthening treatment.', 30, 25.00, '', false, true, 24),
('extra-single-repair', 'extra', 'Sửa lẻ 1 ngón móng (Single nails repair)', 'Single nails repair', 'Phục hồi hoặc đắp lại nhanh 1 ngón móng bị nứt gãy ngoài ý muốn.', 'Fast repair or re-sculpting for an individual damaged or chipped nail.', 15, 10.00, '', false, true, 25),
('extra-french-hand', 'extra', 'Vẽ đầu móng French thủ công (French style by hand)', 'French style by hand', 'Đường viền nụ cười French vẽ tay thủ công chuẩn xác, thanh thoát và tao nhã.', 'Artisan hand-painted French smile lines customized to your nail length and curvature.', 25, 20.00, 'From ', false, true, 26),
('extra-nail-art-design', 'extra', 'Vẽ móng nghệ thuật & Thiết kế riêng (Nail art & design)', 'Nail art & bespoke design', 'Thiết kế hoạ tiết theo mẫu yêu cầu: đính đá, vân đá marble, nhũ kim tuyến, họa tiết thời thượng.', 'Bespoke custom nail art, marble textures, Swarovski crystals, foils, or trend designs.', 35, 25.00, 'From ', false, true, 27),
('extra-express-manicure', 'extra', 'Cắt da nhanh kèm theo (Express manicure add-on)', 'Express manicure (Add-on)', 'Gói bổ sung cắt tỉa biểu bì gọn gàng nhanh chóng khi làm cùng các dịch vụ khác.', 'Quick cuticle tidy and clean-up add-on service alongside any enhancement.', 15, 15.00, 'Extra ', false, true, 28)
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    name_vi = EXCLUDED.name_vi,
    name_en = EXCLUDED.name_en,
    description_vi = EXCLUDED.description_vi,
    description_en = EXCLUDED.description_en,
    duration = EXCLUDED.duration,
    price = EXCLUDED.price,
    price_prefix = EXCLUDED.price_prefix,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = CURRENT_TIMESTAMP;

-- ==============================================================================
-- Hoàn tất khởi tạo Neon PostgreSQL Database!
-- ==============================================================================
