import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Quote,
  MoveHorizontal,
  Play,
  Pause,
  Sparkles,
  ShieldCheck,
  Heart,
  ExternalLink
} from 'lucide-react';
import SmoothScrollSlider from '../common/SmoothScrollSlider';
import { testimonialsData } from '../../data/testimonials';
import { useLanguage } from '../../context/LanguageContext';
import { SectionHeader } from '../ui/SectionHeader';

export function Testimonials() {
  const { language, t } = useLanguage();
  const [autoDrift, setAutoDrift] = useState(true);

  // Custom slide renderer for SmoothScrollSlider
  const renderTestimonialSlide = (item, index) => {
    if (!item) return null;
    const quote = language === 'vi' ? item.quote_vi : item.quote_en;
    const service = language === 'vi' ? item.service_vi : item.service_en;
    const rating = item.rating || 5;
    const maxRating = item.maxRating || 5;

    return (
      <article className="testimonial-slider-card" key={item.id || index}>
        {/* Glowing Top Ribbon */}
        <div className="testimonial-slider-card__ribbon" />

        {/* Google Maps Review Source Bar with Exact Star Rating */}
        <div className="testimonial-slider-card__google-bar">
          <div className="testimonial-slider-card__google-source">
            <svg className="testimonial-slider-card__google-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Google Maps</span>
          </div>

          <div className="testimonial-slider-card__score-pill" title={`${rating} trên tổng ${maxRating} sao`}>
            <span className="testimonial-slider-card__score-val">{rating} / {maxRating}</span>
            <div className="testimonial-slider-card__stars">
              {[...Array(rating)].map((_, i) => (
                <Star key={i} size={12} fill="#FBBC04" color="#FBBC04" />
              ))}
            </div>
          </div>
        </div>

        {/* Author: Avatar, Name, Location */}
        <div className="testimonial-slider-card__header">
          <div className="testimonial-slider-card__author-group">
            <div className="testimonial-slider-card__avatar-wrap">
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="testimonial-slider-card__avatar"
                  loading="lazy"
                />
              ) : (
                <div className="testimonial-slider-card__avatar-initial">
                  {item.name?.charAt(0) || 'C'}
                </div>
              )}
              <div className="testimonial-slider-card__verified-badge" title={t('testimonials.verified')}>
                <CheckCircle2 size={12} />
              </div>
            </div>

            <div className="testimonial-slider-card__client-meta">
              <h4 className="testimonial-slider-card__name">{item.name}</h4>
              <span className="testimonial-slider-card__location">{item.location}</span>
            </div>
          </div>
        </div>

        {/* Center: Quote Text */}
        <div className="testimonial-slider-card__body">
          <Quote size={22} className="testimonial-slider-card__quote-icon" aria-hidden="true" />
          <blockquote className="testimonial-slider-card__quote">
            "{quote}"
          </blockquote>
        </div>

        {/* Bottom: Service Tag & Date */}
        <div className="testimonial-slider-card__footer">
          <div className="testimonial-slider-card__service-tag">
            <Sparkles size={11} className="service-tag-icon" />
            <span>{service}</span>
          </div>

          <span className="testimonial-slider-card__date">
            {item.date}
          </span>
        </div>
      </article>
    );
  };

  return (
    <section id="reviews" className="section testimonials-section" aria-labelledby="reviews-heading">
      <div className="container">
        {/* Section Header */}
        <SectionHeader
          badgeText={language === 'vi' ? 'Đánh Giá Google Maps' : 'Google Maps Reviews'}
          title={language === 'vi' ? 'Được Yêu Thích Tại Morley Galleria' : 'Loved by Locals at Morley Galleria'}
          subtitle={
            language === 'vi'
              ? 'Tổng hợp những lời khen ngợi và đánh giá 5 sao thực tế từ khách hàng thân thiết trên Google Maps tại Perth, Tây Úc.'
              : 'Authentic 5-star ratings and genuine reviews from verified Perth clients on Google Maps.'
          }
        />

        {/* Trust Rating Summary Strip */}
        <div className="testimonials-trust-summary">
          <a
            href="https://maps.google.com/?q=Fashion+Nails+Morley+Galleria+Shopping+Centre+WA"
            target="_blank"
            rel="noopener noreferrer"
            className="testimonials-trust-item"
            title="Xem đánh giá trực tiếp trên Google Maps"
            style={{ textDecoration: 'none', cursor: 'pointer' }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <div className="google-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="#FBBC04" color="#FBBC04" />
              ))}
            </div>
            <div className="testimonials-trust-text">
              <strong>4.9 / 5.0 trên Google Reviews</strong>
              <span>528+ đánh giá xác thực từ khách tại Perth</span>
            </div>
            <ExternalLink size={14} style={{ color: 'var(--color-gold)', marginLeft: '4px' }} />
          </a>

          <div className="testimonials-trust-badge">
            <ShieldCheck size={16} className="trust-icon" />
            <span>100% Vệ sinh vô trùng chuẩn y tế WA</span>
          </div>

          <div className="testimonials-trust-badge">
            <Heart size={16} className="trust-icon" />
            <span>Bảo hành độ bền lên đến 4 tuần</span>
          </div>
        </div>
      </div>

      {/* SmoothScrollSlider Originkit Full-Width Carousel */}
      <div className="testimonials-slider-container">
        <SmoothScrollSlider
          items={testimonialsData}
          slideWidth={380}
          slideHeight={440}
          spacing={2.2}
          direction="right"
          smoothness={10}
          radius={22}
          dim={7.5}
          sensitivity={5.5}
          loop={true}
          autoDrift={autoDrift}
          driftSpeed={0.7}
          renderSlide={renderTestimonialSlide}
        />
      </div>
    </section>
  );
}

export default Testimonials;

