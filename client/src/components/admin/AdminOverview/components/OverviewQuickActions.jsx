import React from 'react';
import { Users, Calendar, CalendarClock, Sparkles, Layers, Tag, Ticket, ArrowRight } from 'lucide-react';

export function OverviewQuickActions({ setActiveTab }) {
  const handleNav = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h3 className="admin-card__title">
          <Users size={18} className="text-gold" />
          <span>Quick Actions</span>
        </h3>
      </div>

      <div className="admin-quick-actions-list">
        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('bookings')}
        >
          <span className="admin-quick-action-label">
            <Calendar size={16} className="text-gold" />
            <span>View All Appointments</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>

        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('schedule')}
        >
          <span className="admin-quick-action-label">
            <CalendarClock size={16} className="text-gold" />
            <span>Lock / Manage Dates & Time Slots</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>

        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('services')}
        >
          <span className="admin-quick-action-label">
            <Sparkles size={16} className="text-gold" />
            <span>Manage Services & Pricing</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>

        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('gallery')}
        >
          <span className="admin-quick-action-label">
            <Layers size={16} className="text-gold" />
            <span>Manage Gallery & 3D Portfolio</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>

        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('promotions')}
        >
          <span className="admin-quick-action-label">
            <Tag size={16} className="text-gold" />
            <span>Schedule Holiday Pop-up Poster</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>

        <button
          type="button"
          className="admin-quick-action-btn"
          onClick={() => handleNav('vouchers')}
        >
          <span className="admin-quick-action-label">
            <Ticket size={16} className="text-gold" />
            <span>Vouchers & Discount Promotions</span>
          </span>
          <ArrowRight size={15} className="admin-quick-action-arrow" />
        </button>
      </div>
    </div>
  );
}

export default OverviewQuickActions;
