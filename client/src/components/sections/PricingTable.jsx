import React, { useState } from 'react';
import { Calendar, Tag, Gift, Sparkles, Printer } from 'lucide-react';
import { servicesData } from '../../data/services';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';

export function PricingTable() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const [activeFilter, setActiveFilter] = useState('all');

  const categories = [
    { key: 'all', label: t('services.tabAll') },
    { key: 'acrylic', label: 'Acrylic Nails' },
    { key: 'shellac', label: 'Shellac' },
    { key: 'biab', label: 'Builder Gel - BIAB' },
    { key: 'gelx', label: 'Gel X Extensions' },
    { key: 'polish', label: 'Nail Polish' },
    { key: 'sns', label: 'SNS Dipping' },
    { key: 'extra', label: 'Extra Services' }
  ];

  const categoryTitles = {
    acrylic: 'ACRYLIC NAILS',
    shellac: 'SHELLAC',
    biab: 'BUILDER GEL - BIAB',
    gelx: 'GEL X EXTENSIONS',
    polish: 'NAIL POLISH',
    sns: 'SNS (DIPPING POWDER)',
    extra: 'EXTRA SERVICES'
  };

  // 2-Column layout matching the exact physical salon menu photo
  const columnLeftCats = ['acrylic', 'shellac', 'biab', 'gelx'];
  const columnRightCats = ['polish', 'sns', 'extra'];

  const getItemsForCat = (catKey) => servicesData.filter(s => s.category === catKey);

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="pricing" className="section pricing-section" aria-labelledby="pricing-heading">
      <div className="container">
        <SectionHeader
          badgeText={t('pricing.badge')}
          title="Official Salon Price List"
          subtitle="Transparent menu pricing at Fashion Nails Morley Galleria. Zero hidden fees, backed by our 7-day guarantee."
        />

        {/* Quick Filter Pill Tabs */}
        <div className="pricing-filter-tabs">
          {categories.map(c => (
            <button
              key={c.key}
              type="button"
              className={`pricing-filter-btn ${activeFilter === c.key ? 'is-active' : ''}`}
              onClick={() => setActiveFilter(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* 2-Column Physical Salon Menu Board */}
        <div className="salon-menu-board">
          <div className="salon-menu-board__grid">
            {/* Left Column */}
            <div className="salon-menu-board__col">
              {columnLeftCats.map(catKey => {
                if (activeFilter !== 'all' && activeFilter !== catKey) return null;
                const items = getItemsForCat(catKey);
                if (items.length === 0) return null;

                const title = categoryTitles[catKey];

                return (
                  <div key={catKey} className="salon-menu-group">
                    <h3 className="salon-menu-group__title">
                      <span>{title}</span>
                      <Sparkles size={14} style={{ opacity: 0.8 }} />
                    </h3>
                    <div className="salon-menu-group__items">
                      {items.map(item => {
                        const name = item.name_en;
                        return (
                          <div key={item.id} className="salon-menu-item">
                            <span className="salon-menu-item__name">{name}</span>
                            <span className="salon-menu-item__dots" aria-hidden="true" />
                            <div className="salon-menu-item__price-wrap">
                              <span className="salon-menu-item__price">
                                {item.pricePrefix ? `${item.pricePrefix}$${item.price}` : `$${item.price}`}
                              </span>
                              <button
                                type="button"
                                className="salon-menu-item__book-btn"
                                onClick={() => openBooking(item.id)}
                                title={`Book ${name}`}
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column */}
            <div className="salon-menu-board__col">
              {columnRightCats.map(catKey => {
                if (activeFilter !== 'all' && activeFilter !== catKey) return null;
                const items = getItemsForCat(catKey);
                if (items.length === 0) return null;

                const title = categoryTitles[catKey];

                return (
                  <div key={catKey} className="salon-menu-group">
                    <h3 className="salon-menu-group__title">
                      <span>{title}</span>
                      <Sparkles size={14} style={{ opacity: 0.8 }} />
                    </h3>
                    <div className="salon-menu-group__items">
                      {items.map(item => {
                        const name = item.name_en;
                        return (
                          <div key={item.id} className="salon-menu-item">
                            <span className="salon-menu-item__name">{name}</span>
                            <span className="salon-menu-item__dots" aria-hidden="true" />
                            <div className="salon-menu-item__price-wrap">
                              <span className="salon-menu-item__price">
                                {item.pricePrefix ? `${item.pricePrefix}$${item.price}` : `$${item.price}`}
                              </span>
                              <button
                                type="button"
                                className="salon-menu-item__book-btn"
                                onClick={() => openBooking(item.id)}
                                title={`Book ${name}`}
                              >
                                Book
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Bottom Promotional Gold Bar (From Photo) */}
          <div className="promo-gold-banner">
            <div className="promo-gold-banner__voucher">
              Gift Vouchers Available
            </div>
            <div className="promo-gold-banner__discount">
              10% Off for Seniors, Students, and Morley Galleria Staff
            </div>
          </div>
        </div>

        {/* Action Row below menu */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => openBooking()}
            icon={Calendar}
          >
            Book an Appointment
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={handlePrint}
            icon={Printer}
          >
            Print / Save Price Menu
          </Button>
        </div>
      </div>
    </section>
  );
}
