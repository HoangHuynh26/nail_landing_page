import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, CheckCircle, Clock, XCircle,
  AlertCircle, Phone, Mail, MessageSquare, Calendar, User, ExternalLink,
  Eye, CheckCheck, Sparkles, X, Shield
} from 'lucide-react';
import { useAdminSocket } from '../../context/AdminSocketContext';

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const {
    isUnviewed,
    markAsViewed,
    markAllAsViewed,
    unreadCount,
    realtimeBookings
  } = useAdminSocket();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all' && statusFilter !== 'unviewed') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

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
  }, [statusFilter]);

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

  // Filter for unviewed / new bookings
  const displayedBookings = statusFilter === 'unviewed'
    ? bookings.filter((b) => isUnviewed(b.bookingId || b.id))
    : bookings;

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

        {/* Quick Status Filter Pills (Prominent & High-Contrast) */}
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
                          <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#b45309' }}>
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
                        <div style={{ fontWeight: '600', color: '#334155' }}>{b.service}</div>
                      </td>
                      <td>
                        <div style={{ color: '#0f172a', fontWeight: '700' }}>{b.date}</div>
                        <div style={{ color: '#b45309', fontSize: '12px', fontWeight: '700' }}>{b.time}</div>
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
                        >
                          <option value="pending">PENDING</option>
                          <option value="confirmed">CONFIRMED</option>
                          <option value="completed">COMPLETED</option>
                          <option value="cancelled">CANCELLED</option>
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

      {/* Appointment Detail Modal */}
      {selectedBooking && (
        <div className="admin-modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Service Selected</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#b45309', marginTop: '3px' }}>
                    {selectedBooking.service}
                  </div>
                </div>

                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>Date & Perth Time</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                    {selectedBooking.date} • {selectedBooking.time}
                  </div>
                </div>
              </div>

              {selectedBooking.message && (
                <div style={{ padding: '14px', background: '#fffbeb', borderRadius: '10px', border: '1.5px solid #fde68a' }}>
                  <div style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>Special Request / Notes:</div>
                  <div style={{ fontSize: '13px', color: '#92400e', marginTop: '4px', lineHeight: '1.4', fontWeight: '500' }}>
                    "{selectedBooking.message}"
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span style={{ fontSize: '13px', color: '#334155', fontWeight: '700' }}>Appointment Status:</span>
                <select
                  value={selectedBooking.status || 'pending'}
                  onChange={(e) => handleStatusChange(selectedBooking.bookingId || selectedBooking.id, e.target.value)}
                  className={`status-badge ${(selectedBooking.status || 'pending').toLowerCase()}`}
                  style={{ cursor: 'pointer', outline: 'none' }}
                >
                  <option value="pending">PENDING</option>
                  <option value="confirmed">CONFIRMED</option>
                  <option value="completed">COMPLETED</option>
                  <option value="cancelled">CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <a
                  href={`https://wa.me/${cleanPhoneForWa(selectedBooking.phone)}?text=Hi%20${encodeURIComponent(selectedBooking.name)},%20confirming%20your%20appointment%20for%20${encodeURIComponent(selectedBooking.service)}%20on%20${selectedBooking.date}%20at%20${selectedBooking.time}`}
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
      )}
    </div>
  );
}

export default AdminBookings;
