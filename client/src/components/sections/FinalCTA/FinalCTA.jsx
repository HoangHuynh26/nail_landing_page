import './FinalCTA.css';
import React from 'react';
import { Calendar, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';
import { Badge } from '../../ui/Badge/Badge';

export function FinalCTA() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  return (
    <section className="section final-cta-section" aria-label="Book Appointment Call to Action">
      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-card__bg-glow" aria-hidden="true" />

          <h2 className="final-cta-card__title">
            {t('finalCta.title')}
          </h2>

          <p className="final-cta-card__subtitle">
            {t('finalCta.subtitle')}
          </p>

          <div className="final-cta-card__action">
            <Button
              id="final-cta-book-btn"
              variant="primary"
              size="lg"
              onClick={() => openBooking()}
              icon={Calendar}
              className="final-cta-glow-btn"
            >
              {t('finalCta.btn')}
            </Button>
          </div>

          <div className="final-cta-card__perks">
            <span>
              <Clock size={13} className="final-cta__trust-icon" />
              No prepayment required
            </span>
            <span>
              <Calendar size={13} className="final-cta__trust-icon" />
              24h flexible rescheduling
            </span>
            <span>
              <ShieldCheck size={13} className="final-cta__trust-icon" />
              100% sterilized instruments
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
