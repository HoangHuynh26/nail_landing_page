import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Tag,
  Sparkles, ArrowRight, Users, Plus, Phone
} from 'lucide-react';
import { useAdminSocket } from '../../context/AdminSocketContext';

export function AdminOverview({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activePromo, setActivePromo] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isUnviewed, markAsViewed, realtimeBookings } = useAdminSocket();

  // Sync real-time incoming bookings from WebSocket into recent list
  useEffect(() => {
    if (realtimeBookings.length > 0) {
      setRecentBookings((prev) => {
        const existingIds = new Set(prev.map((b) => String(b.bookingId || b.id)));
        const newItems = realtimeBookings.filter((rb) => !existingIds.has(String(rb.bookingId || rb.id)));
        return newItems.length > 0 ? [...newItems, ...prev].slice(0, 6) : prev;
      });
      setStats((prev) =>
        prev
          ? {
              ...prev,
              total: (prev.total || 0) + 1,
              pending: (prev.pending || 0) + 1,
              today: (prev.today || 0) + 1
            }
          : prev
      );
    }
  }, [realtimeBookings]);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const [bookingsRes, promoRes] = await Promise.all([
          fetch('/api/bookings?limit=5'),
          fetch('/api/promotions/active')
        ]);

        if (bookingsRes.ok) {
          const bData = await bookingsRes.json();
          setRecentBookings(bData.bookings || []);
          if (bData.stats) setStats(bData.stats);
        }

        if (promoRes.ok) {
          const pData = await promoRes.json();
          if (pData.success && pData.promotion) {
            setActivePromo(pData.promotion);
          }
        }
      } catch (err) {
        console.error('Error loading admin overview:', err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  return (
    <div>
      {/* KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap gold">
            <Calendar size={24} />
          </div>
          <div>
            <div className="admin-stat-num">{stats?.total ?? 0}</div>
            <div className="admin-stat-label">Total Bookings</div>
            {stats?.today > 0 && (
              <div style={{ fontSize: '11px', color: '#d4af37', fontWeight: '600', marginTop: '2px' }}>
                +{stats.today} today
              </div>
            )}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="admin-stat-num">{stats?.pending ?? 0}</div>
            <div className="admin-stat-label">Pending Approval</div>
            {stats?.pending > 0 && (
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '600', marginTop: '2px' }}>
                Requires review
              </div>
            )}
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="admin-stat-num">{stats?.confirmed ?? 0}</div>
            <div className="admin-stat-label">Confirmed Appointments</div>
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
              {stats?.completed ?? 0} completed
            </div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon-wrap purple">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="admin-stat-num" style={{ fontSize: '18px', fontWeight: '700' }}>
              {activePromo ? 'ACTIVE' : 'INACTIVE'}
            </div>
            <div className="admin-stat-label">Holiday Pop-up Banner</div>
            <div style={{ fontSize: '11px', color: activePromo ? '#34d399' : '#64748b', marginTop: '2px' }}>
              {activePromo ? (activePromo.title || 'Currently displaying') : 'No active pop-up'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings & Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Recent Bookings */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3 className="admin-card__title">
              <Users size={18} className="text-gold" />
              <span>Recent Appointment Requests</span>
            </h3>
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={() => setActiveTab('bookings')}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      Loading recent appointments...
                    </td>
                  </tr>
                ) : recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                      No appointment bookings received yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((b) => {
                    const id = b.bookingId || b.id;
                    const unviewed = isUnviewed(id);

                    return (
                      <tr
                        key={id}
                        className={unviewed ? 'is-unread-booking' : ''}
                        onClick={() => {
                          if (unviewed) markAsViewed(id);
                          setActiveTab('bookings');
                        }}
                        style={{ cursor: 'pointer' }}
                        title={unviewed ? 'New unviewed booking! Click to view in Bookings' : 'Click to view in Bookings'}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '700', color: '#0f172a' }}>{b.name}</span>
                            {unviewed && (
                              <span className="admin-unread-pill" title="New appointment">
                                <span className="admin-pulse-dot" style={{ background: '#ffffff' }} /> NEW
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{b.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{b.service}</div>
                        </td>
                        <td>
                          <div style={{ color: '#0f172a', fontWeight: '700' }}>{b.date}</div>
                          <div
                            className="admin-booking-time"
                            style={{ color: unviewed ? '#78350f' : '#b45309', fontSize: '11px', fontWeight: '700' }}
                          >
                            {b.time}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                            {b.status === 'confirmed'
                              ? '🔵 CONFIRMED'
                              : b.status === 'completed'
                              ? '🟢 COMPLETED'
                              : b.status === 'cancelled'
                              ? '🔴 CANCELLED'
                              : '🟡 PENDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Holiday Promo Highlights & Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Promo Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                <Sparkles size={18} className="text-gold" />
                <span>Live Holiday Pop-up Poster</span>
              </h3>
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setActiveTab('promotions')}
              >
                <span>Manage</span>
              </button>
            </div>

            {activePromo ? (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img
                  src={activePromo.image_url}
                  alt={activePromo.title}
                  style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 }}
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#047857' }}>
                    ● LIVE ON SALON WEBSITE
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '3px' }}>
                    {activePromo.title || 'Promotional Poster'}
                  </div>
                  {(activePromo.start_date || activePromo.end_date) && (
                    <div style={{ fontSize: '12px', color: '#b45309', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600' }}>
                      <Clock size={12} />
                      <span>
                        {activePromo.start_date || 'Today'} → {activePromo.end_date || 'Indefinite'}
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                    Website visitors will see this poster as an announcement pop-up modal.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                No promotional pop-up poster is currently running or within active dates. Go to the <strong>Holiday Pop-up</strong> tab to schedule or upload one.
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                <Users size={18} className="text-gold" />
                <span>Quick Actions</span>
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="admin-secondary-btn"
                style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%', cursor: 'pointer' }}
                onClick={() => setActiveTab('bookings')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Calendar size={15} className="text-gold" /> View All Appointments
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="admin-secondary-btn"
                style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%', cursor: 'pointer' }}
                onClick={() => setActiveTab('services')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Sparkles size={15} className="text-gold" /> Manage 28 Services & Pricing
                </span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="admin-secondary-btn"
                style={{ justifyContent: 'space-between', padding: '12px 16px', width: '100%', cursor: 'pointer' }}
                onClick={() => setActiveTab('promotions')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '600' }}>
                  <Tag size={15} className="text-gold" /> Schedule Holiday Pop-up Poster
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
