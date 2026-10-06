import './AdminBookings.css';
import React, { useState, useEffect, useMemo } from 'react';
import { useAdminSocket } from '../../../context/AdminSocketContext';

// Modular Sub-Components
import BookingToast from './components/BookingToast';
import BookingFilterBar from './components/BookingFilterBar';
import BookingTable from './components/BookingTable';
import BookingPagination from './components/BookingPagination';
import BookingDetailModal from './components/BookingDetailModal';

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '01', label: '01 - Jan' },
  { value: '02', label: '02 - Feb' },
  { value: '03', label: '03 - Mar' },
  { value: '04', label: '04 - Apr' },
  { value: '05', label: '05 - May' },
  { value: '06', label: '06 - Jun' },
  { value: '07', label: '07 - Jul' },
  { value: '08', label: '08 - Aug' },
  { value: '09', label: '09 - Sep' },
  { value: '10', label: '10 - Oct' },
  { value: '11', label: '11 - Nov' },
  { value: '12', label: '12 - Dec' }
];

const DAY_OPTIONS = [
  { value: 'all', label: 'All Days' },
  ...Array.from({ length: 31 }, (_, i) => {
    const val = String(i + 1).padStart(2, '0');
    return { value: val, label: `Day ${val}` };
  })
];

/**
 * Robustly parses a date string or timestamp into year, month, and day parts
 */
export function parseBookingDateParts(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    return {
      year: ymdMatch[1],
      month: ymdMatch[2].padStart(2, '0'),
      day: ymdMatch[3].padStart(2, '0')
    };
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    return {
      year: dmyMatch[3],
      month: dmyMatch[2].padStart(2, '0'),
      day: dmyMatch[1].padStart(2, '0')
    };
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return {
      year: String(d.getFullYear()),
      month: String(d.getMonth() + 1).padStart(2, '0'),
      day: String(d.getDate()).padStart(2, '0')
    };
  }
  return null;
}

export const OFFICIAL_CATEGORY_MAP = {
  biab: 'Builder Gel - BIAB',
  shellac: 'Shellac Nails',
  acrylic: 'Acrylic Nails',
  gelx: 'Gel X Extensions',
  sns: 'SNS Dipping',
  polish: 'Nail Polish',
  extra: 'Extra Services'
};

/**
 * Returns clean English Category display name from raw category or service name
 */
export function getCategoryDisplayName(rawCat, categories = [], serviceName = '', services = []) {
  if (rawCat) {
    const trimmed = String(rawCat).trim();
    const lower = trimmed.toLowerCase();
    if (OFFICIAL_CATEGORY_MAP[lower]) {
      return OFFICIAL_CATEGORY_MAP[lower];
    }
    const foundCat = Array.isArray(categories) ? categories.find(c => (c.id || c.key || '').toLowerCase() === lower) : null;
    if (foundCat && (foundCat.name_en || foundCat.name || foundCat.label)) {
      return foundCat.name_en || foundCat.name || foundCat.label;
    }
    return trimmed;
  }

  if (serviceName) {
    const sLower = String(serviceName).toLowerCase().trim();
    const foundSvc = Array.isArray(services) ? services.find(s =>
      (s.name_en || s.name || '').toLowerCase() === sLower ||
      (s.id || '').toLowerCase() === sLower
    ) : null;
    if (foundSvc && foundSvc.category) {
      const catKey = foundSvc.category.toLowerCase().trim();
      return OFFICIAL_CATEGORY_MAP[catKey] || foundSvc.category;
    }
  }

  return '';
}

/**
 * Detects and computes comprehensive voucher / discount details for a booking
 */
export function getBookingVoucherInfo(booking, allVouchers = [], basePrice = null) {
  if (!booking) return null;

  const rawVoucher = (booking.voucher || '').trim();
  const rawMessage = (booking.message || '').trim();
  const rawNotes = (booking.notes || '').trim();

  const isCommunity = (
    rawVoucher.toLowerCase().includes('10%') ||
    rawVoucher.toLowerCase().includes('community') ||
    rawVoucher.toLowerCase().includes('senior') ||
    rawVoucher.toLowerCase().includes('student') ||
    rawVoucher.toLowerCase().includes('staff') ||
    rawMessage.toLowerCase().includes('10% discount') ||
    rawMessage.toLowerCase().includes('10%') ||
    rawNotes.toLowerCase().includes('10% discount')
  );

  // If there's neither a voucher code nor a community discount keyword, return null
  if (!rawVoucher && !isCommunity) {
    return null;
  }

  // 1. If matching an actual voucher code in database (allVouchers)
  let matchedVoucher = null;
  if (rawVoucher) {
    const cleanCode = rawVoucher.toUpperCase();
    matchedVoucher = allVouchers.find((v) => (v.code || '').trim().toUpperCase() === cleanCode);
  }

  if (matchedVoucher) {
    const isPercentage = matchedVoucher.discountType === 'percentage';
    let discountAmount = 0;
    if (basePrice != null) {
      if (isPercentage) {
        discountAmount = (basePrice * Number(matchedVoucher.discountValue)) / 100;
        if (matchedVoucher.maxDiscount && discountAmount > Number(matchedVoucher.maxDiscount)) {
          discountAmount = Number(matchedVoucher.maxDiscount);
        }
      } else {
        discountAmount = Number(matchedVoucher.discountValue);
      }
      discountAmount = Math.min(discountAmount, basePrice);
      discountAmount = Math.round(discountAmount * 100) / 100;
    }
    const finalPrice = basePrice != null ? Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100) : null;

    return {
      hasVoucher: true,
      code: matchedVoucher.code,
      name: matchedVoucher.name || matchedVoucher.code,
      discountType: matchedVoucher.discountType,
      discountValue: Number(matchedVoucher.discountValue),
      badgeText: isPercentage ? `-${matchedVoucher.discountValue}%` : `-$${matchedVoucher.discountValue}`,
      typeLabel: isPercentage ? `Percentage: -${matchedVoucher.discountValue}%` : `Fixed Amount: -$${matchedVoucher.discountValue}`,
      minSpend: Number(matchedVoucher.minSpend) || 0,
      maxDiscount: matchedVoucher.maxDiscount != null ? Number(matchedVoucher.maxDiscount) : null,
      discountAmount,
      finalPrice,
      isCommunity: false
    };
  }

  // 2. If it's the Community 10% discount
  if (isCommunity) {
    const discountAmount = basePrice != null ? Math.round(basePrice * 0.1 * 100) / 100 : 0;
    const finalPrice = basePrice != null ? Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100) : null;

    return {
      hasVoucher: true,
      code: '10% Discount',
      name: '10% Discount',
      discountType: 'percentage',
      discountValue: 10,
      badgeText: '-10%',
      typeLabel: 'Percentage: -10% (10% Discount)',
      minSpend: 0,
      maxDiscount: null,
      discountAmount,
      finalPrice,
      isCommunity: true
    };
  }

  // 3. Fallback: custom voucher code was used (e.g. SUMMER25, SALE50) but not yet loaded or in DB
  const numMatch = rawVoucher.match(/(\d+)/);
  const guessedPercent = numMatch ? parseInt(numMatch[1], 10) : null;
  const isSensiblePercent = guessedPercent && guessedPercent > 0 && guessedPercent <= 100;

  let discountAmount = 0;
  if (basePrice != null && isSensiblePercent) {
    discountAmount = Math.round(((basePrice * guessedPercent) / 100) * 100) / 100;
  }
  const finalPrice = basePrice != null ? Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100) : null;

  return {
    hasVoucher: true,
    code: rawVoucher,
    name: `Voucher Code ${rawVoucher}`,
    discountType: isSensiblePercent ? 'percentage' : 'custom',
    discountValue: isSensiblePercent ? guessedPercent : null,
    badgeText: isSensiblePercent ? `-${guessedPercent}%` : rawVoucher,
    typeLabel: isSensiblePercent ? `Percentage: -${guessedPercent}%` : `Voucher Code (${rawVoucher})`,
    minSpend: 0,
    maxDiscount: null,
    discountAmount,
    finalPrice,
    isCommunity: false
  };
}

/**
 * Matches a booking to the salon catalog services to retrieve official pricing & duration
 */
export function findServicePricing(booking, servicesList) {
  if (!booking || !servicesList) return { price: null, pricePrefix: '', duration: 45, serviceObj: null };
  const targetId = booking.serviceId;
  const bookingSvcName = (booking.service || booking.serviceName || '').toLowerCase().trim();

  // 1. Exact ID match
  let found = servicesList.find((s) => targetId && s.id === targetId);

  // 2. Exact name match (English or Vietnamese)
  if (!found && bookingSvcName) {
    found = servicesList.find((s) => {
      const sName = (s.name || s.name_en || s.nameEn || '').toLowerCase().trim();
      return sName && bookingSvcName === sName;
    });
  }

  // 3. Substring inclusion match
  if (!found && bookingSvcName) {
    found = servicesList.find((s) => {
      const sName = (s.name || s.name_en || s.nameEn || '').toLowerCase().trim();
      return sName && (bookingSvcName.includes(sName) || sName.includes(bookingSvcName));
    });
  }

  // 4. Keyword / fuzzy match for natural variations (e.g. "Full Set Gel X Extensions", "Classic Pedicure", "Natural nails")
  if (!found && bookingSvcName) {
    const cleanBooking = bookingSvcName.replace(/[^a-z0-9]/g, ' ');
    found = servicesList.find((s) => {
      const sEn = (s.name || s.name_en || s.nameEn || '').toLowerCase().replace(/[^a-z0-9]/g, ' ');

      if (cleanBooking.includes('gel x') && (sEn.includes('gel x') || s.id.includes('gelx'))) return true;
      if (cleanBooking.includes('pedicure') && sEn.includes('pedicure')) return true;
      if (cleanBooking.includes('manicure') && sEn.includes('manicure')) return true;
      if (cleanBooking.includes('biab') && (sEn.includes('biab') || s.id.includes('biab'))) return true;
      if (cleanBooking.includes('acrylic') && (sEn.includes('acrylic') || s.id.includes('acrylic'))) return true;
      if (cleanBooking.includes('sns') && (sEn.includes('sns') || s.id.includes('sns'))) return true;
      return false;
    });
  }

  if (!found) {
    return { price: null, pricePrefix: '', duration: 45, serviceObj: null };
  }

  const rawPrice = found.price != null ? Number(found.price) : null;
  const pricePrefix = found.price_prefix || found.pricePrefix || '';
  const duration = found.duration || 45;

  return {
    price: rawPrice,
    pricePrefix,
    duration,
    serviceObj: found
  };
}

export function computeBookingFinancials(booking, servicesList, vouchersList) {
  if (!booking) {
    return {
      guests: 1,
      unitPrice: 0,
      totalOriginalPrice: 0,
      discountAmount: 0,
      totalFinalPrice: 0,
      hasVoucher: false,
      voucherInfo: null,
      duration: 45
    };
  }

  const guests = Math.max(1, Number(booking.guests) || 1);
  const catalogPricing = findServicePricing(booking, servicesList);

  const rawOrig = (booking.originalPrice != null && !isNaN(Number(booking.originalPrice)) && Number(booking.originalPrice) > 0)
    ? Number(booking.originalPrice)
    : (booking.original_price != null && !isNaN(Number(booking.original_price)) && Number(booking.original_price) > 0)
    ? Number(booking.original_price)
    : null;

  const rawPrice = (booking.price != null && !isNaN(Number(booking.price)) && Number(booking.price) > 0)
    ? Number(booking.price)
    : null;

  let totalOriginalPrice = null;
  let unitPrice = null;

  if (rawOrig != null && rawOrig > 0) {
    totalOriginalPrice = rawOrig;
    unitPrice = Math.round((rawOrig / guests) * 100) / 100;
  } else if (catalogPricing.price != null && catalogPricing.price > 0) {
    unitPrice = catalogPricing.price;
    totalOriginalPrice = Math.round(unitPrice * guests * 100) / 100;
  } else if (rawPrice != null && rawPrice > 0) {
    totalOriginalPrice = rawPrice;
    unitPrice = Math.round((rawPrice / guests) * 100) / 100;
  } else {
    unitPrice = 0;
    totalOriginalPrice = 0;
  }

  const voucherInfo = getBookingVoucherInfo(booking, vouchersList, totalOriginalPrice);

  let totalFinalPrice = null;
  let discountAmount = 0;

  if (voucherInfo && voucherInfo.hasVoucher) {
    discountAmount = voucherInfo.discountAmount || 0;
    totalFinalPrice = voucherInfo.finalPrice != null
      ? voucherInfo.finalPrice
      : Math.max(0, Math.round((totalOriginalPrice - discountAmount) * 100) / 100);
  } else if (rawPrice != null && rawPrice > 0) {
    totalFinalPrice = rawPrice;
    if (totalOriginalPrice > totalFinalPrice) {
      discountAmount = Math.round((totalOriginalPrice - totalFinalPrice) * 100) / 100;
    }
  } else {
    totalFinalPrice = totalOriginalPrice;
  }

  return {
    guests,
    unitPrice: unitPrice || 0,
    totalOriginalPrice: totalOriginalPrice || 0,
    discountAmount: discountAmount || 0,
    totalFinalPrice: totalFinalPrice != null ? totalFinalPrice : (totalOriginalPrice || 0),
    hasVoucher: Boolean(voucherInfo && voucherInfo.hasVoucher),
    voucherInfo,
    duration: catalogPricing.duration || 45,
    pricePrefix: catalogPricing.pricePrefix || ''
  };
}

export function AdminBookings({ targetBookingId, onClearTarget } = {}) {
  const [bookings, setBookings] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [allVouchers, setAllVouchers] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toast, setToast] = useState(null);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  const {
    isUnviewed,
    markAsViewed,
    markAllAsViewed,
    unreadCount,
    realtimeBookings
  } = useAdminSocket();

  // If navigated with a target booking ID (e.g. from real-time alert or overview), ensure it's not filtered out
  useEffect(() => {
    if (targetBookingId) {
      setStatusFilter('all');
      setSelectedDay('all');
      setSelectedMonth('all');
      setSelectedYear('all');
      setSearchQuery('');
    }
  }, [targetBookingId]);

  // Smoothly scroll target booking into view and auto-clear after 3.5s
  useEffect(() => {
    if (targetBookingId) {
      const scrollTimer = setTimeout(() => {
        const rowEl =
          document.getElementById(`booking-row-${targetBookingId}`) ||
          document.querySelector(`[data-booking-id="${targetBookingId}"]`);
        if (rowEl) {
          rowEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 250);

      // Auto-clear target ID after 3.5s so the highlight doesn't linger indefinitely
      const clearTimer = setTimeout(() => {
        if (onClearTarget) onClearTarget();
      }, 3500);

      return () => {
        clearTimeout(scrollTimer);
        clearTimeout(clearTimer);
      };
    }
  }, [targetBookingId, bookings, onClearTarget]);

  // Clean up target booking ID when unmounting AdminBookings
  useEffect(() => {
    return () => {
      if (onClearTarget) onClearTarget();
    };
  }, [onClearTarget]);

  // Fetch live services pricing, active vouchers, and categories from backend
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setAllServices(data.services);
        }
      })
      .catch(() => {});

    const token = localStorage.getItem('atelier_admin_token');
    fetch('/api/vouchers', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.vouchers)) {
          setAllVouchers(data.vouchers);
        }
      })
      .catch(() => {});

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.categories)) {
          setAllCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically compute available years based on bookings data & current year
  const currentYear = new Date().getFullYear();
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentYear + 1, currentYear, currentYear - 1, 2026, 2025, 2024]);
    bookings.forEach((b) => {
      if (b.date && b.date.length >= 4) {
        const y = parseInt(b.date.substring(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
      if (b.createdAt && String(b.createdAt).length >= 4) {
        const y = parseInt(String(b.createdAt).substring(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [bookings, currentYear]);

  const bookingYearOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Years' },
      ...availableYears.map((yr) => ({
        value: String(yr),
        label: String(yr)
      }))
    ];
  }, [availableYears]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all' && statusFilter !== 'unviewed') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedDay !== 'all') params.append('day', selectedDay);
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedYear !== 'all') params.append('year', selectedYear);

      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/bookings?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, selectedDay, selectedMonth, selectedYear]);

  // Synchronize new incoming bookings from WebSocket in real time
  useEffect(() => {
    if (realtimeBookings.length > 0) {
      setBookings((prev) => {
        const existingIds = new Set(prev.map((b) => String(b.bookingId || b.id)));
        const newItems = realtimeBookings.filter((rb) => !existingIds.has(String(rb.bookingId || rb.id)));
        return newItems.length > 0 ? [...newItems, ...prev] : prev;
      });
    }
  }, [realtimeBookings]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    markAsViewed(bookingId);
    setUpdatingId(bookingId);
    try {
      const token = localStorage.getItem('atelier_admin_token');
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId || b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        if (selectedBooking && (selectedBooking.bookingId === bookingId || selectedBooking.id === bookingId)) {
          setSelectedBooking((prev) => ({ ...prev, status: newStatus }));
        }
        const emailNotice = {
          confirmed: ' • Confirmation email sent to customer',
          completed: ' • Google Maps review email sent to customer',
          cancelled: ' • Apology cancellation email sent to customer'
        }[newStatus.toLowerCase()] || '';

        showToast(`Status updated: Appointment #${bookingId} is now ${newStatus.toUpperCase()}${emailNotice}.`, 'success');
      } else {
        showToast(data.message || 'Failed to update status.', 'error');
      }
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const cleanPhoneForWa = (phone) => {
    return phone ? phone.replace(/[^0-9]/g, '') : '';
  };

  // Filter bookings for status, search query, day, month, and year
  const displayedBookings = bookings.filter((b) => {
    if (statusFilter === 'unviewed' && !isUnviewed(b.bookingId || b.id)) {
      return false;
    }

    // Real-time client search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        (b.name && b.name.toLowerCase().includes(q)) ||
        (b.phone && b.phone.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q)) ||
        (b.bookingId && b.bookingId.toLowerCase().includes(q)) ||
        (String(b.id) && String(b.id).toLowerCase().includes(q)) ||
        (b.service && b.service.toLowerCase().includes(q)) ||
        (b.voucher && b.voucher.toLowerCase().includes(q)) ||
        (b.message && b.message.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }

    // Strictly match scheduled appointment date (b.date), falling back to b.createdAt
    const dateParts = parseBookingDateParts(b.date) || parseBookingDateParts(b.createdAt);
    if (!dateParts) {
      if (selectedDay !== 'all' || selectedMonth !== 'all' || selectedYear !== 'all') {
        return false;
      }
      return true;
    }

    if (selectedDay !== 'all' && dateParts.day !== String(selectedDay).padStart(2, '0')) {
      return false;
    }

    if (selectedMonth !== 'all' && dateParts.month !== String(selectedMonth).padStart(2, '0')) {
      return false;
    }

    if (selectedYear !== 'all' && dateParts.year !== String(selectedYear)) {
      return false;
    }

    return true;
  });

  // Reset pagination to page 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, selectedDay, selectedMonth, selectedYear, pageSize]);

  // Compute pagination parameters
  const totalPages = Math.ceil(displayedBookings.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  // If navigated with a targetBookingId, jump to the specific page containing it
  useEffect(() => {
    if (targetBookingId && displayedBookings.length > 0) {
      const targetIdx = displayedBookings.findIndex(
        (b) =>
          b.id === targetBookingId ||
          b.bookingId === targetBookingId ||
          String(b.id) === String(targetBookingId) ||
          String(b.bookingId) === String(targetBookingId)
      );
      if (targetIdx !== -1) {
        const targetPage = Math.floor(targetIdx / pageSize) + 1;
        setCurrentPage(targetPage);
      }
    }
  }, [targetBookingId, displayedBookings, pageSize]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, displayedBookings.length);
  const paginatedBookings = displayedBookings.slice(startIndex, endIndex);

  return (
    <div className="admin-bookings-container">
      {/* Top-Right Notification Toast */}
      <BookingToast toast={toast} onClose={() => setToast(null)} />

      {/* Main Bookings Card */}
      <div className="admin-card admin-bookings-card">
        {/* Header, Search & Filter Bar */}
        <BookingFilterBar
          unreadCount={unreadCount}
          onMarkAllAsViewed={markAllAsViewed}
          onRefresh={fetchBookings}
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          dayOptions={DAY_OPTIONS}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          monthOptions={MONTH_OPTIONS}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          yearOptions={bookingYearOptions}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          stats={stats}
          totalBookingsCount={bookings.length}
          displayedBookingsCount={displayedBookings.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />

        {/* Bookings Table */}
        <BookingTable
          loading={loading}
          displayedBookings={displayedBookings}
          statusFilter={statusFilter}
          paginatedBookings={paginatedBookings}
          targetBookingId={targetBookingId}
          allServices={allServices}
          allVouchers={allVouchers}
          allCategories={allCategories}
          getCategoryDisplayName={getCategoryDisplayName}
          computeBookingFinancials={computeBookingFinancials}
          isUnviewed={isUnviewed}
          onSelectBooking={(b) => {
            setSelectedBooking(b);
            if (onClearTarget) onClearTarget();
          }}
          onStatusChange={handleStatusChange}
          updatingId={updatingId}
          onMarkAsViewed={markAsViewed}
          cleanPhoneForWa={cleanPhoneForWa}
        />

        {/* Bottom Pagination Bar */}
        <BookingPagination
          displayedBookingsCount={displayedBookings.length}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSize={pageSize}
          setPageSize={setPageSize}
          safeCurrentPage={safeCurrentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Appointment Detail Modal with Service Pricing, Party Size & Voucher Details */}
      <BookingDetailModal
        selectedBooking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
        allServices={allServices}
        allVouchers={allVouchers}
        allCategories={allCategories}
        getCategoryDisplayName={getCategoryDisplayName}
        computeBookingFinancials={computeBookingFinancials}
        cleanPhoneForWa={cleanPhoneForWa}
        handleStatusChange={handleStatusChange}
        isUnviewed={isUnviewed}
        markAsViewed={markAsViewed}
      />
    </div>
  );
}

export default AdminBookings;
