import './AdminPage.css';
import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Calendar, Sparkles,
  Lock, ArrowLeft, LogOut, Image as ImageIcon,
  User, Eye, EyeOff, LogIn, Bell, Layers, CalendarClock, Ticket,
  Menu, X
} from 'lucide-react';
import AdminOverview from '../AdminOverview/AdminOverview';
import AdminBookings from '../AdminBookings/AdminBookings';
import AdminServices from '../AdminServices/AdminServices';
import AdminPromotions from '../AdminPromotions/AdminPromotions';
import AdminGallery from '../AdminGallery/AdminGallery';
import AdminSchedule from '../AdminSchedule/AdminSchedule';
import AdminVouchers from '../AdminVouchers/AdminVouchers';
import { AdminSocketProvider, useAdminSocket } from '../../../context/AdminSocketContext';
import { getPerthDateString } from '../../../utils/perthTime';
import { getFriendlyErrorMessage } from '../../../utils/errorHandler';

function AdminDashboardContent({ onBackToWebsite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [targetBookingId, setTargetBookingId] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Clear target booking ID so switching back to Bookings tab does not re-scroll or highlight old bookings
  const handleClearTarget = useCallback(() => {
    setTargetBookingId(null);
  }, []);

  // Central tab switcher that clears targetBookingId unless an explicit target is provided
  const switchTab = useCallback((tabId, targetId = null) => {
    setTargetBookingId(targetId);
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const {
    isConnected,
    unreadCount,
    liveToast,
    dismissToast,
    markAsViewed
  } = useAdminSocket();

  // Verify JWT token with backend on mount
  useEffect(() => {
    let isMounted = true;

    const verifyToken = async () => {
      const savedToken = localStorage.getItem('atelier_admin_token');
      if (!savedToken) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          // If at /admin or anything under /admin without a token, redirect to /admin/login
          if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
            window.history.replaceState({}, '', '/admin/login');
          }
        }
        return;
      }

      try {
        const res = await fetch('/api/admin/verify', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.success) {
            setIsAuthenticated(true);
            // If already verified and currently at /admin/login, forward to /admin
            if (window.location.pathname === '/admin/login') {
              window.history.replaceState({}, '', '/admin');
            }
          } else {
            localStorage.removeItem('atelier_admin_token');
            setIsAuthenticated(false);
            if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
              window.history.replaceState({}, '', '/admin/login');
            }
          }
        }
      } catch {
        if (isMounted) {
          localStorage.removeItem('atelier_admin_token');
          setIsAuthenticated(false);
          if (window.location.pathname === '/admin' || window.location.pathname === '/admin/') {
            window.history.replaceState({}, '', '/admin/login');
          }
        }
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
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

      if (res.status >= 500) {
        setLoginError('System error; please try again.');
        return;
      }

      let data = null;
      try {
        const text = await res.text();
        if (text && text.trim()) {
          data = JSON.parse(text);
        }
      } catch {
        data = null;
      }

      if (data && data.success) {
        localStorage.setItem('atelier_admin_token', data.token);
        setIsAuthenticated(true);
        // Navigate from /admin/login to /admin
        window.history.pushState({}, '', '/admin');
      } else {
        setLoginError(getFriendlyErrorMessage(data?.message || 'Invalid username or password'));
      }
    } catch {
      setLoginError('System error; please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atelier_admin_token');
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
    window.history.pushState({}, '', '/admin/login');
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

          <div className="admin-auth-footer">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="admin-auth-back-btn"
            >
              <ArrowLeft size={13} /> Back to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Tabs Definition
  const adminTabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings & Appointments', icon: Calendar, badge: unreadCount > 0 ? `${unreadCount} NEW` : null },
    { id: 'schedule', label: 'Schedule & Time Slots', icon: CalendarClock },
    { id: 'services', label: 'Services & Pricing', icon: Sparkles },
    { id: 'gallery', label: 'Gallery & Portfolio', icon: Layers },
    { id: 'promotions', label: 'Holiday & Discount Pop-up', icon: ImageIcon },
    { id: 'vouchers', label: 'Vouchers & Promotions', icon: Ticket }
  ];

  const currentActiveTabObj = adminTabs.find((t) => t.id === activeTab) || adminTabs[0];
  const CurrentTabIcon = currentActiveTabObj.icon;

  // 2. Authenticated Admin Dashboard
  return (
    <div className="atelier-admin-root">
      {/* Top Navbar */}
      <header className="admin-navbar">
        <div className="admin-navbar__inner">
          <div className="admin-navbar__brand">
            <div className="admin-navbar__logo-badge">
              <img src="/images/logo-icon.png" alt="Fashion Nails Morley Logo" />
            </div>
            <div>
              <h1 className="admin-navbar__title">Fashion Nails Morley</h1>
              <div className="admin-navbar__subtitle">Admin Management Suite</div>
            </div>
          </div>

          <div className="admin-navbar__status-area">
            {/* Desktop Action Buttons */}
            <button
              type="button"
              className="admin-nav-action-btn admin-desktop-only"
              onClick={onBackToWebsite}
            >
              <ArrowLeft size={14} />
              <span>View Website</span>
            </button>

            <button
              type="button"
              className="admin-nav-action-btn admin-logout-btn admin-desktop-only"
              onClick={handleLogout}
              title="Log out from admin"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={`admin-hamburger-btn admin-mobile-only ${isMobileMenuOpen ? 'is-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              {unreadCount > 0 && !isMobileMenuOpen && (
                <span className="admin-hamburger-badge" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer / Offcanvas Menu */}
      {isMobileMenuOpen && (
        <div className="admin-mobile-drawer-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div
            className="admin-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Navigation Menu"
          >
            {/* Drawer Header */}
            <div className="admin-mobile-drawer__header">
              <div className="admin-navbar__brand">
                <div className="admin-navbar__logo-badge">
                  <img src="/images/logo-icon.png" alt="Logo" />
                </div>
                <div>
                  <div className="admin-mobile-drawer__title">Fashion Nails Morley</div>
                  <div className="admin-mobile-drawer__sub">Admin Suite</div>
                </div>
              </div>
              <button
                type="button"
                className="admin-mobile-drawer__close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Navigation Links */}
            <div className="admin-mobile-drawer__nav">
              <div className="admin-mobile-drawer__section-title">Navigation Menu</div>
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`admin-mobile-nav-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => switchTab(tab.id)}
                  >
                    <div className="admin-mobile-nav-item__left">
                      <span className={`admin-mobile-nav-item__icon ${isActive ? 'is-active' : ''}`}>
                        <Icon size={18} />
                      </span>
                      <span className="admin-mobile-nav-item__label">{tab.label}</span>
                    </div>
                    {tab.badge && (
                      <span className="admin-tab-count-badge">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="admin-mobile-drawer__footer">
              <button
                type="button"
                className="admin-mobile-drawer__action-btn"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onBackToWebsite();
                }}
              >
                <ArrowLeft size={16} />
                <span>View Website</span>
              </button>

              <button
                type="button"
                className="admin-mobile-drawer__action-btn admin-mobile-drawer__action-btn--logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabbed Container */}
      <main className="admin-container">
        {/* Mobile Active Tab Quick Bar */}
        <div
          className="admin-mobile-active-bar admin-mobile-only"
          onClick={() => setIsMobileMenuOpen(true)}
          role="button"
          tabIndex={0}
        >
          <div className="admin-mobile-active-bar__left">
            <CurrentTabIcon size={16} className="text-gold" />
            <span className="admin-mobile-active-bar__name">{currentActiveTabObj.label}</span>
            {currentActiveTabObj.badge && (
              <span className="admin-tab-count-badge">{currentActiveTabObj.badge}</span>
            )}
          </div>
          <span className="admin-mobile-active-bar__hint">Menu ▾</span>
        </div>

        {/* Desktop Navigation Tabs Ribbon */}
        <nav className="admin-tabs-nav admin-tabs-nav--desktop" aria-label="Admin Navigation Tabs">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => switchTab(tab.id)}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="admin-tab-count-badge" title={`${unreadCount} unviewed new appointments`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab View Content */}
        {activeTab === 'overview' && (
          <AdminOverview
            setActiveTab={(tab) => switchTab(tab)}
            onSelectBooking={(id) => switchTab('bookings', id)}
          />
        )}
        {activeTab === 'bookings' && (
          <AdminBookings
            targetBookingId={targetBookingId}
            onClearTarget={handleClearTarget}
          />
        )}
        {activeTab === 'schedule' && <AdminSchedule />}
        {activeTab === 'services' && <AdminServices />}
        {activeTab === 'gallery' && <AdminGallery />}
        {activeTab === 'promotions' && <AdminPromotions />}
        {activeTab === 'vouchers' && <AdminVouchers />}
      </main>

      {/* Realtime New Booking Floating Toast */}
      {liveToast && (
        <div className="admin-realtime-toast" role="alert">
          <div className="admin-realtime-toast__header">
            <div className="admin-realtime-toast__title-wrap">
              <span className="admin-pulse-dot admin-pulse-dot-amber" />
              <Bell size={18} className="admin-toast-bell-icon" />
              <span className="admin-realtime-toast__title">New Booking Received!</span>
            </div>
            <button
              type="button"
              onClick={dismissToast}
              className="admin-toast-dismiss-btn"
              title="Dismiss"
            >
              ✕
            </button>
          </div>

          {(() => {
            const todayStr = getPerthDateString(0);
            const tomorrowStr = getPerthDateString(1);
            const bDate = liveToast.booking.date || '';
            let badgeClass = 'admin-toast-badge--upcoming';
            let badgeText = `📅 Upcoming: ${bDate.split('-').reverse().join('-')}`;

            if (bDate === todayStr) {
              badgeClass = 'admin-toast-badge--today';
              badgeText = '⚡ Today';
            } else if (bDate === tomorrowStr) {
              badgeClass = 'admin-toast-badge--tomorrow';
              badgeText = '🗓️ Tomorrow';
            }

            return (
              <div className="admin-realtime-toast__body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <div className="admin-toast-client-name" style={{ margin: 0 }}>
                    {liveToast.booking.name}
                  </div>
                  <span className={`admin-toast-badge ${badgeClass}`}>
                    {badgeText}
                  </span>
                </div>
                {liveToast.booking.phone && (
                  <div className="admin-toast-phone">
                    📞 {liveToast.booking.phone}
                  </div>
                )}
                <div className="admin-toast-service">
                  ✨ {liveToast.booking.service}
                </div>
                <div className="admin-toast-datetime">
                  📅 Appointment: <strong>{bDate.split('-').reverse().join('-')}</strong> at <strong>{liveToast.booking.time}</strong>
                </div>
              </div>
            );
          })()}

          <div className="admin-realtime-toast__actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={dismissToast}
              className="admin-secondary-btn admin-toast-dismiss-btn"
            >
              Dismiss
            </button>
            <button
              type="button"
              className="admin-primary-btn admin-toast-view-btn"
              onClick={() => {
                const targetId = liveToast.booking.bookingId || liveToast.booking.id;
                dismissToast();
                switchTab('bookings', targetId);
              }}
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