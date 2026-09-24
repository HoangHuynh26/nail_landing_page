import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, Sparkles, Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { servicesData } from '../../data/services';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';

import SlideFillButton from '../common/SlideFillButton';
import { rankAndFilterServices } from '../../utils/searchServices';

export function Services() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const [activeCategory, setActiveCategory] = useState('biab');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveServices, setLiveServices] = useState(servicesData);

  useEffect(() => {
    fetch('/api/services?active=true')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.services) && data.services.length > 0) {
          setLiveServices(data.services);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { key: 'biab', label: t('services.tabBiab') },
    { key: 'acrylic', label: t('services.tabAcrylic') },
    { key: 'shellac', label: t('services.tabShellac') },
    { key: 'gelx', label: t('services.tabGelX') },
    { key: 'sns', label: t('services.tabSns') },
    { key: 'polish', label: t('services.tabPolish') },
    { key: 'extra', label: t('services.tabExtra') }
  ];

  const isSearching = searchQuery.trim().length > 0;

  // Search across all services ranked by best match
  const filteredServices = useMemo(() => {
    return rankAndFilterServices(liveServices, searchQuery, activeCategory);
  }, [liveServices, activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    categories.forEach(c => {
      counts[c.key] = liveServices.filter(s => s.category === c.key).length;
    });
    return counts;
  }, [categories, liveServices]);

  const categoryMap = useMemo(() => {
    return Object.fromEntries(categories.map(c => [c.key, c.label]));
  }, [categories]);

  const activeCategoryObj = useMemo(() => {
    return categories.find(c => c.key === activeCategory) || categories[0];
  }, [categories, activeCategory]);

  return (
    <section id="services" className="section services-section" aria-labelledby="services-heading">
      <div className="container">
        <SectionHeader
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />

        {/* Sticky Search Input Bar */}
        <div className="services-search-sticky-wrap">
          <div className="services-search-container">
            <div className="services-search-input-wrapper">
              <Search className="services-search-icon" size={18} />
              <input
                id="services-search-input-field"
                type="text"
                className="services-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services (e.g., BIAB, Acrylic, Shellac, Cat eye, French...)"
                aria-label="Search treatments"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="services-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Search Match Feedback Pill */}
            {isSearching && (
              <div className="services-search-feedback-wrap">
                <div className="services-search-feedback" role="status" aria-live="polite">
                  <Sparkles size={13} className="services-search-feedback-icon" />
                  <span>
                    Found <strong>{filteredServices.length}</strong> best matching services
                  </span>
                  <button
                    type="button"
                    className="services-search-reset-link"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Bar */}
        <div className="services-mobile-filter-box">
          

          {/* Single-row horizontal swipe pill track */}
          <div className="services-mobile-pills-row" role="tablist" aria-label="Service categories quick swipe">
            {categories.map(cat => {
              const isSelected = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  className={`services-mobile-pill-btn ${isSelected ? 'is-active' : ''}`}
                  onClick={() => {
                    setActiveCategory(cat.key);
                    if (searchQuery) setSearchQuery('');
                  }}
                >
                  <span>{cat.label}</span>
                  <span className="services-mobile-pill-count">
                    {categoryCounts[cat.key]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Desktop Category Tabs (Hidden on mobile) */}
        <div className="services-tabs services-tabs--desktop" role="tablist" aria-label="Service categories">
          {categories.map(cat => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.key}
              className={`services-tabs__btn ${activeCategory === cat.key ? 'is-active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.key);
                if (searchQuery) setSearchQuery('');
              }}
            >
              <span>{cat.label}</span>
              <span className="services-tabs__btn-count">({categoryCounts[cat.key]})</span>
            </button>
          ))}
        </div>

        {/* Services Grid or Empty State */}
        {filteredServices.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            background: 'var(--color-surface-soft)',
            borderRadius: 'var(--radius-lg)',
            border: '1px dashed var(--color-border)',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
              No matching services found
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
              Try adjusting your search terms or clearing the filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
            >
              View all services
            </Button>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map(service => {
              const name = service.name_en;
              const desc = service.description_en;

              return (
                <article key={service.id} className={`service-card ${service.featured ? 'service-card--featured' : ''}`}>
                  {service.featured && (
                    <span className="service-card__featured-pill">
                      <span>Popular</span>
                    </span>
                  )}

                  <div className="service-card__header">
                    {isSearching && (
                      <span className="service-card__category-tag">
                        {categoryMap[service.category] || service.category}
                      </span>
                    )}
                    <h3 className="service-card__title">{name}</h3>
                    <p className="service-card__desc">{desc}</p>
                  </div>

                  <div className="service-card__meta">
                    <div className="service-card__duration">
                      <Clock size={15} aria-hidden="true" />
                      <span>{service.duration} {t('services.durationUnit')}</span>
                    </div>
                    <div className="service-card__price">
                      {service.pricePrefix && (
                        <span className="service-card__price-prefix">{service.pricePrefix}</span>
                      )}
                      <span className="service-card__price-value">${service.price}</span>
                      <span className="service-card__currency">AUD</span>
                    </div>
                  </div>

                  <div className="service-card__action">
                    <SlideFillButton
                      fullWidth
                      rounded={20}
                      padding="11px 20px"
                      label={t('services.bookService')}
                      iconComponent={Calendar}
                      icon={{
                        side: 'left',
                        size: 15,
                        padding: 0,
                        color: '#BD6D64',
                        hoverColor: '#FFFFFF',
                      }}
                      colors={{
                        fill: service.featured ? '#FDF4F0' : '#FFFFFF',
                        textColor: service.featured ? '#BD6D64' : '#2B2121',
                      }}
                      border={{
                        borderWidth: 1,
                        borderStyle: 'solid',
                        borderColor: service.featured ? '#D48278' : 'rgba(212, 130, 120, 0.32)',
                      }}
                      water={{
                        color: service.featured ? '#BD6D64' : '#D48278',
                        textColor: '#FFFFFF',
                        direction: 'up',
                        waveSpeed: 55,
                        defaultFill: 0,
                      }}
                      onClick={() => openBooking(service.id)}
                      aria-label={`${t('services.bookService')}: ${name}`}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Services;

