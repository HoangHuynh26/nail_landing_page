import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Sparkles, Tag, Database,
  Lock, ArrowLeft, LogOut, ShieldCheck, ExternalLink
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminBookings from './AdminBookings';
import AdminServices from './AdminServices';
import AdminPromotions from './AdminPromotions';
import AdminDatabase from './AdminDatabase';

export function AdminPage({ onBackToWebsite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dbStatus, setDbStatus] = useState(null);

  // Check saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('atelier_admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
    fetchDbStatus();
  }, []);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/admin/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.database) {
          setDbStatus(data.data.database);
        }
      }
    } catch (err) {
      console.debug('Failed to get status:', err);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setPinError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pin.trim() })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('atelier_admin_token', data.token);
        setIsAuthenticated(true);
        fetchDbStatus();
      } else {
        setPinError(data.message || 'Incorrect PIN code');
      }
    } catch (err) {
      // Offline fallback: check default '8888'
      if (pin.trim() === '8888') {
        localStorage.setItem('atelier_admin_token', 'local-token');
        setIsAuthenticated(true);
      } else {
        setPinError('Incorrect PIN code. Default is 8888');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atelier_admin_token');
    setIsAuthenticated(false);
    setPin('');
  };

  if (isCheckingAuth) {
    return (
      <div className="atelier-admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#d4af37' }}>Loading Admin Suite...</div>
      </div>
    );
  }

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div className="admin-lock-icon">
            <Lock size={32} />
          </div>

          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#fff' }}>
            Fashion Nails Atelier
          </h2>
          <div style={{ fontSize: '12px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
            Management Portal
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '14px 0 0', lineHeight: '1.5' }}>
            Enter your 4-digit Security PIN to access salon bookings, services, and promotion settings.
          </p>

          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              maxLength="8"
              autoFocus
              className="admin-pin-input"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />

            {pinError && (
              <div style={{ color: '#f87171', fontSize: '13px', marginBottom: '14px' }}>
                {pinError}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
            >
              <ShieldCheck size={18} />
              <span>Unlock Admin Dashboard</span>
            </button>
          </form>

          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onBackToWebsite}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ArrowLeft size={13} /> Back to Website
            </button>

            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Default PIN: <strong style={{ color: '#d4af37' }}>8888</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const isNeon = dbStatus?.mode === 'neon_postgresql';

  // 2. Authenticated Admin Dashboard
  return (
    <div className="atelier-admin-root">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-navbar__brand">
          <div className="admin-navbar__logo-badge">FN</div>
          <div>
            <h1 className="admin-navbar__title">Fashion Nails Morley Galleria</h1>
            <div className="admin-navbar__subtitle">Executive Admin Management Suite</div>
          </div>
        </div>

        <div className="admin-navbar__status-area">
          <div
            className={`admin-db-pill ${isNeon ? 'is-neon' : 'is-fallback'}`}
            title={isNeon ? 'Connected to Neon PostgreSQL' : 'Using Local Fallback Store'}
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('database')}
          >
            <span className="admin-pulse-dot" />
            <span>{isNeon ? 'Neon DB Active' : 'Local Fallback'}</span>
          </div>

          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={onBackToWebsite}
          >
            <ArrowLeft size={14} />
            <span>View Website</span>
          </button>

          <button
            type="button"
            className="admin-nav-action-btn"
            onClick={handleLogout}
            title="Log out from admin"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Tabbed Container */}
      <main className="admin-container">
        {/* Navigation Tabs */}
        <nav className="admin-tabs-nav" aria-label="Admin Navigation Tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'bookings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar size={16} />
            <span>Bookings & Appointments</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'services' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            <Sparkles size={16} />
            <span>Services & Pricing</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'promotions' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('promotions')}
          >
            <Tag size={16} />
            <span>Seasonal Promotions & Pop-up</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'database' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            <Database size={16} />
            <span>Neon Database Diagnostics</span>
          </button>
        </nav>

        {/* Tab View Content */}
        {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'promotions' && <AdminPromotions />}
        {activeTab === 'database' && <AdminDatabase />}
      </main>
    </div>
  );
}

export default AdminPage;
