import React from 'react';
import { Calendar, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import FlickerText from '../common/FlickerText';

export function FinalCTA() {
  const { language, t } = useLanguage();
  const { openBooking } = useBooking();

  return (
    <section className="section final-cta-section" aria-label="Book Appointment Call to Action">
      <div className="container">
        <div className="final-cta-card">
          <div className="final-cta-card__bg-glow" aria-hidden="true" />
          
          <Badge variant="gold" className="final-cta-card__badge">
            <Sparkles size={13} style={{ marginRight: '6px' }} />
            {t('finalCta.badge')}
          </Badge>

          {/* Originkit FlickerText Header for CTA */}
          <div className="final-cta-flicker-wrapper">
            <FlickerText
              tag="h2"
              text={t('finalCta.title')}
              colorMode="gradient"
              gradientStart="#FFE8B2"
              gradientEnd="#D4AF37"
              gradientAngle={135}
              fontColor="#D4AF37"
              className="final-cta-card__title"
              font={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(1.75rem, 4vw, 2.65rem)",
                lineHeight: "1.28em",
                letterSpacing: "-0.015em",
                textAlign: "center",
                display: "inline-block",
                width: "100%",
              }}
              textEnterFlickerEnabled={true}
              textHoverFlickerEnabled={true}
              flicker={{
                position: "middle",
                replay: "yes",
                restState: "filled",
                delay: 0.1,
                ease: { type: "tween", duration: 1.8, ease: "easeInOut" },
                flickerCount: 8,
                showStroke: true,
                strokePosition: "start",
                strokeCount: 2,
                strokeColor: "#E2C376",
                strokeWidth: 1.5,
                wordFlickerEnabled: true,
                shakeEnabled: false,
                letterFlickerEnabled: true,
                letterFlickerMode: "stroke",
                letterFlickerIntensity: 10,
                letterFlickerOpacity: 35,
              }}
              flickerHover={{
                ease: { type: "tween", duration: 1.1, ease: "easeInOut" },
                flickerCount: 4,
                showStroke: true,
                strokePosition: "middle",
                strokeCount: 1,
                strokeColor: "#F3BAA8",
                strokeWidth: 1.5,
                wordFlickerEnabled: false,
                shakeEnabled: false,
                letterFlickerEnabled: true,
                letterFlickerMode: "stroke",
                letterFlickerIntensity: 12,
                letterFlickerOpacity: 45,
              }}
            />
          </div>

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
              <Clock size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {language === 'vi' ? 'Không cần cọc trước' : 'No prepayment required'}
            </span>
            <span>
              <Calendar size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {language === 'vi' ? 'Đổi giờ linh hoạt' : '24h flexible rescheduling'}
            </span>
            <span>
              <ShieldCheck size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
              {language === 'vi' ? '100% Dụng cụ tiệt trùng' : '100% sterilized instruments'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
