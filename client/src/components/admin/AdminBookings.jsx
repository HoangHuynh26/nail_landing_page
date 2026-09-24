import React, { useState, useEffect } from 'react';
import {
  Search, RefreshCw, Clock,
  Phone, Mail, MessageSquare, Calendar,
  Eye, CheckCheck, X, CheckCircle2,
  Percent
} from 'lucide-react';
import { servicesData } from '../../data/services';
import { useAdminSocket } from '../../context/AdminSocketContext';

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

/**
 * Checks whether the customer checked the 10% discount / voucher option
 */
function checkHas10Discount(booking) {
  if (!booking) return false;
  const v = (booking.voucher || '').toLowerCase();
  const m = (booking.message || '').toLowerCase();
  const n = (booking.notes || '').toLowerCase();
  return (
    v.includes('10%') ||
    v.includes('discount') ||
    v.includes('senior') ||
    v.includes('student') ||
    v.includes('staff') ||
    v.includes('community') ||
    m.includes('10% discount') ||
    m.includes('10%') ||
    n.includes('10% discount')
  );
}

/**
 * Matches a booking to the salon catalog services to retrieve official pricing & duration
 */
function findServicePricing(booking, servicesList) {
  if (!booking || !servicesList) return { price: null, pricePrefix: '', duration: 45, serviceObj: null };
  const targetId = booking.serviceId;
  const bookingSvcName = (booking.service || '').toLowerCase().trim();

  const found = servicesList.find((s) => {
    if (targetId && s.id === targetId) return true;
    const sNameEn = (s.name_en || s.nameEn || '').toLowerCase().trim();
    const sNameVi = (s.name_vi || s.nameVi || '').toLowerCase().trim();
    if (sNameEn && bookingSvcName === sNameEn) return true;
    if (sNameVi && bookingSvcName === sNameVi) return true;
    if (sNameEn && (bookingSvcName.includes(sNameEn) || sNameEn.includes(bookingSvcName))) return true;
    return false;
  });

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

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [allServices, setAllServices] = useState(servicesData);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    isUnviewed,
    markAsViewed,
    markAllAsViewed,
    unreadCount,
    realtimeBookings
  } = useAdminSocket();

  // Fetch live services pricing from backend, fallback to local services catalog
  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setAllServices(data.services);
        }
      })
      .catch(() => {});
  }, []);

  // Dynamically compute available years based on bookings data & current year
  const currentYear = new Date().getFullYear();
  const availableYears = React.useMemo(() => {
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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all' && statusFilter !== 'unviewed') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedMonth !== 'all') params.append('month', selectedMonth);
      if (selectedYear !== 'all') params.append('year', selectedYear);

      const res = await fetch(`/api/bookings?${params.toString()}`);
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
  }, [statusFilter, selectedMonth, selectedYear]);

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
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const cleanPhoneForWa = (phone) => {
    return phone ? phone.replace(/[^0-9]/g, '') : '';
  };

  // Filter bookings for status, month, and year (ensures real-time socket events also respect filters)
  const displayedBookings = bookings.filter((b) => {
    if (statusFilter === 'unviewed' && !isUnviewed(b.bookingId || b.id)) {
      return false;
    }

    const bDate = b.date || '';
    const bCreated = b.createdAt ? String(b.createdAt) : '';

    if (selectedYear !== 'all' && selectedMonth !== 'all') {
      const ym = `${selectedYear}-${selectedMonth.padStart(2, '0')}`;
      if (!bDate.startsWith(ym) && !bCreated.startsWith(ym)) return false;
    } else if (selectedYear !== 'all') {
      if (!bDate.startsWith(selectedYear) && !bCreated.startsWith(selectedYear)) return false;
    } else if (selectedMonth !== 'all') {
      const m = selectedMonth.padStart(2, '0');
      const dateParts = bDate.split('-');
      const createdParts = bCreated.slice(0, 10).split('-');
      const matchesMonth =
        (dateParts.length >= 2 && dateParts[1] === m) ||
        (createdParts.length >= 2 && createdParts[1] === m);
      if (!matchesMonth) return false;
    }

    return true;
  });

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div className="admin-card">
        <div className="admin-card__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} className="text-gold" />
            <h2 className="admin-card__title" style={{ margin: 0 }}>
              Appointment Bookings Management
            </h2>
            {unreadCount > 0 && (
              <span className="admin-tab-count-badge" title="Unviewed new bookings count">
                {unreadCount} NEW
              </span>
            )}
          </div>

          <div className="admin-toolbar">
            <form onSubmit={handleSearchSubmit} className="admin-search-input-wrap">
              <Search size={16} />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search name, phone, code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Box 1: Month Filter (Ô Lọc Tháng) */}
            <div
              className={`admin-filter-box ${selectedMonth !== 'all' ? 'is-active' : ''}`}
              title="Filter appointments by Month"
            >
              <Calendar size={14} className={selectedMonth !== 'all' ? 'text-gold' : 'text-muted'} />
              <span className="admin-filter-label">Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="admin-filter-select"
                title="Filter by month"
              >
                {MONTH_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Box 2: Year Filter (Ô Lọc Năm) */}
            <div
              className={`admin-filter-box ${selectedYear !== 'all' ? 'is-active' : ''}`}
              title="Filter appointments by Year"
            >
              <Calendar size={14} className={selectedYear !== 'all' ? 'text-gold' : 'text-muted'} />
              <span className="admin-filter-label">Year:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="admin-filter-select"
                title="Filter by year"
              >
                <option value="all">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear/Reset button if any date filter active */}
            {(selectedMonth !== 'all' || selectedYear !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('all');
                  setSelectedYear('all');
                }}
                className="admin-filter-reset-btn"
                title="Clear month and year filter"
              >
                <X size={13} />
                <span>Reset Date</span>
              </button>
            )}

            {unreadCount > 0 && (
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={markAllAsViewed}
                title="Mark all new appointments as viewed"
                style={{ borderColor: '#d97706', color: '#b45309', background: '#fffbeb' }}
              >
                <CheckCheck size={14} />
                <span>Mark All Viewed ({unreadCount})</span>
              </button>
            )}

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={fetchBookings}
              title="Refresh bookings list"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Status Filter Pills & Active Filter Indicator */}
        <div className="admin-status-filter-bar">
          <button
            type="button"
            className={`admin-status-pill-btn ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <span>All Bookings</span>
            <span className="admin-pill-counter">{stats?.total ?? bookings.length}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn unviewed ${statusFilter === 'unviewed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('unviewed')}
          >
            <span className="status-dot unviewed" />
            <span>Unviewed / New</span>
            <span className="admin-pill-counter" style={{ background: '#d97706', color: '#fff' }}>{unreadCount}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn pending ${statusFilter === 'pending' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            <span className="status-dot pending" />
            <span>Pending</span>
            <span className="admin-pill-counter">{stats?.pending ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn confirmed ${statusFilter === 'confirmed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('confirmed')}
          >
            <span className="status-dot confirmed" />
            <span>Confirmed</span>
            <span className="admin-pill-counter">{stats?.confirmed ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn completed ${statusFilter === 'completed' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            <span className="status-dot completed" />
            <span>Completed</span>
            <span className="admin-pill-counter">{stats?.completed ?? 0}</span>
          </button>

          <button
            type="button"
            className={`admin-status-pill-btn cancelled ${statusFilter === 'cancelled' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            <span className="status-dot cancelled" />
            <span>Cancelled</span>
            <span className="admin-pill-counter">{stats?.cancelled ?? 0}</span>
          </button>

          {(selectedMonth !== 'all' || selectedYear !== 'all') && (
            <div className="admin-filter-badge" title="Active Month/Year Filter">
              <Calendar size={13} />
              <span>
                {selectedMonth !== 'all' ? MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label : 'All Months'}{' '}
                {selectedYear !== 'all' ? selectedYear : ''} ({displayedBookings.length} {displayedBookings.length === 1 ? 'booking' : 'bookings'})
              </span>
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Client Name</th>
                <th>Contact</th>
                <th>Service Selected</th>
                <th>Date & Perth Time</th>
                <th>Notes / Details</th>
                <th>Status (Click to Change)</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ color: '#64748b' }}>Loading bookings...</div>
                  </td>
                </tr>
              ) : displayedBookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ color: '#64748b', fontSize: '15px' }}>
                      {statusFilter === 'unviewed'
                        ? 'No unviewed new bookings. All incoming bookings have been checked!'
                        : 'No appointments found matching the current filter.'}
                    </div>
                  </td>
                </tr>
              ) : (
                displayedBookings.map((b) => {
                  const id = b.bookingId || b.id;
                  const unviewed = isUnviewed(id);
                  const rowPricing = findServicePricing(b, allServices);
                  const rowHas10 = checkHas10Discount(b);

                  return (
                    <tr
                      key={id}
                      className={unviewed ? 'is-unread-booking' : ''}
                      onClick={() => {
                        if (unviewed) markAsViewed(id);
                      }}
                      title={unviewed ? 'Unviewed new booking - Click to mark as read' : ''}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className="admin-booking-id"
                            style={{ fontFamily: 'monospace', fontWeight: '800', color: unviewed ? '#78350f' : '#b45309' }}
                          >
                            {b.bookingId || `#${b.id}`}
                          </span>
                          {unviewed && (
                            <span className="admin-unread-pill" title="New appointment received via socket">
                              <span className="admin-pulse-dot" style={{ background: '#ffffff' }} /> NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{b.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <a
                            href={`tel:${b.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            style={{ color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}
                          >
                            <Phone size={12} /> {b.phone}
                          </a>
                          {b.email && (
                            <a
                              href={`mailto:${b.email}`}
                              onClick={(e) => e.stopPropagation()}
                              style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <Mail size={12} /> {b.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{b.service}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          {rowPricing.price != null && (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              color: '#0f172a',
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}>
                              AU${rowPricing.price}
                            </span>
                          )}
                          {rowHas10 && (
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: '800',
                              color: '#15803d',
                              background: '#dcfce7',
                              border: '1px solid #86efac',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              <Percent size={10} /> 10% OFF
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{b.date}</div>
                        <div
                          className="admin-booking-time"
                          style={{ color: unviewed ? '#78350f' : '#b45309', fontSize: '12px', fontWeight: '700' }}
                        >
                          {b.time}
                        </div>
                      </td>
                      <td>
                        {b.message ? (
                          <div style={{ fontSize: '12px', color: '#64748b', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {b.message}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <select
                          value={b.status || 'pending'}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          disabled={updatingId === id}
                          className={`status-badge ${(b.status || 'pending').toLowerCase()}`}
                          style={{ cursor: 'pointer', outline: 'none' }}
                          title="Click to update status"
                        >
                          <option value="pending" style={{ color: '#92400e', backgroundColor: '#fffbeb', fontWeight: '800' }}>
                            🟡 PENDING
                          </option>
                          <option value="confirmed" style={{ color: '#1e40af', backgroundColor: '#eff6ff', fontWeight: '800' }}>
                            🔵 CONFIRMED
                          </option>
                          <option value="completed" style={{ color: '#065f46', backgroundColor: '#ecfdf5', fontWeight: '800' }}>
                            🟢 COMPLETED
                          </option>
                          <option value="cancelled" style={{ color: '#991b1b', backgroundColor: '#fef2f2', fontWeight: '800' }}>
                            🔴 CANCELLED
                          </option>
                        </select>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div className="admin-action-btn-group">
                          {/* View details */}
                          <button
                            type="button"
                            className="admin-icon-btn"
                            onClick={() => {
                              setSelectedBooking(b);
                              markAsViewed(id);
                            }}
                            title="View appointment details"
                          >
                            <Eye size={14} />
                          </button>

                          {/* WhatsApp / SMS Direct */}
                          <a
                            href={`https://wa.me/${cleanPhoneForWa(b.phone)}?text=Hi%20${encodeURIComponent(b.name)},%20confirming%20your%20appointment%20at%20Fashion%20Nails%20Morley%20Galleria`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-icon-btn"
                            title="Contact on WhatsApp"
                          >
                            <MessageSquare size={14} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Detail Modal with Service Pricing & 10% Voucher Check */}
      {selectedBooking && (() => {
        const modalPricing = findServicePricing(selectedBooking, allServices);
        const modalHas10Voucher = checkHas10Discount(selectedBooking);
        const basePrice = modalPricing.price;
        const discountAmount = (basePrice && modalHas10Voucher) ? Math.round(basePrice * 0.1) : 0;
        const finalPrice = (basePrice && modalHas10Voucher) ? (basePrice - discountAmount) : basePrice;

        // Clean user personal message (removes the internal [10% Discount: ...] prefix)
        const cleanedNotes = (selectedBooking.message || '')
          .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
          .trim();

        const waText = modalHas10Voucher && basePrice != null
          ? `Hi ${selectedBooking.name}, confirming your appointment for ${selectedBooking.service} on ${selectedBooking.date} at ${selectedBooking.time}. Discounted Price: AU$${finalPrice} (10% Community Discount included). See you soon at Fashion Nails Morley Galleria!`
          : `Hi ${selectedBooking.name}, confirming your appointment for ${selectedBooking.service} on ${selectedBooking.date} at ${selectedBooking.time}${basePrice != null ? ` (AU$${basePrice})` : ''}. See you soon at Fashion Nails Morley Galleria!`;

        return (
          <div className="admin-modal-overlay" onClick={() => setSelectedBooking(null)}>
            <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#b45309', fontWeight: '800', letterSpacing: '1px' }}>
                    Appointment Details
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '20px', color: '#0f172a', fontWeight: '800' }}>
                    {selectedBooking.bookingId || `#${selectedBooking.id}`}
                  </h3>
                </div>
                <button
                  type="button"
                  className="admin-icon-btn"
                  onClick={() => setSelectedBooking(null)}
                >
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Client Info */}
                <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Client Information</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
                    {selectedBooking.name}
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '13px' }}>
                    <a href={`tel:${selectedBooking.phone}`} style={{ color: '#0284c7', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                      <Phone size={13} /> {selectedBooking.phone}
                    </a>
                    {selectedBooking.email && (
                      <a href={`mailto:${selectedBooking.email}`} style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={13} /> {selectedBooking.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Service & Official Pricing Card */}
                <div style={{ padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                        Service Booked
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                        {selectedBooking.service}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> Duration: ~{modalPricing.duration} mins
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>
                        Catalog Price
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        {basePrice != null ? `${modalPricing.pricePrefix || ''}AU$${basePrice}` : 'Custom / At Salon'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10% Voucher & Promotion (Only displayed when customer applied voucher) */}
                {modalHas10Voucher && (
                  <div style={{
                    padding: '14px 16px',
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    border: '1.5px solid #86efac',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#166534', fontWeight: '800', fontSize: '13.5px' }}>
                        <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                        <span>10% Voucher Applied (YES)</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        background: '#16a34a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: '800',
                        borderRadius: '6px',
                        letterSpacing: '0.5px'
                      }}>
                        -10% DISCOUNT
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#15803d', lineHeight: '1.4' }}>
                      Customer checked the 10% discount box for <strong>Seniors, Students, or Morley Galleria Staff</strong>.
                    </div>

                    {basePrice != null && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        paddingTop: '8px',
                        borderTop: '1px dashed #bbf7d0',
                        fontSize: '13px'
                      }}>
                        <span style={{ color: '#166534' }}>
                          Original: <span style={{ textDecoration: 'line-through' }}>AU${basePrice}</span> (Save AU${discountAmount})
                        </span>
                        <span style={{ fontWeight: '800', color: '#14532d', fontSize: '16px' }}>
                          Estimated Due: AU${finalPrice}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Date & Time */}
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Scheduled Date & Time</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                    {selectedBooking.date} • {selectedBooking.time}
                  </div>
                </div>

                {/* Special Request / Notes */}
                {cleanedNotes && (
                  <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '10px', border: '1.5px solid #fde68a' }}>
                    <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>Customer Special Request / Notes:</div>
                    <div style={{ fontSize: '13px', color: '#92400e', marginTop: '4px', lineHeight: '1.4', fontWeight: '500' }}>
                      "{cleanedNotes}"
                    </div>
                  </div>
                )}

                {/* Status Selector */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700' }}>Appointment Status:</span>
                  <select
                    value={selectedBooking.status || 'pending'}
                    onChange={(e) => handleStatusChange(selectedBooking.bookingId || selectedBooking.id, e.target.value)}
                    className={`status-badge ${(selectedBooking.status || 'pending').toLowerCase()}`}
                    style={{ cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="pending" style={{ color: '#92400e', backgroundColor: '#fffbeb', fontWeight: '800' }}>
                      🟡 PENDING
                    </option>
                    <option value="confirmed" style={{ color: '#1e40af', backgroundColor: '#eff6ff', fontWeight: '800' }}>
                      🔵 CONFIRMED
                    </option>
                    <option value="completed" style={{ color: '#065f46', backgroundColor: '#ecfdf5', fontWeight: '800' }}>
                      🟢 COMPLETED
                    </option>
                    <option value="cancelled" style={{ color: '#991b1b', backgroundColor: '#fef2f2', fontWeight: '800' }}>
                      🔴 CANCELLED
                    </option>
                  </select>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <a
                    href={`https://wa.me/${cleanPhoneForWa(selectedBooking.phone)}?text=${encodeURIComponent(waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-primary-btn"
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <MessageSquare size={16} />
                    <span>Send WhatsApp Confirmation</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default AdminBookings;
