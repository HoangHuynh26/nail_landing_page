import React from 'react';
import { MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export function AnnouncementBar() {
  const { t } = useLanguage();

  return (
    <aside className="announcement-bar" aria-label="Announcement">
      <div className="container announcement-bar__inner">
        <div className="announcement-bar__content">
          <MapPin size={13} className="announcement-bar__icon" aria-hidden="true" />
          <span>{t('announcement.text')}</span>
        </div>
        <a
          href="https://maps.google.com/?q=Morley+Galleria+Shopping+Centre+WA+6062"
          target="_blank"
          rel="noopener noreferrer"
          className="announcement-bar__link"
        >
          {t('announcement.action')} →
        </a>
      </div>
    </aside>
  );
}
