/**
 * Knowledge base and intelligent matching engine for Fashion Nails Morley Galleria Chatbot.
 * Supports both Vietnamese and English with rich contextual responses and action triggers.
 */

export const QUICK_PROMPTS = {
  vi: [
    { id: 'biab_vs_gelx', text: '💅 Tư vấn: BIAB hay Gel X?' },
    { id: 'pricing_discount', text: '💰 Bảng giá & Giảm 10%' },
    { id: 'opening_walkin', text: '⏰ Giờ mở cửa & Walk-ins' },
    { id: 'location_parking', text: '📍 Địa chỉ & Bãi đậu xe' },
    { id: 'hygiene_autoclave', text: '🛡️ Vệ sinh & An toàn bà bầu' },
    { id: 'book_now', text: '📅 Đặt lịch hẹn ngay' }
  ],
  en: [
    { id: 'biab_vs_gelx', text: '💅 Advice: BIAB vs Gel X?' },
    { id: 'pricing_discount', text: '💰 Price List & 10% Off' },
    { id: 'opening_walkin', text: '⏰ Hours & Walk-in Policy' },
    { id: 'location_parking', text: '📍 Location & Free Parking' },
    { id: 'hygiene_autoclave', text: '🛡️ Autoclave & Pregnancy Safe' },
    { id: 'book_now', text: '📅 Book an Appointment' }
  ]
};

export const INITIAL_MESSAGES = {
  vi: [
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Xin chào bạn! ✨ Em là Chuyên viên tư vấn của **Fashion Nails Morley Galleria**.',
      time: 'Vừa xong'
    },
    {
      id: 'init-2',
      sender: 'bot',
      text: 'Tiệm phục vụ đầy đủ 26 dịch vụ móng chuẩn Úc (BIAB, Gel X, Acrylic, SNS, Nail Art độc bản...). Bạn cần xem bảng giá, tư vấn mẫu hay đặt lịch hôm nay ạ?',
      time: 'Vừa xong',
      showChips: true
    }
  ],
  en: [
    {
      id: 'init-1',
      sender: 'bot',
      text: 'Hello there! ✨ Welcome to **Fashion Nails Morley Galleria** Concierge.',
      time: 'Just now'
    },
    {
      id: 'init-2',
      sender: 'bot',
      text: 'We offer 26 certified treatments (Signature BIAB, Gel X, Acrylics, Shellac, 3D Nail Art...). How may we assist you with pricing, nail care, or bookings today?',
      time: 'Just now',
      showChips: true
    }
  ]
};

export const FAQ_RESPONSES = [
  {
    id: 'biab_vs_gelx',
    keywords: ['biab', 'gel x', 'gelx', 'khác nhau', 'móng yếu', 'móng gãy', 'nuôi móng', 'builder gel', 'difference'],
    responseVi: `✨ **Tư vấn chuyên gia:**
• **BIAB (Builder in a Bottle - $60+):** Phù hợp nhất nếu bạn muốn **nuôi móng thật dài và chắc khỏe**. Lớp gel dẻo dai bảo vệ móng tự nhiên không bị mài mòn, giữ màu 3–4 tuần.
• **Gel X ($75+):** Nối dài móng cấp tốc bằng tip gel mềm toàn phần, siêu nhẹ êm, phom dáng thanh thoát tự nhiên hơn nhiều so với acrylic truyền thống.

💡 Nếu móng bạn mỏng yếu hoặc hay giòn gãy, tiệm khuyên bạn nên bắt đầu với **BIAB** nhé!`,
    responseEn: `✨ **Expert Recommendation:**
• **BIAB (Builder Gel - $60+):** Best for **protecting & strengthening natural nails**. Creates a flexible apex, prevents breakage, and lasts 3–4 weeks without nail damage.
• **Gel X ($75+):** Full-cover soft gel extensions for instant elegant length. Super lightweight and natural compared to traditional acrylic.

💡 If your nails are thin or brittle, our technicians highly recommend starting with **BIAB**!`,
    action: { type: 'book', serviceId: 'biab-natural', labelVi: '📅 Đặt Lịch Làm BIAB ($60)', labelEn: '📅 Book BIAB Treatment ($60)' }
  },
  {
    id: 'pricing_discount',
    keywords: ['giá', 'bảng giá', 'bao nhiêu tiền', 'price', 'pricing', 'cost', 'giảm giá', 'discount', 'voucher', 'sinh viên', 'senior', 'staff'],
    responseVi: `💰 **Bảng giá niêm yết minh bạch tại Fashion Nails:**
• **Sơn Shellac / Dũa cắt da:** từ **$35**
• **Builder Gel (BIAB) móng thật:** **$60** (Full set $80, Refill $65)
• **Nối Móng Acrylic Full Set:** từ **$65** (Kèm sơn gel)
• **Nối Móng Gel X:** **$75** (Kèm sơn gel)
• **Deluxe Spa Pedicure (Ghế massage):** **$45** (Kèm Shellac $60)
• **Nail Art thủ công (French, Chrome, Mắt mèo, 3D):** từ **$5 – $25+**

🎁 **ƯU ĐÃI ĐẶC QUYỀN:** Giảm ngay **10%** cho Người cao tuổi (Seniors), Học sinh - Sinh viên (Students) và Nhân viên Morley Galleria! Có sẵn Gift Vouchers tại quầy.`,
    responseEn: `💰 **Transparent Price Menu at Fashion Nails:**
• **Shellac Gel / Cut Buff Shape:** from **$35**
• **BIAB Natural Nails Overlay:** **$60** (Full set $80, Refill $65)
• **Acrylic Full Set:** from **$65** (incl. gel polish)
• **Gel X Extensions:** **$75** (incl. gel polish)
• **Deluxe Spa Pedicure:** **$45** (with Shellac $60)
• **Bespoke Nail Art (French, Chrome, Cat Eye, 3D):** from **$5 – $25+**

🎁 **EXCLUSIVE OFFER:** Enjoy **10% OFF** for Seniors, Students & Morley Galleria Staff! Gift Vouchers available.`,
    action: { type: 'pricing', labelVi: '📖 Xem Bảng Giá Đầy Đủ 26 Dịch Vụ', labelEn: '📖 View Full 26 Treatment Menu' }
  },
  {
    id: 'opening_walkin',
    keywords: ['giờ', 'mở cửa', 'mấy giờ', 'đóng cửa', 'thứ năm', 'chủ nhật', 'walk in', 'walk-in', 'vãng lai', 'hours', 'open', 'appointment'],
    responseVi: `⏰ **Giờ mở cửa phục vụ cả 7 ngày trong tuần:**
• **Thứ 2 – Thứ 7:** 9:30 AM – 5:30 PM
• **Riêng Thứ 5 (Late Night Shopping):** 9:30 AM – **7:00 PM**
• **Chủ Nhật:** 11:00 AM – 4:30 PM

🚶‍♀️ **Khách vãng lai (Walk-ins):** Tiệm luôn sẵn sàng đón tiếp khách walk-in! Tuy nhiên, vào các khung giờ cao điểm hoặc cuối tuần, bạn nên đặt hẹn trước qua web để được phục vụ ngay không phải chờ đợi nhé.`,
    responseEn: `⏰ **Opening Hours (Open 7 Days a Week):**
• **Monday – Saturday:** 9:30 AM – 5:30 PM
• **Thursday (Late Night Shopping):** 9:30 AM – **7:00 PM**
• **Sunday:** 11:00 AM – 4:30 PM

🚶‍♀️ **Walk-ins Welcome:** We gladly welcome walk-in clients! During busy afternoon hours or weekends, booking online is recommended to guarantee zero waiting time.`,
    action: { type: 'book', labelVi: '📅 Đặt Lịch Ưu Tiên Không Chờ Đợi', labelEn: '📅 Reserve Priority Appointment' }
  },
  {
    id: 'location_parking',
    keywords: ['địa chỉ', 'ở đâu', 'chỗ nào', 'kmart', 'đậu xe', 'parking', 'morley galleria', 'address', 'location', 'directions'],
    responseVi: `📍 **Vị trí tiệm rất dễ tìm:**
• **Gian hàng:** Shop SP094 (Tầng trệt, nằm ngay **đối diện cổng siêu thị Kmart**).
• **Địa chỉ:** Morley Galleria Shopping Centre, Collier Rd & Russell St, Morley WA 6062.

🚗 **Bãi Đậu Xe:**
Hoàn toàn **MIỄN PHÍ CẢ NGÀY** với hơn 4,000 chỗ đậu xe quanh trung tâm. Bạn nên đậu ở khu vực bãi xe gần lối vào Kmart để đi thẳng vào tiệm nhanh nhất chỉ 1 phút đi bộ!`,
    responseEn: `📍 **Convenient Salon Location:**
• **Shop SP094:** Ground floor, situated directly **opposite the Kmart entrance**.
• **Address:** Morley Galleria Shopping Centre, Collier Rd & Russell St, Morley WA 6062.

🚗 **Parking:**
**100% FREE ALL-DAY PARKING** across 4,000+ bays. We recommend parking near the Kmart mall entrance for the quickest 1-minute walk directly to our salon doors!`,
    action: { type: 'call', labelVi: '📞 Gọi Hotline: (08) 9375 2888', labelEn: '📞 Call Salon: (08) 9375 2888' }
  },
  {
    id: 'hygiene_autoclave',
    keywords: ['vệ sinh', 'tiệt trùng', 'khử trùng', 'autoclave', 'bà bầu', 'mang thai', 'an toàn', 'nhiễm trùng', 'hygiene', 'pregnant', 'pregnancy', 'sterilize'],
    responseVi: `🛡️ **Tiêu chuẩn y tế nghiêm ngặt tại Fashion Nails:**
1. **Nồi hấp tiệt trùng Autoclave 134°C:** 100% kìm cắt da, dũa thép và đầu mài đều trải qua chu trình khử trùng nhiệt ẩm y tế và đóng túi vô trùng xé trước mắt bạn.
2. **Dụng cụ dùng 1 lần:** Dũa mút, que gỗ, túi bọc bồn ngâm chân spa được thay mới hoàn toàn cho mỗi khách.
3. **An toàn cho phụ nữ mang thai:** Sơn cao cấp không mùi độc hại, hệ thống hút khí thoáng đạt chuẩn Tây Úc và dịch vụ ngâm chân thảo mộc giảm phù nề rất thư giãn!`,
    responseEn: `🛡️ **Medical-grade Hygiene Protocol:**
1. **134°C Steam Autoclave Sterilization:** All clippers, steel tools, and drill bits are autoclaved and sealed in medical pouches opened right in front of you.
2. **Single-Use Disposables:** Files, buffers, and pedicure tub liners are strictly 100% single-use per client.
3. **Pregnancy Safe:** Non-toxic polishes, proper salon ventilation complying with WA Health, and soothing herbal foot soaks that alleviate swelling safely!`,
    action: { type: 'book', serviceId: 'spa-pedi-shellac', labelVi: '📅 Đặt Lịch Deluxe Spa Pedicure', labelEn: '📅 Book Deluxe Spa Pedicure' }
  },
  {
    id: 'nail_art_inspo',
    keywords: ['vẽ', 'art', 'nail art', 'french', 'mắt mèo', 'chrome', 'tráng gương', 'inspo', 'mẫu móng', 'hình ảnh', 'design', 'cat eye'],
    responseVi: `🎨 **Thiết Kế Nail Art Thủ Công Theo Yêu Cầu:**
• Đội ngũ kỹ thuật viên của Fashion Nails chuyên sâu các xu hướng hot nhất: **Tráng gương Chrome giọt nước kim loại lỏng**, **Mắt mèo ánh nhung**, **Aura Airbrush loang viền**, **Vẽ nổi 3D ngọc trai/sóng biển**, **French đầu móng viền mảnh**.
• Bạn hoàn toàn có thể mang ảnh mẫu (Inspo photo từ Instagram/Pinterest) đến, thợ sẽ tư vấn độ dài, phom móng và báo giá chính xác trước khi thực hiện!`,
    responseEn: `🎨 **Bespoke Handcrafted Nail Art:**
• Our master technicians specialize in trending styles: **Molten Liquid Chrome droplets**, **Velvet Cat Eye magnetic**, **Aura Airbrush ombré**, **3D Sculpted pearls/sea textures**, and **Micro-French tips**.
• Feel free to bring your favorite inspiration pictures from Instagram or Pinterest! We will match your vision and confirm all details beforehand.`,
    action: { type: 'book', labelVi: '📅 Đặt Lịch Làm Mẫu Nail Art', labelEn: '📅 Book Bespoke Nail Art' }
  },
  {
    id: 'guarantee_repair',
    keywords: ['bảo hành', 'sửa', 'gãy', 'mẻ', 'bong', 'hư', 'tróc', 'guarantee', 'warranty', 'fix', 'repair'],
    responseVi: `💎 **Chính Sách Bảo Hành Tận Tâm:**
Fashion Nails áp dụng chính sách **Bảo Hành 5 – 7 Ngày miễn phí** cho dịch vụ làm móng:
• Nếu móng bị mẻ viền, bung đá hoặc hở chân sơn trong vòng 7 ngày do lỗi kỹ thuật, bạn chỉ cần quay lại tiệm, thợ sẽ dặm sửa lại hoàn toàn miễn phí mà không cần trả thêm bất kỳ chi phí nào!`,
    responseEn: `💎 **Complimentary Quality Guarantee:**
We provide a **5 to 7-Day Complimentary Guarantee** on our sets:
• If you experience any chipping, lifting, or gemstone loss within 7 days, simply drop by our salon and we will touch it up completely free of charge!`,
    action: { type: 'call', labelVi: '📞 Hotline Hỗ Trợ: (08) 9375 2888', labelEn: '📞 Customer Care: (08) 9375 2888' }
  },
  {
    id: 'book_now',
    keywords: ['đặt lịch', 'book', 'booking', 'hẹn', 'lịch hẹn', 'reserve', 'set hẹn'],
    responseVi: `📅 **Đặt Lịch Hẹn Trực Tuyến Thật Dễ Dàng:**
Bạn có thể chọn dịch vụ, ngày làm và khung giờ ưng ý chỉ trong 30 giây qua hệ thống đặt lịch tự động bên dưới:
• Không cần đặt cọc trước.
• Nhận xác nhận lịch hẹn tức thì.
• Giữ chỗ ưu tiên ngay tại tiệm.`,
    responseEn: `📅 **Effortless Online Booking:**
Choose your desired treatment, preferred date, and convenient time slot in 30 seconds:
• Zero deposit required.
• Instant booking confirmation.
• Guaranteed priority chair reservation upon arrival.`,
    action: { type: 'book', labelVi: '📅 Bấm Vào Đây Để Đặt Lịch Ngay', labelEn: '📅 Click Here to Book Now' }
  }
];

export function findChatResponse(input, language = 'en') {
  const normalized = input.toLowerCase().trim();

  // Search through FAQ keywords
  for (const item of FAQ_RESPONSES) {
    const matched = item.keywords.some(kw => normalized.includes(kw));
    if (matched) {
      return {
        text: item.responseEn || item.responseVi,
        action: item.action
      };
    }
  }

  // Fallback response with helpful salon summary & contact
  return {
    text: `Thank you for your inquiry! ✨\n\nFor custom requests, you can explore our complete 26-service menu, call our salon desk directly at **(08) 9375 2888**, or reserve your appointment online!`,
    action: { type: 'book', labelVi: '📅 Đặt Lịch Hẹn Ngay', labelEn: '📅 Book an Appointment' }
  };
}

