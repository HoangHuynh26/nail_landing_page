import React, { useState, useEffect } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertCircle, Tag,
  Sparkles, ArrowRight, Database, Users, Plus, Phone
} from 'lucide-react';

export function AdminOverview({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activePromo, setActivePromo] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const [bookingsRes, promoRes, dbRes] = await Promise.all([
          fetch('/api/bookings?limit=5'),
          fetch('/api/promotions/active'),
          fetch('/api/admin/status')
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

        if (dbRes.ok) {
          const dData = await dbRes.json();
          if (dData.success && dData.data?.database) {
            setDbStatus(dData.data.database);
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

  const isNeon = dbStatus?.mode === 'neon_postgresql';

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
                  recentBookings.map((b) => (
                    <tr key={b.bookingId || b.id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#fff' }}>{b.name}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{b.phone}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px', color: '#e2e8f0' }}>{b.service}</div>
                      </td>
                      <td>
                        <div style={{ color: '#fff' }}>{b.date}</div>
                        <div style={{ color: '#d4af37', fontSize: '11px' }}>{b.time}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${(b.status || 'pending').toLowerCase()}`}>
                          {b.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database & Holiday Promo Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Active Promo Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                <Sparkles size={18} className="text-gold" />
                <span>Holiday & Discount Pop-up Poster</span>
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
                  style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '10px', background: '#090b10' }}
                />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#10b981' }}>
                    ● ACTIVE ON HOMEPAGE
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginTop: '3px' }}>
                    {activePromo.title || 'Promotional Poster'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    Website visitors will see this image as an announcement pop-up.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                No promotional pop-up banner is currently active. Go to the <strong>Holiday Pop-up</strong> tab to upload.
              </div>
            )}
          </div>

          {/* Database Status Card */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h3 className="admin-card__title">
                <Database size={18} className="text-gold" />
                <span>Neon PostgreSQL Status</span>
              </h3>
              <button
                type="button"
                className="admin-secondary-btn"
                onClick={() => setActiveTab('database')}
              >
                <span>Config</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>
                  {isNeon ? 'Neon Cloud Database' : 'Local Storage Fallback'}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                  {isNeon
                    ? `Latency: ${dbStatus?.pingMs || 0}ms • Auto-synced`
                    : 'Configure Neon DATABASE_URL in settings to connect cloud'}
                </div>
              </div>

              <span className={`admin-db-pill ${isNeon ? 'is-neon' : 'is-fallback'}`}>
                <span className="admin-pulse-dot" />
                {isNeon ? 'CONNECTED' : 'FALLBACK'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
