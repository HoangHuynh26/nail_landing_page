import React from 'react';
import { Layers, Eye, EyeOff, Sparkles } from 'lucide-react';

export function GalleryStatsCards({ totalCount, activeCount, hiddenCount, categoriesCount }) {
  return (
    <div className="admin-stats-grid">
      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap gold">
          <Layers size={24} />
        </div>
        <div>
          <div className="admin-stat-num">{totalCount}</div>
          <div className="admin-stat-label">Total Showcases</div>
          <div className="admin-gallery-stat-gold">
            Real client portfolio
          </div>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap green">
          <Eye size={24} />
        </div>
        <div>
          <div className="admin-stat-num">{activeCount}</div>
          <div className="admin-stat-label">Live on Website</div>
          <div className="admin-gallery-stat-green">
            Visible in 3D Carousel
          </div>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap amber">
          <EyeOff size={24} />
        </div>
        <div>
          <div className="admin-stat-num">{hiddenCount}</div>
          <div className="admin-stat-label">Hidden / Drafts</div>
          <div className="admin-gallery-stat-amber">
            Not shown to visitors
          </div>
        </div>
      </div>

      <div className="admin-stat-card">
        <div className="admin-stat-icon-wrap purple">
          <Sparkles size={24} />
        </div>
        <div>
          <div className="admin-stat-num admin-gallery-stat-num-sm">
            {categoriesCount} STYLES
          </div>
          <div className="admin-stat-label">Bespoke Nail Art Collections</div>
          <div className="admin-gallery-stat-purple">
            Live client portfolios
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryStatsCards;
