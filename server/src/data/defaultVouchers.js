/**
 * Default initial vouchers for Fashion Nails Morley Galleria
 */
export const defaultVouchers = [
  {
    id: 1,
    code: 'WELCOME10',
    name: '10% Off New Client Welcome Voucher',
    discountType: 'percentage',
    discountValue: 10,
    minSpend: 30,
    maxDiscount: 20,
    usageLimit: 100,
    usedCount: 8,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    code: 'FASHION5',
    name: '$5 Off Nail Services over $40',
    discountType: 'fixed',
    discountValue: 5,
    minSpend: 40,
    maxDiscount: 5,
    usageLimit: 50,
    usedCount: 14,
    startDate: '2026-09-01',
    endDate: '2026-12-31',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    code: 'VIP20',
    name: '20% Off Loyalty Celebration Voucher',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 50,
    maxDiscount: 35,
    usageLimit: 30,
    usedCount: 5,
    startDate: '2026-09-15',
    endDate: '2026-11-30',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
