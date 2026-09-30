import React from 'react';
import { Calendar, Clock, CheckCircle2, Sparkles, DollarSign } from 'lucide-react';

export function OverviewStatCards({ stats, isTodayFiltered, hasDateFilter, activePromo, activePromos = [], setActiveTab }) {
  const handleNav = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const promoCount = Array.isArray(activePromos) && activePromos.length > 0
    ? activePromos.length
    : (activePromo ? 1 : 0);

  return (
    <div className="admin-stats-grid">
      {/* Card 1: Today's Bookings */}
      <div
        className="admin-stat-card admin-stat-card--interactive"
        onClick={() => handleNav('bookings')}
        title="View All Bookings"
      >
        <div className="admin-stat-icon-wrap gold">
          <Calendar size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.total ?? 0}</div>
          <div className="admin-stat-label">
            {isTodayFiltered ? "Today's Bookings" : (hasDateFilter ? 'Filtered Bookings' : 'Total Bookings')}
          </div>
          <div className="admin-stat-subtext">
            {isTodayFiltered ? 'Bookings today' : (hasDateFilter ? 'In filtered period' : 'All bookings')}
          </div>
        </div>
      </div>

      {/* Card 2: Pending Approval */}
      <div
        className="admin-stat-card admin-stat-card--interactive"
        onClick={() => handleNav('bookings')}
        title="View Pending Bookings"
      >
        <div className="admin-stat-icon-wrap amber">
          <Clock size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.pending ?? 0}</div>
          <div className="admin-stat-label">Pending Approval</div>
          <div className={`admin-stat-subtext ${stats?.pending > 0 ? 'admin-stat-subtext--amber' : ''}`}>
            {stats?.pending > 0 ? `${stats.pending} awaiting review` : 'All caught up'}
          </div>
        </div>
      </div>

      {/* Card 3: Confirmed Appointments */}
      <div
        className="admin-stat-card admin-stat-card--interactive"
        onClick={() => handleNav('bookings')}
        title="View Confirmed Bookings"
      >
        <div className="admin-stat-icon-wrap green">
          <CheckCircle2 size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.confirmed ?? 0}</div>
          <div className="admin-stat-label">Confirmed Appointments</div>
          <div className="admin-stat-subtext admin-stat-subtext--emerald">
            {stats?.completed ?? 0} completed
          </div>
        </div>
      </div>

      {/* Card 4: Inactive / Active Promo Banner */}
      <div
        className="admin-stat-card admin-stat-card--interactive"
        onClick={() => handleNav('promotions')}
        title="Manage Holiday Pop-up Banner"
      >
        <div className="admin-stat-icon-wrap purple">
          <Sparkles size={24} />
        </div>
        <div className="admin-stat-info">
          <div className={`admin-stat-num admin-stat-num--status ${promoCount > 0 ? 'is-active' : 'is-inactive'}`}>
            {promoCount > 1 ? `${promoCount} ACTIVE` : (promoCount === 1 ? 'ACTIVE' : 'INACTIVE')}
          </div>
          <div className="admin-stat-label">Holiday Pop-up Banner</div>
          <div className={`admin-stat-subtext ${promoCount > 0 ? 'admin-stat-subtext--emerald' : 'admin-stat-subtext--muted'}`}>
            {promoCount > 1
              ? `${promoCount} pop-ups running live`
              : (activePromo ? (activePromo.title || 'Live on site') : 'No active pop-up')}
          </div>
        </div>
      </div>

      {/* Card 5: Statistic Price (Revenue) */}
      <div
        className="admin-stat-card admin-stat-card--price admin-stat-card--interactive"
        onClick={() => handleNav('bookings')}
        title="View Bookings Revenue"
      >
        <div className="admin-stat-icon-wrap gold-gradient">
          <DollarSign size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num gold">
            ${stats?.revenue?.total != null ? stats.revenue.total.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'}
          </div>
          <div className="admin-stat-label">Statistic Price</div>
          <div className="admin-stat-subtext admin-stat-subtext--emerald">
            ${stats?.revenue?.completed != null ? stats.revenue.completed.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'} completed
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewStatCards;
