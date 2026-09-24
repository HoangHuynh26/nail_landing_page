import React, { useState, useEffect } from 'react';
import {
  Search, Filter, RefreshCw, CheckCircle, Clock, XCircle,
  AlertCircle, Phone, Mail, MessageSquare, Trash2, Calendar, User, ExternalLink
} from 'lucide-react';

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
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
        setBookings(prev =>
          prev.map(b => (b.bookingId === bookingId || b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to permanently delete booking #${bookingId}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setBookings(prev => prev.filter(b => b.bookingId !== bookingId && b.id !== bookingId));
      }
    } catch (err) {
      alert('Error deleting booking: ' + err.message);
    }
  };

  const cleanPhoneForWa = (phone) => {
    return phone ? phone.replace(/[^0-9]/g, '') : '';
  };

  return (
    <div>
      {/* Search & Filter Toolbar */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">
            <Calendar size={20} className="text-gold" />
            <span>Appointment Bookings Management</span>
          </h2>
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

            <select
              className="admin-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              type="button"
              className="admin-secondary-btn"
              onClick={fetchBookings}
              title="Refresh"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
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
                <th>Voucher / Notes</th>
                <th>Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px' }}>
                    <div style={{ color: '#94a3b8' }}>Loading bookings...</div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px' }}>
                    <div style={{ color: '#64748b', fontSize: '15px' }}>
                      No appointments found matching the current filter.
                    </div>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.bookingId || b.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#d4af37' }}>
                        {b.bookingId || `#${b.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{b.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <a
                          href={`tel:${b.phone}`}
                          style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Phone size={12} /> {b.phone}
                        </a>
                        <a
                          href={`mailto:${b.email}`}
                          style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Mail size={12} /> {b.email}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500', color: '#f1f5f9' }}>{b.service}</div>
                    </td>
                    <td>
                      <div style={{ color: '#e2e8f0', fontWeight: '600' }}>{b.date}</div>
                      <div style={{ color: '#d4af37', fontSize: '12px' }}>{b.time}</div>
                    </td>
                    <td>
                      {b.voucher ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          background: 'rgba(212, 175, 55, 0.15)',
                          border: '1px dashed #d4af37',
                          borderRadius: '6px',
                          color: '#f7d070',
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {b.voucher}
                        </span>
                      ) : null}
                      {b.message ? (
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', maxWidth: '200px' }}>
                          {b.message}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      <select
                        value={b.status || 'pending'}
                        onChange={(e) => handleStatusChange(b.bookingId || b.id, e.target.value)}
                        disabled={updatingId === (b.bookingId || b.id)}
                        className={`status-badge ${(b.status || 'pending').toLowerCase()}`}
                        style={{ cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="pending">PENDING</option>
                        <option value="confirmed">CONFIRMED</option>
                        <option value="completed">COMPLETED</option>
                        <option value="cancelled">CANCELLED</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-action-btn-group">
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
                        {/* Delete */}
                        <button
                          type="button"
                          className="admin-icon-btn danger"
                          onClick={() => handleDeleteBooking(b.bookingId || b.id)}
                          title="Delete booking"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminBookings;
