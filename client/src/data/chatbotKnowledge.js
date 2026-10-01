/**
 * Knowledge base and intelligent matching engine for Fashion Nails Morley Galleria Chatbot.
 * Contextual responses and action triggers.
 */

export const QUICK_PROMPTS = {
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
      text: 'We offer 29 certified treatments (Signature BIAB, Gel X, Acrylics, Shellac, 3D Nail Art...). How may we assist you with pricing, nail care, or bookings today?',
      time: 'Just now',
      showChips: true
    }
  ]
};

export const FAQ_RESPONSES = [
  {
    id: 'biab_vs_gelx',
    keywords: ['biab', 'gel x', 'gelx', 'weak nails', 'brittle', 'builder gel', 'difference'],
    responseEn: `✨ **Expert Recommendation:**
• **BIAB (Builder Gel - $60+):** Best for **protecting & strengthening natural nails**. Creates a flexible apex, prevents breakage, and lasts 3–4 weeks without nail damage.
• **Gel X ($80+):** Full-cover soft gel extensions for instant elegant length. Super lightweight and natural compared to traditional acrylic.

💡 If your nails are thin or brittle, our technicians highly recommend starting with **BIAB**!`,
    action: { type: 'book', serviceId: 'biab-natural', labelEn: '📅 Book BIAB Treatment ($60)' }
  },
  {
    id: 'pricing_discount',
    keywords: ['price', 'pricing', 'cost', 'discount', 'voucher', 'student', 'senior', 'staff', 'menu'],
    responseEn: `💰 **Transparent Price Menu at Fashion Nails:**
• **Shellac Hands / Toes:** from **$35**
• **BIAB Natural Nails Overlay:** **$60** (Full set $80, Refill $65)
• **Acrylic Full Set with Shellac:** **$70** (Refill $55)
• **Gel X Extensions:** **$80** (Refill $65)
• **Spa Pedicure:** from **$45** (with Shellac $49)
• **Spa Pedicure & Manicure Combos:** from **$80 – $119**

🎁 **EXCLUSIVE OFFER:** Enjoy **10% OFF** for Seniors, Students & Morley Galleria Staff! Gift Vouchers available.`,
    action: { type: 'pricing', labelEn: '📖 View Full 29 Treatment Menu' }
  },
  {
    id: 'opening_walkin',
    keywords: ['hours', 'open', 'close', 'opening', 'walk in', 'walk-in', 'walkin', 'appointment', 'thursday', 'sunday'],
    responseEn: `⏰ **Opening Hours (Open 7 Days a Week):**
• **Mon – Wed, Fri:** 9:00 AM – 5:30 PM
• **Thursday (Late Night Shopping):** 9:00 AM – **9:00 PM**
• **Saturday:** 9:00 AM – 5:00 PM
• **Sunday:** 11:00 AM – 5:00 PM

🚶‍♀️ **Walk-ins Welcome:** We gladly welcome walk-in clients! During busy afternoon hours or weekends, booking online is recommended to guarantee zero waiting time.`,
    action: { type: 'book', labelEn: '📅 Reserve Priority Appointment' }
  },
  {
    id: 'location_parking',
    keywords: ['address', 'location', 'directions', 'kmart', 'parking', 'park', 'morley galleria', 'where'],
    responseEn: `📍 **Convenient Salon Location:**
• **Shop SP094:** Ground floor, situated directly **opposite the Kmart entrance**.
• **Address:** Morley Galleria Shopping Centre, Collier Rd & Russell St, Morley WA 6062.

🚗 **Parking:**
**100% FREE ALL-DAY PARKING** across 4,000+ bays. We recommend parking near the Kmart mall entrance for the quickest 1-minute walk directly to our salon doors!`,
    action: { type: 'call', labelEn: '📞 Call Salon: (08) 9375 2888' }
  },
  {
    id: 'hygiene_autoclave',
    keywords: ['hygiene', 'pregnant', 'pregnancy', 'sterilize', 'sterilisation', 'autoclave', 'clean', 'safe', 'infection'],
    responseEn: `🛡️ **Medical-grade Hygiene Protocol:**
1. **134°C Steam Autoclave Sterilization:** All clippers, steel tools, and drill bits are autoclaved and sealed in medical pouches opened right in front of you.
2. **Single-Use Disposables:** Files, buffers, and pedicure tub liners are strictly 100% single-use per client.
3. **Pregnancy Safe:** Non-toxic polishes, proper salon ventilation complying with WA Health, and soothing herbal foot soaks that alleviate swelling safely!`,
    action: { type: 'book', serviceId: 'spa-pedi-shellac', labelEn: '📅 Book Deluxe Spa Pedicure' }
  },
  {
    id: 'nail_art_inspo',
    keywords: ['art', 'nail art', 'french', 'cat eye', 'chrome', 'inspo', 'design', 'picture', 'photo'],
    responseEn: `🎨 **Bespoke Handcrafted Nail Art:**
• Our master technicians specialize in trending styles: **Molten Liquid Chrome droplets**, **Velvet Cat Eye magnetic**, **Aura Airbrush ombre**, **3D Sculpted pearls/sea textures**, and **Micro-French tips**.
• Feel free to bring your favorite inspiration pictures from Instagram or Pinterest! We will match your vision and confirm all details beforehand.`,
    action: { type: 'book', labelEn: '📅 Book Bespoke Nail Art' }
  },
  {
    id: 'guarantee_repair',
    keywords: ['guarantee', 'warranty', 'fix', 'repair', 'broken', 'chip', 'chipped', 'lift'],
    responseEn: `💎 **Complimentary Quality Guarantee:**
We provide a **5 to 7-Day Complimentary Guarantee** on our sets:
• If you experience any chipping, lifting, or gemstone loss within 7 days, simply drop by our salon and we will touch it up completely free of charge!`,
    action: { type: 'call', labelEn: '📞 Customer Care: (08) 9375 2888' }
  },
  {
    id: 'book_now',
    keywords: ['book', 'booking', 'reserve', 'appointment', 'schedule'],
    responseEn: `📅 **Effortless Online Booking:**
Choose your desired treatment, preferred date, and convenient time slot in 30 seconds:
• Zero deposit required.
• Instant booking confirmation.
• Guaranteed priority chair reservation upon arrival.`,
    action: { type: 'book', labelEn: '📅 Click Here to Book Now' }
  }
];

export function findChatResponse(input) {
  const normalized = input.toLowerCase().trim();

  // Search through FAQ keywords
  for (const item of FAQ_RESPONSES) {
    const matched = item.keywords.some(kw => normalized.includes(kw));
    if (matched) {
      return {
        text: item.responseEn,
        action: item.action
      };
    }
  }

  // Fallback response with helpful salon summary & contact
  return {
    text: `Thank you for your inquiry! ✨\n\nFor custom requests, you can explore our complete 26-service menu, call our salon desk directly at **(08) 9375 2888**, or reserve your appointment online!`,
    action: { type: 'book', labelEn: '📅 Book an Appointment' }
  };
}
