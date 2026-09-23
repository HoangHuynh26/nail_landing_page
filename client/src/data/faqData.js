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
  // --- 1. DỊCH VỤ & KỸ THUẬT MÓNG (SERVICES) ---
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

  // --- 2. VỆ SINH, AN TOÀN & BẢO HÀNH (HYGIENE & WARRANTY) ---
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
    id: 'warranty-repair-policy',
    category: 'hygiene',
    tagVi: 'Bảo hành 5 ngày',
    tagEn: '5-Day Guarantee',
    qVi: 'Chính sách bảo hành móng: Nếu móng bị mẻ (chip) hoặc hở chân sau khi làm thì sao?',
    qEn: 'What is your repair policy if a nail chips or breaks after my visit?',
    aVi: 'Chúng tôi có chính sách bảo hành 5 ngày miễn phí cho tất cả dịch vụ BIAB, Gel X và Acrylic. Nếu móng gặp sự cố mẻ sơn, nứt gãy hoặc hở chân móng trong điều kiện sinh hoạt thông thường trong vòng 5 ngày kể từ ngày làm, quý khách chỉ cần liên hệ hoặc ghé lại tiệm để thợ chỉnh sửa lại hoàn toàn miễn phí.',
    aEn: 'We offer a complimentary 5-day guarantee on all BIAB, Gel X, and Acrylic services. If you experience unexpected chipping, premature lifting, or a crack under normal wear within 5 days of your appointment, simply drop in or call us, and we will fix it free of charge.'
  },

  // --- 3. ĐẶT LỊCH, VỊ TRÍ & TIỆN ÍCH (BOOKING & LOCATION) ---
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
    id: 'location-and-parking',
    category: 'booking',
    tagVi: 'Vị trí & Đậu xe miễn phí',
    tagEn: 'Location & Parking',
    qVi: 'Tiệm nằm ở vị trí nào trong Morley Galleria, có chỗ đậu xe miễn phí và ưu đãi gì không?',
    qEn: 'Where are you located in Morley Galleria, is parking free, and do you offer discounts?',
    aVi: 'Tiệm toạ lạc tại Gian hàng SP094 (ngay đối diện Kmart, gần lối vào góc đường Collier Rd & Walter Rd West). Trung tâm thương mại Galleria có bãi đỗ xe ngoài trời và hầm có mái che MIỄN PHÍ suốt cả ngày.\n• Ưu đãi đặc biệt: Giảm ngay 10% trên tổng hoá đơn khi xuất trình thẻ Học sinh / Sinh viên (Student ID), thẻ Người cao tuổi (Seniors Card) hoặc thẻ nhân viên Morley Galleria.',
    aEn: 'We are situated at Shop SP094, directly opposite Kmart, near the Collier Rd and Walter Rd West entrance inside Morley Galleria. The mall provides thousands of all-day FREE parking spaces.\n• Special Discount: Enjoy an instant 10% discount off your total bill when presenting a valid Australian Student ID, Seniors Card, or Morley Galleria Staff pass.'
  }
];

