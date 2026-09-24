import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Calendar, Sparkles,
  Lock, ArrowLeft, LogOut, Image as ImageIcon,
  User, Eye, EyeOff, LogIn, Bell
} from 'lucide-react';
import AdminOverview from './AdminOverview';
import AdminBookings from './AdminBookings';
import AdminServices from './AdminServices';
import AdminPromotions from './AdminPromotions';
import { AdminSocketProvider, useAdminSocket } from '../../context/AdminSocketContext';

function AdminDashboardContent({ onBackToWebsite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const {
    isConnected,
    unreadCount,
    liveToast,
    dismissToast,
    markAsViewed
  } = useAdminSocket();

  // Check saved token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('atelier_admin_token');
    if (savedToken) {
      setIsAuthenticated(true);
    }
    setIsCheckingAuth(false);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!username.trim() || !password) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password
        })
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('atelier_admin_token', data.token);
        setIsAuthenticated(true);
      } else {
        setLoginError(data.message || 'Invalid username or password');
      }
    } catch {
      // Offline fallback: check default 'admin' / 'Admin@123'
      if (username.trim().toLowerCase() === 'admin' && password === 'Admin@123') {
        localStorage.setItem('atelier_admin_token', 'local-token');
        setIsAuthenticated(true);
      } else {
        setLoginError('Invalid username or password. Default is admin / Admin@123');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atelier_admin_token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  if (isCheckingAuth) {
    return (
      <div className="atelier-admin-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#d4af37' }}>Loading Admin Suite...</div>
      </div>
    );
  }

  // 1. Username & Password Login Screen
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div className="admin-lock-icon">
            <Lock size={32} />
          </div>

          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            Fashion Nails Atelier
          </h2>
          <div style={{ fontSize: '12px', color: '#b45309', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px', fontWeight: '700' }}>
            Executive Admin Portal
          </div>

          <p style={{ fontSize: '13px', color: '#64748b', margin: '14px 0 20px', lineHeight: '1.5' }}>
            Enter your administrative credentials to access salon bookings, services catalog, and promotion settings.
          </p>

          <form onSubmit={handleLoginSubmit}>
            <div className="admin-login-field">
              <label className="admin-login-label">Username</label>
              <div className="admin-login-input-wrap">
                <User size={16} className="admin-login-icon" />
                <input
                  type="text"
                  autoFocus
                  className="admin-login-input"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            <div className="admin-login-field">
              <label className="admin-login-label">Password</label>
              <div className="admin-login-input-wrap">
                <Lock size={16} className="admin-login-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="admin-login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="admin-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div style={{ color: '#f87171', fontSize: '13px', margin: '10px 0 14px', textAlign: 'center' }}>
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="admin-primary-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '6px' }}
              disabled={isSubmitting}
            >
              <LogIn size={18} />
              <span>{isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Default: <strong style={{ color: '#d4af37' }}>admin</strong> / <strong style={{ color: '#d4af37' }}>Admin@123</strong>
            </span>
          </div>
        </div>
      </div>
    );
  }

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
          {/* WebSocket Status Indicator */}
          <div
            className={`admin-db-pill ${isConnected ? 'is-neon' : 'is-fallback'}`}
            title={isConnected ? 'Realtime WebSocket Active - Live Booking Updates' : 'Connecting to WebSocket...'}
          >
            <span className="admin-pulse-dot" />
            <span>{isConnected ? 'Realtime Live' : 'Connecting...'}</span>
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
            style={{ position: 'relative' }}
          >
            <Calendar size={16} />
            <span>Bookings & Appointments</span>
            {unreadCount > 0 && (
              <span className="admin-tab-count-badge" title={`${unreadCount} unviewed new appointments`}>
                {unreadCount} NEW
              </span>
            )}
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
            <ImageIcon size={16} />
            <span>Holiday & Discount Pop-up</span>
          </button>
        </nav>

        {/* Tab View Content */}
        {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
        {activeTab === 'bookings' && <AdminBookings />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'promotions' && <AdminPromotions />}
      </main>

      {/* Realtime New Booking Floating Toast */}
      {liveToast && (
        <div className="admin-realtime-toast" role="alert">
          <div className="admin-realtime-toast__header">
            <div className="admin-realtime-toast__title-wrap">
              <Bell size={18} style={{ color: '#d4af37' }} />
              <span className="admin-realtime-toast__title">New Booking Received!</span>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '14px',
                padding: '4px'
              }}
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          <div className="admin-realtime-toast__body">
            <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>
              {liveToast.booking.name}
            </div>
            <div style={{ color: '#b45309', fontSize: '13px', marginTop: '3px', fontWeight: '700' }}>
              {liveToast.booking.service}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              📅 {liveToast.booking.date} at <strong style={{ color: '#0f172a' }}>{liveToast.booking.time}</strong>
            </div>
          </div>

          <div className="admin-realtime-toast__actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={dismissToast}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="admin-primary-btn"
              onClick={() => {
                markAsViewed(liveToast.booking.bookingId || liveToast.booking.id);
                dismissToast();
                setActiveTab('bookings');
              }}
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              <Eye size={13} />
              <span>View Appointment</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminPage(props) {
  return (
    <AdminSocketProvider>
      <AdminDashboardContent {...props} />
    </AdminSocketProvider>
  );
}

export default AdminPage;
