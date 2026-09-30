import React from 'react';
import { Calendar, CheckCircle2, Clock, X, DollarSign } from 'lucide-react';

export function BookingStatsCards({ stats, todayBookingsCount }) {
  return (
    <div className="admin-stats-grid">
      {/* Card 1: Total Bookings */}
      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap gold">
          <Calendar size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.total ?? 0}</div>
          <div className="admin-stat-label">Total Bookings</div>
          <div className="admin-stat-subtext">All appointments received</div>
        </div>
      </div>

      {/* Card 2: Confirmed Appointments */}
      <div className="admin-stat-card">
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

      {/* Card 3: Pending Review */}
      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap amber">
          <Clock size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.pending ?? 0}</div>
          <div className="admin-stat-label">Pending Review</div>
          <div className={`admin-stat-subtext ${stats?.pending > 0 ? 'admin-stat-subtext--amber' : ''}`}>
            {stats?.pending > 0 ? `${stats.pending} awaiting confirmation` : 'All caught up'}
          </div>
        </div>
      </div>

      {/* Card 4: Cancelled */}
      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap rose">
          <X size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num">{stats?.cancelled ?? 0}</div>
          <div className="admin-stat-label">Cancelled / Declined</div>
          <div className="admin-stat-subtext">Client cancellations</div>
        </div>
      </div>

      {/* Card 5: Today's Appointments */}
      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap gold-gradient">
          <Calendar size={24} />
        </div>
        <div className="admin-stat-info">
          <div className="admin-stat-num gold">{todayBookingsCount}</div>
          <div className="admin-stat-label">Today's Appointments</div>
          <div className="admin-stat-subtext admin-stat-subtext--emerald">Perth Time (AWST)</div>
        </div>
      </div>
    </div>
  );
}

export default BookingStatsCards;
