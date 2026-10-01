import './Hero.css';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, ArrowRight, Star, ShieldCheck, Sparkles, ChevronLeft, ChevronRight, CheckCircle2, Volume2, VolumeX, Play, Pause, Film } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { useBooking } from '../../../context/BookingContext';
import { Button } from '../../ui/Button/Button';

// Curated authentic salon media: 1 showcase video + 5 craftsmanship photos
const HERO_SLIDES = [
  {
    id: 'slide-video',
    type: 'video',
    src: '/Video/video.mp4',
    altEn: 'Fashion Nails Morley luxury salon video tour & craftsmanship',
    tagEn: 'Salon Tour Video',
    subEn: 'Authentic Galleria Craftsmanship & Atmosphere'
  },
  {
    id: 'slide-1',
    type: 'image',
    src: '/518821645_122280518834203556_166016271660208696_n.jpg',
    altEn: 'Signature BIAB natural nails with delicate micro-French tips at Fashion Nails Morley',
    tagEn: 'Signature BIAB & Micro-French',
    subEn: '100% Autoclave Sterilized Standard'
  },
  {
    id: 'slide-2',
    type: 'image',
    src: '/545549752_122295948854203556_1942215736309577969_n.jpg',
    altEn: 'Artisanal 3D ocean pearl and whale shark sculpted nail masterpiece',
    tagEn: '3D Artisanal Sculpted Art',
    subEn: 'Handcrafted bespoke 3D artistry'
  },
  {
    id: 'slide-3',
    type: 'image',
    src: '/596803338_122317878272203556_5827472803529081288_n.jpg',
    altEn: 'Molten liquid metal chrome droplets over sheer luxury base',
    tagEn: 'Molten Liquid Chrome',
    subEn: 'High-gloss mirror finish & 4+ weeks retention'
  },
  {
    id: 'slide-4',
    type: 'image',
    src: '/548191670_122297986364203556_8262094689456576226_n.jpg',
    altEn: 'Pastel aura airbrush ombre with sculpted gel ridges',
    tagEn: 'Pastel Aura Ombre Art',
    subEn: 'Trending K & J beauty aesthetic'
  },
  {
    id: 'slide-5',
    type: 'image',
    src: '/708927332_122351060870203556_5767741981343574057_n.jpg',
    altEn: 'Royal cobalt blue stiletto extensions with delicate 3D butterfly art',
    tagEn: 'Royal Gel-X & Acrylic Extensions',
    subEn: 'Master form architecture & structural durability'
  }
];


// Hook to count up numbers smoothly when mounted
function useCountUp(endVal, duration = 1400, decimals = 0) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(ease * endVal);
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [endVal, duration]);

  return decimals > 0 ? val.toFixed(decimals) : Math.floor(val);
}

export function Hero() {
  const { t } = useLanguage();
  const { openBooking } = useBooking();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const isCurrentVideo = HERO_SLIDES[currentSlide]?.type === 'video';

  // Ratings Count-up animation
  const ratingScore = useCountUp(4.5, 1500, 1);
  const clientsCount = useCountUp(214, 1500, 0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  // Sync video play / pause when active slide changes
  useEffect(() => {
    if (!videoRef.current) return;

    if (isCurrentVideo) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Hero video autoplay restriction, falling back to muted:', err);
            if (videoRef.current) {
              videoRef.current.muted = true;
              setIsMuted(true);
              videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
            }
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [currentSlide, isCurrentVideo]);

  // Keep muted attribute strictly synced with DOM property
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Auto-slide effect for images (4s interval)
  // When current slide is video, slide transition is controlled by onEnded
  useEffect(() => {
    if (isCurrentVideo) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000);

    return () => clearInterval(interval);
  }, [isCurrentVideo, isPaused, nextSlide]);

  const handleVideoEnded = () => {
    // When video finishes, automatically transition to next slide
    nextSlide();
  };

  const handleVideoError = () => {
    setTimeout(() => {
      nextSlide();
    }, 3000);
  };

  const togglePlayPause = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    setIsPaused(false);
    touchEndXRef.current = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
  };

  const scrollToPricing = (e) => {
    e?.preventDefault?.();
    const el = document.getElementById('pricing') || document.getElementById('services');
    if (el) {
      const topOffset = 70;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="hero-section" aria-label="Hero Section">
      <div className="container hero-section__inner">
        {/* Left Editorial Narrative */}
        <div className="hero-section__content">
          <div className="hero-section__header">
            <h1 className="hero-section__title">
              <span className="hero-section__title-line">
                Exquisite Luxury Nail Care
              </span>
              <span className="hero-section__title-line hero-section__title-line--italic">
                At Morley Galleria Western Australia
              </span>
            </h1>

            <p className="hero-section__subtitle">
              Immerse in royal nail artistry featuring 29 full treatments from Builder Gel BIAB, Gel X, Acrylic to bespoke hand-painted nail art. 100% autoclave sterilized instruments.
            </p>
          </div>

          <div className="hero-section__cta-group">
            {/* Dual CTAs */}
            <div className="hero-section__actions">
              <Button
                id="hero-primary-cta"
                variant="primary"
                size="lg"
                onClick={() => openBooking()}
                icon={Calendar}
              >
                {t('hero.primaryCta')}
              </Button>

              <Button
                id="hero-secondary-cta"
                variant="secondary"
                size="lg"
                onClick={scrollToPricing}
                icon={ArrowRight}
                iconPosition="right"
              >
                Explore Menu & Prices
              </Button>
            </div>

            {/* Google Reviews Social Proof Card with Live Count-up / Countdown */}
            <div className="hero-google-trust" id="hero-google-rating" aria-label="Google Reviews Social Proof">
              <div className="hero-google-trust__header">
                <div className="hero-google-trust__badge">
                  {/* Authentic 4-color Google G Icon */}
                  <svg className="hero-google-trust__logo" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span className="hero-google-trust__brand">Google</span>
                  <span className="hero-google-trust__label">
                    Reviews
                  </span>
                </div>
              </div>

              <div className="hero-google-trust__main">
                {/* Rolling count-up rating score */}
                <div className="hero-google-trust__score-box">
                  <span className="hero-google-trust__score">{ratingScore}</span>
                  <span className="hero-google-trust__max">/5.0</span>
                </div>

                {/* 5 Official Google Gold Stars */}
                <div className="hero-google-trust__stars" aria-label="5 out of 5 stars">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="hero-google-trust__star"
                      fill="#FBBC04"
                      color="#FBBC04"
                    />
                  ))}
                </div>

                {/* Rolling count-up review count */}
                <div className="hero-google-trust__reviews-count">
                  <strong>{clientsCount}+</strong>
                  <span>Perth Galleria reviews</span>
                </div>
              </div>

              <div className="hero-google-trust__footer">
                <a href="#reviews" className="hero-google-trust__link">
                  <span>Read genuine client reviews</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Editorial Imagery & Video Showcase */}
        <div className="hero-section__visual">
          <div
            className="hero-section__image-frame"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            aria-roledescription="carousel"
            aria-label="Fashion Nails Masterpiece Showcase"
          >

            {/* Media slides: Video + 5 Authentic Photos */}
            {HERO_SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;

              if (slide.type === 'video') {
                return (
                  <video
                    key={slide.id}
                    ref={videoRef}
                    src={slide.src}
                    className={`hero-section__image hero-section__video ${isActive ? 'is-active' : ''}`}
                    playsInline
                    autoPlay
                    muted={isMuted}
                    preload="auto"
                    onEnded={handleVideoEnded}
                    onError={handleVideoError}
                    aria-label={slide.altEn}
                  />
                );
              }

              return (
                <img
                  key={slide.id}
                  src={slide.src}
                  alt={slide.altEn}
                  className={`hero-section__image ${isActive ? 'is-active' : ''}`}
                  width="640"
                  height="580"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              );
            })}

            {/* Video Controls (Sound Toggle & Play/Pause) when Video is Active */}
            {isCurrentVideo && (
              <div className="hero-slider__media-controls">
                <button
                  type="button"
                  className="hero-slider__ctrl-btn"
                  onClick={togglePlayPause}
                  aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  title={isPlaying ? 'Pause video' : 'Play video'}
                >
                  {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                </button>
                <button
                  type="button"
                  className="hero-slider__ctrl-btn"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>
              </div>
            )}

            {/* Previous Arrow Button */}
            <button
              type="button"
              className="hero-slider__arrow hero-slider__arrow--prev"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous slide"
              title="Previous slide"
            >
              <ChevronLeft size={22} />
            </button>

            {/* Next Arrow Button */}
            <button
              type="button"
              className="hero-slider__arrow hero-slider__arrow--next"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next slide"
              title="Next slide"
            >
              <ChevronRight size={22} />
            </button>

            {/* Indicators (Capsule progress dots) */}
            <div className="hero-slider__indicators" aria-label="Slide indicators">
              {HERO_SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`hero-slider__dot ${idx === currentSlide ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(idx);
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

