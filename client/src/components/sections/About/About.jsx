import './About.css';
import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Badge } from '../../ui/Badge/Badge';
import { ChevronLeft, ChevronRight, Award, ShieldCheck, Sparkles } from 'lucide-react';

export function About() {
  const { t, language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  // All genuine salon interior and official certificate/award images
  const slides = [
    {
      id: 'cert-award',
      type: 'certificate',
      src: './dist/images/certificate-galleria-retailer.jpg',
      fallbackSrc: '/images/certificate-galleria-retailer.jpg',
      alt: 'Galleria Morley Retailer of the Month January 2026 Award Certificate presented to Fashion Nails',
      tag: language === 'vi' ? 'Giải Thưởng Galleria' : 'Retailer of the Month',
      tagIcon: Award,
      title: language === 'vi' ? 'Chứng Nhận Cửa Hàng Xuất Sắc Nhất Tháng 1/2026 - Galleria' : 'Retailer of the Month - January 2026 (Galleria Morley)',
      badge: language === 'vi' ? 'Dịch Vụ Khách Hàng Xuất Sắc' : 'Customer Service Excellence'
    },
    {
      id: 'team-award',
      type: 'team',
      src: './dist/images/team-award-celebration.jpg',
      fallbackSrc: '/images/team-award-celebration.jpg',
      alt: 'Fashion Nails Morley dedicated team proudly holding Galleria award',
      tag: language === 'vi' ? 'Đội Ngũ Kỹ Thuật Viên' : 'Award-Winning Team',
      tagIcon: Award,
      title: language === 'vi' ? 'Đội Ngũ Kỹ Thuật Viên Tận Tâm Cùng Bằng Khen Galleria' : 'Our Passionate Team Proudly Holding Galleria Award',
      badge: language === 'vi' ? 'Thợ Móng Chuyên Nghiệp & Tận Tâm' : 'Master Nail Technicians'
    },
    {
      id: 'cert-celebration',
      type: 'certificate',
      src: './dist/images/certificate-galleria-celebration.jpg',
      fallbackSrc: '/images/certificate-galleria-celebration.jpg',
      alt: 'Galleria Retailer of the Month Celebration with Vicinity Centres',
      tag: language === 'vi' ? 'Vinh Danh Vicinity' : 'Centre Recognition',
      tagIcon: ShieldCheck,
      title: language === 'vi' ? 'Phần Thưởng Đặc Biệt & Lời Chúc Từ Vicinity Centres' : 'Vicinity Centres Something Special Recognition',
      badge: language === 'vi' ? 'Chuẩn Mực Phục Vụ Hàng Đầu' : 'Centre Service Standard'
    },
    {
      id: 'salon-vibrant',
      type: 'salon',
      src: './dist/images/salon-vibrant-atmosphere.jpg',
      fallbackSrc: '/images/salon-vibrant-atmosphere.jpg',
      alt: 'Fashion Nails bustling salon atmosphere with clients and technicians',
      tag: language === 'vi' ? 'Khách Hàng Thân Thiết' : 'Vibrant Salon Life',
      tagIcon: Sparkles,
      title: language === 'vi' ? 'Không Gian Nhộn Nhịp & Khách Hàng Yêu Thích Tại Morley' : 'Loved & Trusted by Morley Community Everyday',
      badge: language === 'vi' ? 'Điểm Đến Làm Đẹp Uy Tín' : 'Trusted by Morley Community'
    },
    {
      id: 'salon-interior',
      type: 'salon',
      src: './dist/687035834_122347808780203556_1096906081452401789_n.jpg',
      fallbackSrc: '/images/interior.jpg',
      alt: 'Fashion Nails Morley Galleria serene luxury interior',
      tag: language === 'vi' ? 'Không Gian Tiệm' : 'Salon Sanctuary',
      tagIcon: Sparkles,
      title: language === 'vi' ? 'Không Gian Sang Trọng Phong Cách Châu Âu Tại Galleria' : 'Boutique European Salon Sanctuary at Galleria',
      badge: language === 'vi' ? 'Trải Nghiệm Thư Giãn' : 'Boutique Experience'
    }
  ];

  // Auto-advance slideshow every 5.5s (pauses on hover)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const current = slides[activeSlide];
  const CurrentIcon = current.tagIcon;

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section id="about" className="section about-section" aria-labelledby="about-heading">
      <div className="container about-section__inner">
        {/* Left Interactive Multi-Image & Certificate Showcase */}
        <div 
          className="about-section__visual"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="about-section__frame">
            {/* Main Interactive Slide */}
            <div className="about-section__slide-container">
              {/* Ambient Blurred Backdrop for Portrait & Certificate Photos */}
              <div 
                className="about-section__slide-bg"
                style={{ backgroundImage: `url(${current.src})` }}
                aria-hidden="true"
              />

              <img
                key={current.id}
                src={current.src}
                alt={current.alt}
                className={`about-section__image about-section__image--fade ${
                  current.type === 'certificate' || current.type === 'team'
                    ? 'about-section__image--contain'
                    : 'about-section__image--cover'
                }`}
                loading="eager"
                decoding="async"
                width="620"
                height="500"
                onError={(e) => {
                  if (current.fallbackSrc && e.target.src !== current.fallbackSrc) {
                    e.target.src = current.fallbackSrc;
                  }
                }}
              />

              {/* Top Floating Badge */}
              <div className="about-section__floating-badge">
                <CurrentIcon size={14} className="about-section__badge-icon" />
                <span>{current.tag}</span>
              </div>

              {/* Bottom Caption Overlay */}
              <div className="about-section__slide-overlay">
                <div className="about-section__slide-title">{current.title}</div>
                <div className="about-section__slide-pill">{current.badge}</div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              type="button"
              className="about-section__nav-btn about-section__nav-btn--prev"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              className="about-section__nav-btn about-section__nav-btn--next"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Thumbnail Strip: Salon Interior + Certificates */}
          <div className="about-section__thumb-strip" role="tablist" aria-label="About Gallery Thumbnails">
            {slides.map((s, index) => {
              const isActive = index === activeSlide;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`about-section__thumb-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  title={s.title}
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    className="about-section__thumb-img"
                    onError={(e) => {
                      if (s.fallbackSrc) e.target.src = s.fallbackSrc;
                    }}
                  />
                  {isActive && <div className="about-section__thumb-indicator" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Story Narrative */}
        <div className="about-section__content">
          <Badge variant="gold" className="about-section__badge">
            {t('about.badge')}
          </Badge>

          <h2 id="about-heading" className="about-section__title">
            {t('about.title')}
          </h2>

          <div className="about-section__paragraphs">
            <p>{t('about.p1')}</p>
          </div>

          <blockquote className="about-section__quote">
            <p>{t('about.quote')}</p>
            <cite className="about-section__author">{t('about.author')}</cite>
          </blockquote>
        </div>
      </div>


    </section>
  );
}

export default About;
