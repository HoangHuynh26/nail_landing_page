import React from 'react';
import { Phone, MapPin, Clock, Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import FashionNailsLogo from '../common/FashionNailsLogo';

function InstagramIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function FacebookIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();

  const scrollTo = (id) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lazy-section-mount', { detail: { id: 'all' } }));
    }
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 40);
  };

  return (
    <footer className="atelier-footer" role="contentinfo">
      <div className="container atelier-footer__inner">
        <div className="atelier-footer__grid">
          {/* Brand & Mission Column */}
          <div className="atelier-footer__col atelier-footer__col--brand">
            <div style={{ marginBottom: '16px' }}>
              <FashionNailsLogo size="sm" showSub={true} />
            </div>
            <p className="atelier-footer__desc">
              Premier luxury nail boutique at Morley Galleria Shopping Centre, Western Australia. 100% autoclave sterilized instruments with 26 master treatments.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="atelier-footer__col">
            <h3 className="atelier-footer__heading">{t('nav.services')}</h3>
            <ul className="atelier-footer__links">
              <li>
                <button type="button" onClick={() => scrollTo('services')}>
                  Builder Gel - BIAB
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('services')}>
                  Acrylic Nails & Shellac
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('services')}>
                  Gel X Extensions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('services')}>
                  SNS Dipping Powder
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('pricing')}>
                  Official 26-Item Menu
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('gallery')}>
                  {t('nav.gallery')}
                </button>
              </li>
              <li>
                <button type="button" onClick={() => scrollTo('location')}>
                  {t('location.badge')}
                </button>
              </li>
            </ul>
          </div>

          {/* Salon Hours */}
          <div className="atelier-footer__col">
            <h3 className="atelier-footer__heading">{t('footer.hoursTitle')}</h3>
            <div className="atelier-footer__info-item">
              <Clock size={16} className="atelier-footer__icon" aria-hidden="true" />
              <div className="atelier-footer__hours-text">
                <p><strong>Mon – Wed, Fri – Sat:</strong> 9:00 AM – 5:30 PM</p>
                <p><strong>Thursday (Late Night):</strong> 9:00 AM – 7:00 PM</p>
                <p className="atelier-footer__muted"><strong>Sunday:</strong> 11:00 AM – 4:30 PM</p>
              </div>
            </div>
          </div>

          {/* Location & Social */}
          <div className="atelier-footer__col">
            <h3 className="atelier-footer__heading">{t('footer.contactTitle')}</h3>
            <div className="atelier-footer__info-item">
              <MapPin size={16} className="atelier-footer__icon" aria-hidden="true" />
              <address className="atelier-footer__address">
                Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre, Cnr Collier Rd & Walter Rd W, Morley WA 6062
              </address>
            </div>
            <div className="atelier-footer__info-item">
              <Phone size={16} className="atelier-footer__icon" aria-hidden="true" />
              <a href="tel:+61893752888" className="atelier-footer__link-phone">
                (08) 9375 2888
              </a>
            </div>

            {/* Verified Social Media Links */}
            <div className="atelier-footer__social-section">
              <h4 className="atelier-footer__social-title">{t('footer.socialTitle')}</h4>
              <div className="atelier-footer__social-links">
                <a
                  href="https://www.instagram.com/fashion_nails_morley/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram Fashion Nails Morley"
                  className="atelier-footer__social-btn"
                >
                  <InstagramIcon size={18} />
                </a>
                <a
                  href="https://www.facebook.com/FashionNailsMorley/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook Fashion Nails Morley"
                  className="atelier-footer__social-btn"
                >
                  <FacebookIcon size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hairline & Legal */}
        <div className="atelier-footer__bottom">
          <p className="atelier-footer__copyright">
            {t('footer.rights')}
          </p>
          <div className="atelier-footer__legal-links">
            <span>Morley Galleria, WA 6062</span>
            <span>•</span>
            <span style={{ color: 'var(--color-gold)' }}>10% Off Seniors, Students & Staff</span>
            <span>•</span>
            <span>Gift Vouchers Available</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
