import React from 'react';
import { Sparkles, RefreshCw, Plus } from 'lucide-react';

export function ServiceHeader({ totalServices, onResetDefaults, onOpenAdd }) {
  return (
    <div className="admin-services-top-header">
      <div className="admin-services-header-title-wrap">
        <div className="admin-services-header-icon-box">
          <Sparkles size={20} />
        </div>
        <div>
          <div className="admin-services-title-row">
            <h2 className="admin-card__title admin-services-header-title">
              Services & Live Pricing Catalog
            </h2>
            <span className="admin-services-count-badge">
              {totalServices} services
            </span>
          </div>
          <p className="admin-services-header-subtitle">
            Manage salon catalog items, categories, durations, prices & website visibility
          </p>
        </div>
      </div>

      <div className="admin-services-header-actions">
        <button
          type="button"
          className="admin-secondary-btn"
          onClick={onResetDefaults}
          title="Reset catalog to official salon defaults"
        >
          <RefreshCw size={14} />
          <span>Reset Defaults</span>
        </button>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={onOpenAdd}
        >
          <Plus size={16} />
          <span>Add New Service</span>
        </button>
      </div>
    </div>
  );
}

export default ServiceHeader;
