import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  DollarSign,
  X,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import RoundCarousel from '../common/RoundCarousel';
import { caseStudiesData } from '../../data/caseStudies';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';

export function Gallery() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxCase, setLightboxCase] = useState(null);

  // Category definitions with English labels
  const categories = [
    { key: 'all', label: 'All Works' },
    { key: 'biab', label: 'Natural & BIAB' },
    { key: 'luxury', label: 'Luxury Crystals' },
    { key: '3d-art', label: '3D Sculpting & Art' },
    { key: 'pedicure', label: 'Deluxe Pedicure' },
  ];

  // Filter cases based on selected tab
  const filteredCases = useMemo(() => {
    if (selectedCategory === 'all') return caseStudiesData;
    return caseStudiesData.filter((item) => item.categoryKey === selectedCategory);
  }, [selectedCategory]);

  // Ensure activeIndex is always valid when category changes
  const safeIndex = activeIndex < filteredCases.length ? activeIndex : 0;
  const currentCase = filteredCases[safeIndex] || filteredCases[0];

  const handleCategoryChange = (catKey) => {
    setSelectedCategory(catKey);
    setActiveIndex(0);
  };

  const handleCardClick = (item, index) => {
    setActiveIndex(index);
  };

  const handleActiveIndexChange = (index) => {
    setActiveIndex(index);
  };

  const handleBookCase = (caseItem) => {
    const serviceName = caseItem.serviceName_en;
    const priceNum = parseInt(caseItem.price.replace(/[^0-9]/g, ''), 10) || 80;
    openBooking(caseItem.serviceId, serviceName, priceNum);
    if (lightboxCase) {
      setLightboxCase(null);
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxCase) return;
      if (e.key === 'Escape') setLightboxCase(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxCase]);

  // Count items per category
  const getCategoryCount = (key) => {
    if (key === 'all') return caseStudiesData.length;
    return caseStudiesData.filter((c) => c.categoryKey === key).length;
  };

  return (
    <section id="gallery" className="section case-studies-section" aria-labelledby="gallery-heading">
      <div className="container">
        {/* Section Header */}
        <div className="case-studies-header-row">
          <SectionHeader
            title={t('gallery.title')}
            subtitle="Explore our authentic real client portfolio of sculptured manicures and deluxe spa pedicures at Morley Galleria."
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="gallery-category-tabs" role="tablist" aria-label="Nail Art Categories">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`gallery-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                <span>{cat.label}</span>
                <span className="gallery-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Cylindrical Carousel Showcase */}
        <div className="case-studies-3d-wrapper">
          {/* 3D Round Carousel */}
          <div className="round-carousel-stage-container" key={selectedCategory}>
            <RoundCarousel
              images={filteredCases}
              imageWidth={360}
              imageHeight={360}
              spacing={2.4}
              speed={0.3}
              direction="right"
              drag={true}
              sensitivity={1.2}
              tilt={-6}
              perspective={2600}
              cornerRadius={22}
              innerDim={3.2}
              onCardClick={handleCardClick}
              onActiveIndexChange={handleActiveIndexChange}
            />
          </div>

          {/* Active Case Study Spotlight Card */}
          {currentCase && (
            <div className="case-spotlight-card" key={`${currentCase.id}-${selectedCategory}`}>
              <div className="case-spotlight-grid">
                {/* Left: HD Close-up Photo */}
                <div 
                  className="case-spotlight-media" 
                  onClick={() => setLightboxCase(currentCase)}
                  title="Click to view HD full size"
                  style={{ cursor: 'zoom-in' }}
                >
                  <img
                    src={currentCase.src}
                    alt={currentCase.title_en}
                    className="case-spotlight-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Right: Technical Specs & Booking Action */}
                <div className="case-spotlight-info">
                  <div className="case-spotlight-meta">
                    <span className="case-pill case-pill--category">
                      {currentCase.category_en}
                    </span>
                  </div>

                  <h3 className="case-spotlight-title">
                    {currentCase.title_en}
                  </h3>

                  <p className="case-spotlight-desc">
                    {currentCase.description_en}
                  </p>

                  {/* Technique Spec */}
                  <div className="case-spotlight-technique">
                    <span className="case-spec-label">{t('gallery.technique')}:</span>
                    <span className="case-spec-value">
                      {currentCase.technique_en}
                    </span>
                  </div>

                  {/* Key Highlights */}
                  <div className="case-spotlight-highlights">
                    {currentCase.highlights_en.map((h, i) => (
                      <div key={i} className="case-highlight-tag">
                        <CheckCircle2 size={14} className="case-highlight-icon" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing & Booking CTA Footer */}
                  <div className="case-spotlight-footer">
                    <div className="case-spotlight-price-group">
                      <div className="case-price-item">
                        <Clock size={15} />
                        <span>{currentCase.duration_en}</span>
                      </div>
                      <div className="case-price-item case-price-item--cost">
                        <span>{currentCase.price} AUD</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      icon={Calendar}
                      onClick={() => handleBookCase(currentCase)}
                      className="case-book-cta-btn"
                    >
                      <span>{t('gallery.bookThis')}</span>
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
