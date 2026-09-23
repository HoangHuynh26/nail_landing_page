import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <aside className="announcement-bar" aria-label="Location announcement">
      <div className="container announcement-bar__inner">
        <div className="announcement-bar__content">
          <MapPin size={13} className="announcement-bar__icon" aria-hidden="true" />
          <span>{t('announcement.text')}</span>
        </div>
        <a
          href="#location"
          onClick={(e) => {
            e.preventDefault();
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('lazy-section-mount', { detail: { id: 'all' } }));
            }
            setTimeout(() => {
              const el = document.getElementById('location');
              if (el) {
                const yOffset = -80;
                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
              }
            }, 40);
          }}
          className="announcement-bar__link"
        >
          {t('announcement.action')} →
        </a>
      </div>
    </aside>
  );
}
