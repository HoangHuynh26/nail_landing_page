import './Gallery.css';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  ArrowRight,
  Clock,
  X
} from 'lucide-react';
import RoundCarousel from '../../common/RoundCarousel';
import { caseStudiesData } from '../../../data/caseStudies';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { SectionHeader } from '../../ui/SectionHeader/SectionHeader';
import { Button } from '../../ui/Button/Button';

export function Gallery() {
  const { t, language } = useLanguage();
  const { openBooking } = useBooking();
  const [galleryItems, setGalleryItems] = useState(caseStudiesData);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxCase, setLightboxCase] = useState(null);

  const defaultCategories = [
    { key: 'all', label_en: 'All Works' },
    { key: 'biab', label_en: 'Natural & BIAB' },
    { key: 'luxury', label_en: 'Luxury Crystals' },
    { key: '3d-art', label_en: '3D Sculpting & Art' },
    { key: 'pedicure', label_en: 'Deluxe Pedicure' },
  ];

  const categories = useMemo(() => {
    try {
      const saved = localStorage.getItem('atelier_gallery_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            key: c.key,
            label_en: c.label,
            label: c.label || c.label_en
          }));
        }
      }
    } catch (e) {}
    return defaultCategories;
  }, []);

  // Fetch live gallery items from API on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchGallery() {
      try {
        const res = await fetch('/api/gallery?active=true');
        if (!res.ok) throw new Error('Failed to fetch gallery items');
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.items) && data.items.length > 0) {
          setGalleryItems(data.items);
        }
      } catch (err) {
        console.warn('[Gallery] Using fallback case studies:', err.message);
        // Fallback remains caseStudiesData
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchGallery();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter cases based on selected tab
  const filteredCases = useMemo(() => {
    if (selectedCategory === 'all') return galleryItems;
    return galleryItems.filter((item) => item.categoryKey === selectedCategory);
  }, [selectedCategory, galleryItems]);

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
    const serviceName = language === 'vi'
      ? (caseItem.serviceName_vi || caseItem.serviceName_en || caseItem.title_vi)
      : (caseItem.serviceName_en || caseItem.serviceName_vi || caseItem.title_en);
    const priceNum = parseInt(String(caseItem.price || '').replace(/[^0-9]/g, ''), 10) || 80;
    openBooking(caseItem.serviceId || 'custom-art', serviceName, priceNum);
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
    if (key === 'all') return galleryItems.length;
    return galleryItems.filter((c) => c.categoryKey === key).length;
  };

  // Localized getters for currentCase
  const currentTitle = currentCase
    ? (language === 'vi' ? (currentCase.title_vi || currentCase.title_en) : (currentCase.title_en || currentCase.title_vi))
    : '';
  const currentCategory = currentCase
    ? (language === 'vi' ? (currentCase.category_vi || currentCase.category_en) : (currentCase.category_en || currentCase.category_vi))
    : '';
  const currentDescription = currentCase
    ? (language === 'vi' ? (currentCase.description_vi || currentCase.description_en) : (currentCase.description_en || currentCase.description_vi))
    : '';
  const currentTechnique = currentCase
    ? (language === 'vi' ? (currentCase.technique_vi || currentCase.technique_en) : (currentCase.technique_en || currentCase.technique_vi))
    : '';
  const currentDuration = currentCase
    ? (language === 'vi' ? (currentCase.duration_vi || currentCase.duration_en) : (currentCase.duration_en || currentCase.duration_vi))
    : '';
  const currentHighlights = currentCase
    ? ((language === 'vi' ? currentCase.highlights_vi : currentCase.highlights_en) || currentCase.highlights_en || currentCase.highlights_vi || [])
    : [];

  return (
    <section id="gallery" className="section case-studies-section" aria-labelledby="gallery-heading">
      <div className="container">
        {/* Section Header */}
        <div className="case-studies-header-row">
          <SectionHeader
            title={t('gallery.title')}
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="gallery-category-tabs" role="tablist" aria-label="Nail Art Categories">
          {categories.map((cat) => {
            const count = getCategoryCount(cat.key);
            const isActive = selectedCategory === cat.key;
            const label = cat.label_en || cat.label;
            return (
              <button
                key={cat.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`gallery-tab-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                <span>{label}</span>
                <span className="gallery-tab-badge">{count}</span>
              </button>
            );
          })}
        </div>

        {/* 3D Cylindrical Carousel Showcase */}
        <div className="case-studies-3d-wrapper">
          {/* 3D Round Carousel */}
          <div className="round-carousel-stage-container" key={`${selectedCategory}-${galleryItems.length}`}>
            <RoundCarousel
              images={filteredCases}
              imageWidth={360}
              imageHeight={360}
              spacing={2.4}
              speed={1.0}
              direction="right"
              drag={true}
              sensitivity={1.3}
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
                >
                  <img
                    src={currentCase.src}
                    alt={currentTitle}
                    className="case-spotlight-img"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Right: Technical Specs & Booking Action */}
                <div className="case-spotlight-info">
                  <div className="case-spotlight-meta">
                    <span className="case-pill case-pill--category">
                      {currentCategory}
                    </span>
                  </div>

                  <h3 className="case-spotlight-title">
                    {currentTitle}
                  </h3>

                  <p className="case-spotlight-desc">
                    {currentDescription}
                  </p>

                  {/* Technique Spec */}
                  {currentTechnique && (
                    <div className="case-spotlight-technique">
                      <span className="case-spec-label">{t('gallery.technique')}:</span>
                      <span className="case-spec-value">
                        {currentTechnique}
                      </span>
                    </div>
                  )}

                  {/* Key Highlights */}
                  {currentHighlights.length > 0 && (
                    <div className="case-spotlight-highlights">
                      {currentHighlights.map((h, i) => (
                        <div key={i} className="case-highlight-tag">
                          <CheckCircle2 size={14} className="case-highlight-icon" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing & Booking CTA Footer */}
                  <div className="case-spotlight-footer">
                    <div className="case-spotlight-price-group">
                      {currentDuration && (
                        <div className="case-price-item">
                          <Clock size={15} />
                          <span>{currentDuration}</span>
                        </div>
                      )}
                      <div className="case-price-item case-price-item--cost">
                        <span>{currentCase.price.includes('$') ? currentCase.price : `$${currentCase.price}`} AUD</span>
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

        {/* Lightbox HD Modal */}
        {lightboxCase && (
          <div
            className="gallery-lightbox-overlay"
            onClick={() => setLightboxCase(null)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="gallery-lightbox-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gallery-lightbox-close"
                onClick={() => setLightboxCase(null)}
                aria-label="Close Preview"
              >
                <X size={20} />
              </button>

              <img
                src={lightboxCase.src}
                alt={lightboxCase.title_en}
                className="gallery-lightbox-img"
              />

              <div className="gallery-lightbox-caption">
                <div className="gallery-lightbox-caption-row">
                  <div>
                    <h4 className="gallery-lightbox-title">
                      {language === 'vi' ? (lightboxCase.title_vi || lightboxCase.title_en) : (lightboxCase.title_en || lightboxCase.title_vi)}
                    </h4>
                    <p className="gallery-lightbox-subtitle">
                      {language === 'vi' ? (lightboxCase.category_vi || lightboxCase.category_en) : (lightboxCase.category_en || lightboxCase.category_vi)} • {lightboxCase.price} AUD
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Calendar}
                    onClick={() => handleBookCase(lightboxCase)}
                  >
                    <span>{t('gallery.bookThis')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Gallery;
