import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Car,
  Sparkles,
  Info,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getPerthNow } from '../../utils/perthTime';

/**
 * =========================================================================
 * SALON LOCATION CONFIGURATION
 * NOTE: Bạn có thể dễ dàng cập nhật lại thông tin địa chỉ, giờ mở cửa & liên hệ ở đây:
 * =========================================================================
 */
export const LOCATION_CONFIG = {
  // Brand & Mall info
  salonName: 'Fashion Nails',
  mallName: 'Morley Galleria Shopping Centre',
  unitLocation: 'Opposite Kmart, Galleria shopping Centre, corner Collier Rd &, Walter Rd W, Morley Western Australia',
  street: 'Collier Road & Russell Street',
  suburb: 'Morley',
  state: 'WA',
  postcode: '6062',
  country: 'Australia',

  // Full formatted address
  fullAddress: 'Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre, Collier Rd & Russell St, Morley WA 6062, Australia',

  // Helpful visitor access notes
  parkingTip: 'Free multi-deck and ground parking directly outside the Kmart & Target mall entrances.',
  interiorTip: 'Located on Level 1, directly opposite Kmart. Look for our crystal chandeliers and pink marble manicure bars.',

  // Contact details
  phoneDisplay: '(08) 9375 2888',
  phoneTel: '+61893752888',
  email: 'nataliepham1993@gmail.com',

  // Weekly opening hours
  hours: [
    { dayGroup: 'Monday – Wednesday', hours: '9:00 AM – 5:30 PM', isLate: false },
    { dayGroup: 'Thursday (Late Night)', hours: '9:00 AM – 7:00 PM', isLate: true, badge: 'Late Night' },
    { dayGroup: 'Friday – Saturday', hours: '9:00 AM – 5:30 PM', isLate: false },
    { dayGroup: 'Sunday', hours: '11:00 AM – 4:30 PM', isLate: false }
  ],

  // Google Maps interactive embed & direct navigation directions
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3387.618!2d115.8950187!3d-31.8970273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2a32b07d9c6d66f1%3A0x666e048b782d5d7a!2sFashion%20Nails!5e0!3m2!1sen!2sau!4v1711181234567!5m2!1sen!2sau',
  directionsUrl: 'https://www.google.com/maps/place/Fashion+Nails/@-31.8970273,115.8950187,17z/data=!3m2!4b1!5s0x2a32b07d8b01e6d9:0x55f0c5881a2ec5f5!4m6!3m5!1s0x2a32b07d9c6d66f1:0x666e048b782d5d7a!8m2!3d-31.8970273!4d115.8975936!16s%2Fg%2F11dx8_j1f9?entry=ttu'
};

export function Location() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const [copied, setCopied] = useState(false);

  // Copy address to clipboard with micro feedback
  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(LOCATION_CONFIG.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Determine real-time open status in Western Australia (Perth / AWST)
  const salonStatus = useMemo(() => {
    try {
      const perth = getPerthNow();
      const [y, m, d] = perth.isoDate.split('-').map((n) => parseInt(n, 10));
      const dayOfWeek = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sun, 1 = Mon, ..., 4 = Thu, 6 = Sat
      const currentMin = perth.totalMinutes;

      let openMin = 9 * 60; // 9:00 AM
      let closeMin = 17 * 60 + 30; // 5:30 PM

      if (dayOfWeek === 4) {
        // Thursday late night: 9:00 AM - 7:00 PM
        closeMin = 19 * 60;
      } else if (dayOfWeek === 0) {
        // Sunday: 11:00 AM - 4:30 PM
        openMin = 11 * 60;
        closeMin = 16 * 60 + 30;
      }

      const isOpen = currentMin >= openMin && currentMin < closeMin;
      return {
        isOpen,
        label: isOpen ? 'Open Now' : 'Closed Now',
        subtext: isOpen
          ? `Welcoming walk-ins & appointments until ${dayOfWeek === 4 ? '7:00 PM' : dayOfWeek === 0 ? '4:30 PM' : '5:30 PM'}`
          : `Opens ${dayOfWeek === 0 ? '11:00 AM' : '9:00 AM'} AWST`
      };
    } catch {
      return {
        isOpen: true,
        label: 'Open Today',
        subtext: '7 Days a Week at Morley Galleria'
      };
    }
  }, []);

  return (
    <section id="location" className="section location-section" aria-label="Salon Location and Opening Hours">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <h2 className="section-title location-title">
            {t('location.title')}
          </h2>
          <p className="section-subtitle location-subtitle">
            {t('location.subtitle')}
          </p>
        </div>

        {/* Main Location Grid: Info Cards (Left) + Interactive Map (Right) */}
        <div className="location-grid">
          {/* ================= LEFT COLUMN: INFO CARDS ================= */}
          <div className="location-info-col">
            {/* 1. Address Card */}
            <div className="location-card location-card--address">
              <div className="location-card__header">
                <div className="location-card__icon-box">
                  <MapPin size={20} className="location-card__icon" />
                </div>
                <div>
                  <h3 className="location-card__title">{t('location.addressTitle')}</h3>
                </div>
              </div>

              <div className="location-card__body">
                <address className="location-address-text">
                  <strong className="location-unit-highlight">{LOCATION_CONFIG.unitLocation}</strong>
                </address>
              </div>

              {/* Action Buttons: Primary Get Directions CTA + Copy Address */}
              <div className="location-card__actions">
                <a
                  href={LOCATION_CONFIG.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary btn--md location-directions-cta"
                  id="location-get-directions-btn"
                  aria-label="Get Directions to Fashion Nails on Google Maps"
                >
                  <Navigation size={16} />
                  <span>{t('location.getDirections')}</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className={`btn btn--secondary btn--md location-copy-btn ${copied ? 'is-copied' : ''}`}
                  aria-label="Copy salon address to clipboard"
                >
                  {copied ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <Copy size={16} />}
                  <span>{copied ? t('location.addressCopied') : t('location.copyAddress')}</span>
                </button>
              </div>
            </div>

            {/* 2. Opening Hours Card */}
            <div className="location-card location-card--hours">
              <div className="location-card__header">
                <div className="location-card__icon-box">
                  <Clock size={20} className="location-card__icon" />
                </div>
                <div className="location-hours-header-info">
                  <h3 className="location-card__title">{t('location.hoursTitle')}</h3>
                  <div className="location-live-status">
                    <span className={`location-status-dot ${salonStatus.isOpen ? 'is-open' : 'is-closed'}`} />
                    <span className="location-status-text">{salonStatus.label}</span>
                  </div>
                </div>
              </div>

              <div className="location-card__body">
                <ul className="location-hours-list">
                  {LOCATION_CONFIG.hours.map((item, idx) => (
                    <li
                      key={idx}
                      className={`location-hours-row ${item.isLate ? 'is-late-night' : ''}`}
                    >
                      <span className="location-hours-day">
                        {item.dayGroup}
                        {item.badge && (
                          <span className="location-late-badge">{item.badge}</span>
                        )}
                      </span>
                      <span className="location-hours-time">{item.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Contact Info Card (Phone & Email) */}
            <div className="location-card location-card--contact">
              <div className="location-card__header">
                <div className="location-card__icon-box">
                  <Phone size={20} className="location-card__icon" />
                </div>
                <div>
                  <h3 className="location-card__title">{t('location.contactTitle')}</h3>
                </div>
              </div>

              <div className="location-card__body location-contact-grid">
                {/* Phone Box */}
                <div className="location-contact-item">
                  <div className="location-contact-item__meta">
                    <span className="location-contact-lbl">{t('location.phone')}</span>
                    <a
                      href={`tel:${LOCATION_CONFIG.phoneTel}`}
                      className="location-contact-val location-contact-val--phone"
                    >
                      {LOCATION_CONFIG.phoneDisplay}
                    </a>
                  </div>
                  <a
                    href={`tel:${LOCATION_CONFIG.phoneTel}`}
                    className="btn btn--secondary btn--sm location-contact-action"
                  >
                    <Phone size={13} />
                    <span>{t('location.callNow')}</span>
                  </a>
                </div>

                {/* Email Box */}
                <div className="location-contact-item">
                  <div className="location-contact-item__meta">
                    <span className="location-contact-lbl">{t('location.email')}</span>
                    <a
                      href={`mailto:${LOCATION_CONFIG.email}`}
                      className="location-contact-val location-contact-val--email"
                    >
                      {LOCATION_CONFIG.email}
                    </a>
                  </div>
                  <a
                    href={`mailto:${LOCATION_CONFIG.email}`}
                    className="btn btn--secondary btn--sm location-contact-action"
                  >
                    <Mail size={13} />
                    <span>{t('location.sendEmail')}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: GOOGLE MAPS CARD ================= */}
          <div className="location-map-col">
            <div className="location-map-card">
              {/* Map Header Overlay */}
              <div className="location-map-card__top">
                <div className="location-map-brand">
                  <span className="location-map-monogram" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/images/logo-icon.png" alt="Fashion Nails" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                  </span>
                  <div>
                    <h4 className="location-map-salon-title">{LOCATION_CONFIG.salonName}</h4>
                    <span className="location-map-salon-loc">{LOCATION_CONFIG.mallName}</span>
                  </div>
                </div>

                <a
                  href={LOCATION_CONFIG.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-map-external-link"
                  title="Open in Google Maps"
                >
                  <span>{t('location.openGoogleMaps')}</span>
                  <ExternalLink size={14} />
                </a>
              </div>

              {/* Interactive Google Maps Embed */}
              <div className="location-map-frame-wrapper">
                <iframe
                  title="Fashion Nails Morley Galleria Google Maps Location"
                  src={LOCATION_CONFIG.mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="location-map-iframe"
                />
              </div>

              {/* Map Card Bottom Footer / Quick Action */}
              <div className="location-map-card__bottom">
                <div className="location-map-tip">
                  <Info size={16} className="location-map-tip-icon" />
                  <span>{t('location.interiorTip')}</span>
                </div>

                <div className="location-map-quick-ctas">
                  <a
                    href={LOCATION_CONFIG.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary btn--sm location-map-cta-btn"
                  >
                    <Navigation size={14} />
                    <span>{t('location.getDirections')}</span>
                  </a>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openBooking()}
                    icon={Calendar}
                  >
                    {t('hero.primaryCta')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Location;
