import './StepService.css';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Clock, Check, Search, Sparkles, ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { servicesData } from '../../../data/services';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';
import { formatPrice } from '../../../utils/priceFormatter';

export function StepService() {
  const { language, t } = useLanguage();
  const { formData, updateFormData, setStep, services, categories } = useBooking();

  const catList = useMemo(() => {
    return (categories || []).filter(c => c.active !== false);
  }, [categories]);

  // Helper to resolve category key (defaults strictly to the first category)
  const resolveInitialCatKey = (list, preferred) => {
    if (preferred && preferred !== 'all') {
      const val = String(preferred).toLowerCase().trim();
      const match = list.find(c =>
        (c.id && c.id.toLowerCase() === val) ||
        (c.key && c.key.toLowerCase() === val) ||
        (c.name && c.name.toLowerCase() === val) ||
        (c.name_en && c.name_en.toLowerCase() === val) ||
        (c.label && c.label.toLowerCase() === val)
      );
      if (match) return match.id || match.key;
    }
    return list.length > 0 ? (list[0].id || list[0].key) : 'biab';
  };

  const [modalCat, setModalCat] = useState(() => {
    const active = (categories || []).filter(c => c.active !== false);
    return resolveInitialCatKey(active, formData.serviceCategory);
  });
  const [modalSearch, setModalSearch] = useState('');
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Ensure modalCat always defaults to the first category when categories load or if current is invalid
  useEffect(() => {
    if (catList.length === 0) return;
    const exists = catList.some(c => (c.id || c.key) === modalCat);
    if (!exists) {
      const defaultKey = resolveInitialCatKey(catList, formData.serviceCategory);
      setModalCat(defaultKey);
    }
  }, [catList, modalCat, formData.serviceCategory]);

  // Active services from DB/API with fallback
  const activeServices = useMemo(() => {
    return (services && services.length > 0) ? services : servicesData;
  }, [services]);

  const filtered = useMemo(() => {
    return activeServices.filter(s => {
      if (s.active === false) return false;

      if (modalSearch.trim()) {
        const q = modalSearch.toLowerCase().trim();
        const name = (s.name || s.name_en || '').toLowerCase();
        const cat = (s.category || '').toLowerCase();
        return name.includes(q) || cat.includes(q);
      }
      if (!modalCat || modalCat === 'all') return true;
      return (s.category || '').toLowerCase() === modalCat.toLowerCase();
    });
  }, [activeServices, modalCat, modalSearch]);

  const getCatLabel = (cat) => {
    return cat.short_name || cat.label || cat.name || cat.name_en || cat.id || cat.key;
  };

  const currentCatObj = catList.find(c => (c.id || c.key) === modalCat) || (catList.length > 0 ? catList[0] : null);
  const currentCatLabel = currentCatObj ? getCatLabel(currentCatObj) : (catList.length > 0 ? getCatLabel(catList[0]) : 'Select Category');

  const handleSelect = (service) => {
    const serviceName = service.name || service.name_en;

    const catObj = (categories || []).find(c => (c.id || c.key) === service.category);
    const catName = catObj ? (catObj.name || catObj.name_en || catObj.label) : service.category;

    updateFormData({
      serviceId: service.id,
      serviceName: serviceName,
      serviceCategory: catName || service.category || '',
      servicePrice: Number(service.price),
      serviceDuration: Number(service.duration)
    });
  };

  const handleNext = () => {
    setStep(2);
  };

  return (
    <div className="booking-step booking-step--service">
      <h3 className="booking-step__heading">{t('booking.step1')}</h3>
      <p className="booking-step__desc">{t('booking.selectServicePrompt')}</p>

      {/* Filter Bar: Quick Search & Custom Mobile-Safe Category Dropdown */}
      <div className="booking-filter-row">
        {/* Quick Search */}
        <div className="booking-search-box">
          <Search size={15} className="booking-search-icon" />
          <input
            type="text"
            value={modalSearch}
            onChange={(e) => setModalSearch(e.target.value)}
            placeholder="Search service..."
            className="booking-search-input"
          />
          {modalSearch && (
            <button
              type="button"
              className="booking-search-clear-btn"
              onClick={() => setModalSearch('')}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Dropdown (Mobile-Safe, 100% Contained) */}
        <div className="booking-cat-select-wrap" ref={dropdownRef}>
          <button
            type="button"
            className={`booking-cat-trigger ${isCatDropdownOpen ? 'is-open' : ''}`}
            onClick={() => setIsCatDropdownOpen(prev => !prev)}
            aria-haspopup="listbox"
            aria-expanded={isCatDropdownOpen}
          >
            <div className="booking-cat-trigger__left">
              <SlidersHorizontal size={14} className="booking-cat-select-icon" />
              <span className="booking-cat-trigger__label">{currentCatLabel}</span>
            </div>
            <ChevronDown
              size={15}
              className={`booking-cat-select-arrow ${isCatDropdownOpen ? 'is-rotated' : ''}`}
            />
          </button>

          {isCatDropdownOpen && (
            <div className="booking-cat-menu" role="listbox">

              {catList.map(c => {
                const key = c.id || c.key;
                const count = activeServices.filter(s => s.active !== false && s.category === key).length;
                const isSelected = modalCat === key;
                return (
                  <button
                    key={key}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`booking-cat-item ${isSelected ? 'is-active' : ''}`}
                    onClick={() => {
                      setModalCat(key);
                      setIsCatDropdownOpen(false);
                      if (modalSearch) setModalSearch('');
                    }}
                  >
                    <span className="booking-cat-item__name">{getCatLabel(c)}</span>
                    {count > 0 && (
                      <span className="booking-cat-item__count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="booking-service-list booking-service-list-scroll" role="radiogroup" aria-label="Services list">
        {filtered.length === 0 ? (
          <div className="booking-service-empty" style={{ textAlign: 'center', padding: '36px 16px' }}>
            <Sparkles size={24} style={{ color: 'var(--color-gold, #c69255)', margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a', margin: '0 0 4px' }}>Upcoming service</p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>New treatments in this category will be available soon.</p>
          </div>
        ) : (
          filtered.map(service => {
            const isSelected = formData.serviceId === service.id;
            const name = service.name || service.name_en;
            const desc = service.description || service.description_en || '';
            const pricePrefix = service.pricePrefix || service.price_prefix || '';

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
                      {pricePrefix ? `${pricePrefix}$${formatPrice(service.price)}` : `$${formatPrice(service.price)}`} AUD
                    </span>
                  </div>
                  {desc && <p className="booking-service-item__desc">{desc}</p>}
                  <div className="booking-service-item__duration">
                    <Clock size={13} />
                    <span>{service.duration} {t('services.durationUnit')}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
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
