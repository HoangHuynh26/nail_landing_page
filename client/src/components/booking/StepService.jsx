import React, { useState, useMemo } from 'react';
import { Clock, Check, Search } from 'lucide-react';
import { servicesData } from '../../data/services';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

export function StepService() {
  const { language, t } = useLanguage();
  const { formData, updateFormData, setStep } = useBooking();
  const [modalCat, setModalCat] = useState('biab');
  const [modalSearch, setModalSearch] = useState('');

  const categories = [
    { key: 'biab', label: 'BIAB' },
    { key: 'acrylic', label: 'Acrylic' },
    { key: 'shellac', label: 'Shellac' },
    { key: 'gelx', label: 'Gel X' },
    { key: 'sns', label: 'SNS' },
    { key: 'polish', label: 'Polish' },
    { key: 'extra', label: 'Extra' }
  ];

  const filtered = useMemo(() => {
    return servicesData.filter(s => {
      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        return (
          s.name_en.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }
      return s.category === modalCat;
    });
  }, [modalCat, modalSearch]);

  const handleSelect = (service) => {
    updateFormData({
      serviceId: service.id,
      serviceName: service.name_en,
      servicePrice: service.price,
      serviceDuration: service.duration
    });
  };

  const handleNext = () => {
    setStep(2);
  };

  return (
    <div className="booking-step booking-step--service">
      <h3 className="booking-step__heading">{t('booking.step1')}</h3>
      <p className="booking-step__desc">{t('booking.selectServicePrompt')}</p>

      {/* Quick Search in Modal */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <input
          type="text"
          value={modalSearch}
          onChange={(e) => setModalSearch(e.target.value)}
          placeholder="Search service..."
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            borderRadius: '9999px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            fontSize: '0.875rem'
          }}
        />
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
      </div>

      {/* Category Filter Pills in Modal */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '12px' }}>
        {categories.map(c => (
          <button
            key={c.key}
            type="button"
            onClick={() => setModalCat(c.key)}
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              border: '1px solid',
              borderColor: modalCat === c.key ? 'var(--color-gold)' : 'var(--color-border)',
              background: modalCat === c.key ? 'var(--color-gold)' : 'var(--color-surface)',
              color: modalCat === c.key ? '#000' : 'var(--color-text-secondary)',
              cursor: 'pointer'
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="booking-service-list" role="radiogroup" aria-label="Services list" style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {filtered.map(service => {
          const isSelected = formData.serviceId === service.id;
          const name = service.name_en;
          const desc = service.description_en;

          return (
            <div
              key={service.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              className={`booking-service-item ${isSelected ? 'is-selected' : ''}`}
              onClick={() => handleSelect(service)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(service);
                }
              }}
            >
              <div className="booking-service-item__check">
                {isSelected ? <Check size={14} /> : null}
              </div>

              <div className="booking-service-item__info">
                <div className="booking-service-item__top">
                  <h4 className="booking-service-item__name">{name}</h4>
                  <span className="booking-service-item__price">
                    {service.pricePrefix ? `${service.pricePrefix}$${service.price}` : `$${service.price}`} AUD
                  </span>
                </div>
                <p className="booking-service-item__desc">{desc}</p>
                <div className="booking-service-item__duration">
                  <Clock size={13} />
                  <span>{service.duration} {t('services.durationUnit')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="booking-step__nav">
        <div />
        <Button
          id="step1-next-btn"
          variant="primary"
          size="md"
          onClick={handleNext}
        >
          {t('booking.nextBtn')} →
        </Button>
      </div>
    </div>
  );
}
