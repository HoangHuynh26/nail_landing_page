/**
 * FASHION NAILS MORLEY GALLERIA - FREQUENTLY ASKED QUESTIONS (FAQ)
 * Danh sách câu hỏi thường gặp được khảo sát thực tế từ các tiệm nail chuyên nghiệp tại Úc (Western Australia)
 */

export const FAQ_CATEGORIES = [
  { id: 'all', labelVi: 'Tất cả câu hỏi', labelEn: 'All Questions' },
  { id: 'services', labelVi: 'Dịch vụ & Kỹ thuật Móng', labelEn: 'Nails & Art Treatments' },
  { id: 'hygiene', labelVi: 'Vệ sinh & An toàn', labelEn: 'Hygiene & Safety' },
  { id: 'booking', labelVi: 'Đặt lịch & Tiện ích tiệm', labelEn: 'Bookings & Galleria Visit' }
];

export const FAQ_ITEMS = [
  // --- 1. DỊCH VỤ & KỸ THUẬT MÓNG ---
  {
    id: 'diff-biab-gelx-acrylic',
    category: 'services',
    tagVi: 'Công nghệ móng',
    tagEn: 'Nail Systems',
    qVi: 'Sự khác biệt giữa BIAB, Gel X, Shellac và Acrylic là gì? Tôi nên chọn loại nào?',
    qEn: 'What is the difference between BIAB, Gel X, Shellac, and Acrylic? Which should I choose?',
    aVi: 'Mỗi phương pháp đều có ưu điểm riêng phù hợp với nhu cầu của bạn:\n• BIAB (Builder in a Bottle): Dòng gel tăng cường dẻo dai đắp trực tiếp trên móng tự nhiên, giúp nuôi móng dài và phục hồi móng yếu, giòn hoặc mỏng.\n• Gel X: Móng úp full-cover làm từ 100% soft-gel mềm nhẹ, nối dài tức thì mà không gây cảm giác nặng nề hay bí móng.\n• Acrylic: Bột đắp móng truyền thống cứng cáp và chịu lực tốt nhất, lý tưởng cho móng dài hoặc các dáng sắc sảo như Coffin, Stiletto.\n• Shellac / Gel Polish: Sơn gel bóng gương trên móng thật, sấy khô ngay dưới đèn LED, bền đẹp từ 2–3 tuần.',
    aEn: 'Each system caters to different nail goals and lifestyles:\n• BIAB (Builder in a Bottle): A flexible strengthening gel applied directly over natural nails to support healthy growth and prevent snapping.\n• Gel X: Full-cover tips crafted from 100% soft gel, offering lightweight, natural-feeling extensions without nail trauma.\n• Acrylic: Traditional powder enhancement delivering maximum structural strength, ideal for extra length and sharp shapes (Coffin, Stiletto).\n• Shellac / Gel Polish: High-gloss color over natural nails that cures instantly under LED and lasts 2–3 weeks chip-free.'
  },
  {
    id: 'longevity-and-infill',
    category: 'services',
    tagVi: 'Độ bền & Dặm móng',
    tagEn: 'Longevity & Infills',
    qVi: 'Móng BIAB hoặc Acrylic giữ được bao lâu và khi nào tôi nên đi Infill (dặm lại)?',
    qEn: 'How long do BIAB and Acrylic sets last, and when should I get an infill?',
    aVi: 'Một bộ móng chuẩn tại Fashion Nails thường giữ độ bền đẹp từ 3 đến 4 tuần. Tuy nhiên, theo tiêu chuẩn an toàn tại Úc, bạn nên đặt lịch Infill (dặm lại chân móng) sau mỗi 2 đến 3 tuần. Việc dặm lại kịp thời giúp cân bằng lại trọng tâm chịu lực khi móng thật mọc dài ra, ngăn ngừa tình trạng hở chân móng (lifting), đọng ẩm và gãy gập tổn thương móng.',
    aEn: 'A full set typically lasts 3 to 4 weeks with proper aftercare. We recommend booking an infill every 2 to 3 weeks. Regular infills rebalance the nail apex and structure as your natural nails grow, preventing lifting, moisture buildup, or painful breaks.'
  },
  {
    id: 'soak-off-removal',
    category: 'services',
    tagVi: 'Tháo móng an toàn',
    tagEn: 'Gentle Removal',
    qVi: 'Tiệm có nhận tháo móng cũ (Soak-off / Removal) làm từ tiệm khác không?',
    qEn: 'Do you remove nails done at another salon (SNS, Acrylic, BIAB)?',
    aVi: 'Có! Chúng tôi nhận tháo an toàn mọi loại móng cũ từ các tiệm khác bao gồm Acrylic, SNS Dip Powder, Gel X và BIAB. Kỹ thuật viên sẽ ủ dung dịch chuyên dụng và nhẹ nhàng làm sạch, sau đó tạo phom và thoa tinh dầu dưỡng cuticle. Tiệm cam kết không cạy bóc thô bạo hay dùng đầu mài sâu làm mỏng móng thật của bạn.',
    aEn: 'Yes! We safely remove previous sets done elsewhere, including Acrylic, SNS dipping powder, Gel X, and BIAB. We use gentle foil-soak techniques and nourishing cuticle conditioning—never aggressively prying or over-drilling into your natural nail plate.'
  },
  {
    id: 'inspo-nail-art',
    category: 'services',
    tagVi: 'Vẽ móng nghệ thuật',
    tagEn: 'Custom Nail Art',
    qVi: 'Tôi có thể mang ảnh mẫu (Inspo picture / Pinterest / Instagram) đến để thợ vẽ theo không?',
    qEn: 'Can I bring an inspo picture from Instagram or Pinterest? How is nail art priced?',
    aVi: 'Hoàn toàn được và chúng tôi rất khuyến khích bạn mang theo ảnh mẫu yêu thích! Đội ngũ nghệ nhân tại Fashion Nails thành thạo các kỹ thuật hot nhất: Tráng gương Chrome lỏng giọt nước, Phun Ombré Airbrush, Vẽ nổi gel 3D, Mắt mèo Cat Eye, Đính pha lê Swarovski và French đầu móng tinh tế. Bạn chỉ cần đưa ảnh, thợ sẽ tư vấn và báo giá minh bạch trước khi làm.',
    aEn: 'Absolutely! We love recreating your dream inspo looks. Our skilled technicians specialize in molten chrome, 3D gel sculpting, airbrush ombré, Swarovski crystal placement, and Korean/Japanese minimal designs. Feel free to show us your photos for an upfront, transparent consultation before we begin.'
  },
  {
    id: 'service-duration',
    category: 'services',
    tagVi: 'Thời gian thực hiện',
    tagEn: 'Duration',
    qVi: 'Thời gian làm một bộ móng hoặc dịch vụ Spa Pedicure mất bao lâu?',
    qEn: 'How long does each nail service or spa pedicure take?',
    aVi: 'Thời gian ước tính cho từng dịch vụ:\n• Sơn Gel / Shellac: khoảng 30 – 45 phút.\n• BIAB Natural Nails hoặc Infill: khoảng 45 – 60 phút.\n• Đắp bộ mới Full Set Acrylic / Gel X: khoảng 60 – 75 phút.\n• Deluxe Spa Pedicure (ngâm chân khoáng, tẩy da chết, chà gót & massage): khoảng 45 – 50 phút.\n• Combo Làm cả Tay & Chân: khoảng 75 – 90 phút (có thể làm đồng thời khi có 2 thợ sẵn sàng).',
    aEn: 'Estimated times for popular services:\n• Shellac / Gel Polish: 30–45 mins.\n• BIAB Overlay or Infill: 45–60 mins.\n• Full Set Acrylic / Gel X: 60–75 mins.\n• Signature Deluxe Spa Pedicure: 45–50 mins.\n• Mani & Pedi Combos: 75–90 mins (can be done simultaneously with two nail technicians during off-peak times).'
  },

  // --- 2. VỆ SINH, AN TOÀN & BẢO HÀNH ---
  {
    id: 'sterilisation-autoclave',
    category: 'hygiene',
    tagVi: 'Chuẩn y tế Autoclave',
    tagEn: 'Medical Autoclave',
    qVi: 'Dụng cụ làm móng tại tiệm có được khử trùng đúng chuẩn y tế Úc không?',
    qEn: 'How are nail tools sterilised? What hygiene standards do you follow?',
    aVi: 'Vệ sinh an toàn là ưu tiên số 1 tại Fashion Nails. Tiệm tuân thủ nghiêm ngặt quy định phòng chống lây nhiễm của Bộ Y Tế bang Tây Úc (WA Health Guidelines). Mọi kìm cắt da và dụng cụ kim loại được tiệt trùng qua nồi hấp áp suất nhiệt cao (Hospital-grade Autoclave) và niêm phong trong bao tiệt trùng y tế, chỉ xé bao ngay trước mặt khách. Cây dũa, que đệm và đệm chà chân đều là loại dùng 1 lần (Single-use disposable).',
    aEn: 'Hygiene is our highest commitment. We strictly adhere to WA Health Infection Prevention Guidelines. All metal nippers and pushers undergo medical-grade autoclave heat and steam sterilization in individual pouches opened right before your eyes. Files, buffers, and foot sanding pads are 100% single-use disposable.'
  },
  {
    id: 'pregnancy-safety',
    category: 'hygiene',
    tagVi: 'An toàn cho mẹ bầu',
    tagEn: 'Pregnancy Safe',
    qVi: 'Phụ nữ mang thai hoặc cho con bú có thể làm móng và Spa Pedicure an toàn không?',
    qEn: 'Is it safe to get nails done or enjoy a pedicure during pregnancy?',
    aVi: 'Rất an toàn! Tiệm tại Morley Galleria được trang bị hệ thống hút lọc khí hiện đại chuẩn Úc giúp không gian luôn thông thoáng, không bị nồng mùi hóa chất. Các dòng sơn và gel sử dụng đều thuộc thương hiệu uy tín, không chứa hóa chất độc hại (10-Free/Cruelty-free). Dịch vụ ngâm chân thảo dược nước ấm và massage nhẹ nhàng còn giúp giảm phù nề và mệt mỏi cho các mẹ bầu.',
    aEn: 'Yes, completely safe! Our salon features advanced commercial air filtration and ventilation, eliminating heavy fumes. We use non-toxic, reputable products and gentle organic foot scrubs. Our relaxing spa pedicure with warm foot soak and gentle massage is a beloved treat for expectant mothers experiencing leg fatigue.'
  },
  {
    id: 'warranty-repair-policy',
    category: 'hygiene',
    tagVi: 'Bảo hành 5 ngày',
    tagEn: '5-Day Guarantee',
    qVi: 'Chính sách bảo hành móng: Nếu móng bị mẻ (chip) hoặc hở chân sau khi làm thì sao?',
    qEn: 'What is your repair policy if a nail chips or breaks after my visit?',
    aVi: 'Chúng tôi có chính sách bảo hành 5 ngày miễn phí cho tất cả dịch vụ BIAB, Gel X và Acrylic. Nếu móng gặp sự cố mẻ sơn, nứt gãy hoặc hở chân móng trong điều kiện sinh hoạt thông thường trong vòng 5 ngày kể từ ngày làm, quý khách chỉ cần liên hệ hoặc ghé lại tiệm để thợ chỉnh sửa lại hoàn toàn miễn phí.',
    aEn: 'We offer a complimentary 5-day guarantee on all BIAB, Gel X, and Acrylic services. If you experience unexpected chipping, premature lifting, or a crack under normal wear within 5 days of your appointment, simply drop in or call us, and we will fix it free of charge.'
  },

  // --- 3. ĐẶT LỊCH, GIÁ CẢ & TIỆN ÍCH ---
  {
    id: 'walkins-welcome',
    category: 'booking',
    tagVi: 'Nhận khách vãng lai',
    tagEn: 'Walk-ins Welcome',
    qVi: 'Tiệm có nhận khách vãng lai (Walk-ins) không hay bắt buộc phải đặt trước?',
    qEn: 'Do you accept walk-in clients, or do I need to book in advance?',
    aVi: 'Chúng tôi luôn chào đón khách vãng lai (Walk-ins) ghé tiệm bất kỳ lúc nào! Tuy nhiên, vào các khung giờ cao điểm (thứ Năm mua sắm muộn và các ngày cuối tuần), lượng khách đến Galleria rất đông. Để đảm bảo không phải chờ đợi và có thợ yêu thích phục vụ ngay, bạn nên đặt lịch hẹn trực tuyến nhanh chóng qua website trước khi đến.',
    aEn: 'Walk-ins are always warmly welcomed! However, during peak shopping times (Thursday late-night shopping, Saturdays, and Sundays), we recommend booking in advance through our website to guarantee your preferred technician and zero wait time.'
  },
  {
    id: 'ten-percent-discount',
    category: 'booking',
    tagVi: 'Ưu đãi giảm 10%',
    tagEn: '10% Discount',
    qVi: 'Làm thế nào để nhận ưu đãi giảm giá 10% tại tiệm?',
    qEn: 'How do I claim the 10% special discount?',
    aVi: 'Rất dễ dàng! Bạn chỉ cần xuất trình thẻ Học sinh / Sinh viên (Student ID), thẻ Người cao tuổi (Seniors Card) hoặc thẻ nhân viên làm việc tại Morley Galleria khi thanh toán tại quầy thu ngân để được giảm ngay 10% trên tổng hóa đơn dịch vụ.',
    aEn: 'Simply present a valid Australian Student ID, Seniors Card, or Morley Galleria Staff pass to our receptionist upon checkout to receive an instant 10% discount off your total service bill.'
  },
  {
    id: 'location-and-parking',
    category: 'booking',
    tagVi: 'Vị trí & Đậu xe miễn phí',
    tagEn: 'Location & Free Parking',
    qVi: 'Tiệm nằm ở vị trí nào trong Morley Galleria và có chỗ đậu xe miễn phí không?',
    qEn: 'Where are you located in Morley Galleria, and is parking free?',
    aVi: 'Tiệm toạ lạc tại Gian hàng SP094 (ngay đối diện Kmart, gần lối vào góc đường Collier Rd & Walter Rd West). Trung tâm thương mại Galleria có bãi đỗ xe ngoài trời và bãi xe tầng hầm có mái che hoàn toàn MIỄN PHÍ suốt cả ngày với hàng nghìn vị trí đậu xe thuận tiện.',
    aEn: 'We are situated at Shop SP094, directly opposite Kmart, near the Collier Rd and Walter Rd West entrance inside Morley Galleria Shopping Centre. The mall provides thousands of all-day FREE parking spaces, including shaded underground and rooftop parking.'
  },
  {
    id: 'payment-and-gift-vouchers',
    category: 'booking',
    tagVi: 'Thanh toán & Voucher',
    tagEn: 'Payment & Vouchers',
    qVi: 'Tiệm nhận những hình thức thanh toán nào? Có Gift Voucher làm quà tặng không?',
    qEn: 'What payment methods do you accept, and are gift vouchers available?',
    aVi: 'Chúng tôi nhận thanh toán qua thẻ EFTPOS, Visa, Mastercard, Apple Pay, Google Pay và tiền mặt (Cash). Ngoài ra, tiệm có phát hành Thẻ quà tặng (Gift Voucher) với các mệnh giá tùy chọn, thiết kế trang nhã, không giới hạn thời hạn sử dụng—món quà lý tưởng cho bạn bè và người thân.',
    aEn: 'We accept all major EFTPOS, Visa, Mastercard, Apple Pay, Google Pay, and Cash. Beautiful physical Gift Vouchers in any custom amount are also available at our reception desk with no expiration pressure—the perfect treat for friends and family.'
  },
  {
    id: 'accessibility-prams',
    category: 'booking',
    tagVi: 'Tiếp cận xe lăn & xe đẩy',
    tagEn: 'Wheelchair & Pram Access',
    qVi: 'Tiệm có lối đi thuận tiện cho xe lăn và xe đẩy em bé (Pram / Wheelchair accessible) không?',
    qEn: 'Is the salon accessible for prams and wheelchairs?',
    aVi: 'Có! Mặt bằng tiệm nằm hoàn toàn trên tầng trệt bằng phẳng của Galleria, lối đi rộng rãi không có bậc tam cấp gồ ghề. Không gian ghế làm móng được bố trí thông thoáng, rất thuận tiện cho các mẹ đẩy xe em bé hoặc người lớn tuổi di chuyển bằng xe lăn.',
    aEn: 'Yes! Located on the ground floor of Morley Galleria, our salon has completely flat, step-free access with wide walkways, making it easily accessible for prams, strollers, and wheelchairs.'
  }
];
