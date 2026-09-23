import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Sparkles, ShieldCheck, Flame, HeartHandshake, ArrowRight, Calendar, CheckCircle2, Gift } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { Button } from '../ui/Button';

/**
 * Animated number countdown / count-up component triggered via IntersectionObserver
 */
function StoryCountUp({ text, duration = 1400 }) {
  const parsed = useMemo(() => {
    if (!text || typeof text !== 'string') return null;
    const match = text.match(/^([^\d.]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;
    const prefix = match[1] || '';
    const num = parseFloat(match[2]);
    const suffix = match[3] || '';
    const hasDecimal = match[2].includes('.');
    const decimals = hasDecimal ? match[2].split('.')[1].length : 0;
    return { prefix, num, suffix, decimals };
  }, [text]);

  const [displayVal, setDisplayVal] = useState(() => {
    if (!parsed) return text;
    const zeroStr = parsed.decimals > 0 ? (0).toFixed(parsed.decimals) : '0';
    return `${parsed.prefix}${zeroStr}${parsed.suffix}`;
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!parsed) {
      setDisplayVal(text);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            let startTimestamp = null;
            let animId;
            const endVal = parsed.num;
            const decimals = parsed.decimals;

            const step = (timestamp) => {
              if (!startTimestamp) startTimestamp = timestamp;
              const progress = Math.min((timestamp - startTimestamp) / duration, 1);
              // Ease-out cubic
              const ease = 1 - Math.pow(1 - progress, 3);
              const current = ease * endVal;
              const formatted = decimals > 0 ? current.toFixed(decimals) : Math.floor(current);
              setDisplayVal(`${parsed.prefix}${formatted}${parsed.suffix}`);
              if (progress < 1) {
                animId = requestAnimationFrame(step);
              }
            };
            animId = requestAnimationFrame(step);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [parsed, text, duration]);

  if (!parsed) {
    return (
      <span ref={containerRef} className="story-stat-num" style={{ fontSize: '1.25rem' }}>
        {text}
      </span>
    );
  }

  return (
    <span ref={containerRef} className="story-stat-num" aria-label={text}>
      {displayVal}
    </span>
  );
}

export function SalonStorytelling() {
  const { language, t } = useLanguage();
  const { openBooking } = useBooking();
  const [activeChapter, setActiveChapter] = useState(1);

  const chapterRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const chapterTabsRef = useRef({});
  const chapterMetricsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const chapters = [1, 2, 3, 4];

  const updateChapterIndicator = useCallback(() => {
    const el = chapterTabsRef.current[activeChapter];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeChapter]);

  useEffect(() => {
    updateChapterIndicator();
  }, [updateChapterIndicator, language]);

  useEffect(() => {
    window.addEventListener('resize', updateChapterIndicator, { passive: true });
    return () => window.removeEventListener('resize', updateChapterIndicator);
  }, [updateChapterIndicator]);

  useEffect(() => {
    const observers = [];
    chapterRefs.forEach((ref, index) => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapter(index + 1);
            }
          });
        },
        { rootMargin: '-20% 0px -40% 0px', threshold: 0.2 }
      );
      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToChapter = (chapterNum) => {
    const el = document.getElementById(`story-chapter-${chapterNum}`);
    if (el) {
      const yOffset = -140;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
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

  const c1 = t('story.chapter1') || {};
  const c2 = t('story.chapter2') || {};
  const c3 = t('story.chapter3') || {};
  const c4 = t('story.chapter4') || {};

  return (
    <section id="salon-story" className="story-section" aria-label="Fashion Nails Salon Story">
      <div className="container">
        {/* Section Header */}
        <div className="story-header-wrap">
          <span className="story-pill-badge">
            <Sparkles size={13} style={{ marginRight: '6px' }} />
            {t('story.badge')}
          </span>
          <h2 className="story-main-title">
            The Standard of Elevated Nail Artistry
          </h2>
        </div>

        {/* Sticky Floating Apple Liquid Glass Capsule Navigation */}
        <nav className="story-capsule-nav" aria-label="Story Chapters">
          <div className="story-capsule-track">
            {/* Fluid Sliding Apple Liquid Glass Bubble */}
            <span
              className="story-capsule-indicator"
              style={{
                transform: `translateX(${indicatorStyle.left}px)`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
              }}
              aria-hidden="true"
            />

            {chapters.map((ch) => {
              const isActive = activeChapter === ch;
              return (
                <button
                  key={ch}
                  ref={(el) => (chapterTabsRef.current[ch] = el)}
                  type="button"
                  className={`story-capsule-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => scrollToChapter(ch)}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="story-capsule-dot" />
                  <span className="story-capsule-text">{t(`story.capsule${ch}`)}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ================= CHAPTER 01 ================= */}
        <article
          id="story-chapter-1"
          ref={chapterRefs[0]}
          className="story-chapter story-chapter--reverse"
        >
          <div className="story-chapter__narrative">
            <span className="story-chapter__tag">{c1.tag}</span>
            <h3 className="story-chapter__headline">{c1.headline}</h3>
            <p className="story-chapter__lead">{c1.lead}</p>

            <div className="story-stat-row">
              <div className="story-stat-card">
                <StoryCountUp text={c1.stat1Num} />
                <span className="story-stat-lbl">{c1.stat1Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c1.stat2Num} />
                <span className="story-stat-lbl">{c1.stat2Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c1.stat3Num} />
                <span className="story-stat-lbl">{c1.stat3Label}</span>
              </div>
            </div>
          </div>

          <div className="story-chapter__media">
            <div className="story-media-frame">
              <img
                src="/687035834_122347808780203556_1096906081452401789_n.jpg"
                alt="Fashion Nails Morley Galleria authentic luxury salon interior with crystal chandeliers and marble manicure bars"
                className="story-media-img"
                loading="lazy"
                decoding="async"
                width="580"
                height="440"
              />
              <div className="story-media-glass-tag">
                <span className="story-media-tag-dot" />
                <span>Shop SP094 (Opposite Kmart) • Morley Galleria WA 6062</span>
              </div>
            </div>
          </div>
        </article>

        {/* ================= CHAPTER 02 ================= */}
        <article
          id="story-chapter-2"
          ref={chapterRefs[1]}
          className="story-chapter"
        >
          <div className="story-chapter__narrative">
            <span className="story-chapter__tag">{c2.tag}</span>
            <h3 className="story-chapter__headline">{c2.headline}</h3>
            <p className="story-chapter__lead">{c2.lead}</p>

            <div className="story-stat-row">
              <div className="story-stat-card">
                <StoryCountUp text={c2.stat1Num} />
                <span className="story-stat-lbl">{c2.stat1Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c2.stat2Num} />
                <span className="story-stat-lbl">{c2.stat2Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c2.stat3Num} />
                <span className="story-stat-lbl">{c2.stat3Label}</span>
              </div>
            </div>

            <div className="story-hygiene-guarantee">
              <ShieldCheck size={20} className="story-hygiene-icon" />
              <span>
                100% Sterile Promise: Individual medical pouches unsealed in front of you prior to every treatment.
              </span>
            </div>
          </div>

          <div className="story-chapter__media">
            <div className="story-media-frame" style={{ marginBottom: '1.25rem' }}>
              <img
                src="/689912270_122347714910203556_1072267132267964461_n.jpg"
                alt="Fashion Nails Morley dedicated technicians in branded aprons serving clients with Clean Professional Premium Care"
                className="story-media-img"
                loading="lazy"
                decoding="async"
                width="580"
                height="380"
              />
              <div className="story-media-glass-tag">
                <ShieldCheck size={14} style={{ color: 'var(--color-gold)' }} />
                <span>Clean • Professional • Premium Care Standard</span>
              </div>
            </div>

            <div className="story-sterilize-card">
              <div className="story-sterilize-icon-wrap">
                <Flame size={32} className="story-sterilize-flame" />
              </div>
              <h4 className="story-sterilize-title">Hospital-Grade Autoclaving</h4>
              <p className="story-sterilize-desc">
                High-pressure steam sterilization eliminating 99.99% pathogens. Uncompromising hygiene for total peace of mind.
              </p>
              <ul className="story-sterilize-list">
                <li><CheckCircle2 size={16} /> Single-use nail files & buffers</li>
                <li><CheckCircle2 size={16} /> Hermetically sealed tool pouches</li>
                <li><CheckCircle2 size={16} /> Hospital-grade sanitisation stations</li>
              </ul>
            </div>
          </div>
        </article>

        {/* ================= CHAPTER 03 ================= */}
        <article
          id="story-chapter-3"
          ref={chapterRefs[2]}
          className="story-chapter story-chapter--reverse"
        >
          <div className="story-chapter__narrative">
            <span className="story-chapter__tag">{c3.tag}</span>
            <h3 className="story-chapter__headline">{c3.headline}</h3>
            <p className="story-chapter__lead">{c3.lead}</p>

            <div className="story-stat-row">
              <div className="story-stat-card">
                <StoryCountUp text={c3.stat1Num} />
                <span className="story-stat-lbl">{c3.stat1Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c3.stat2Num} />
                <span className="story-stat-lbl">{c3.stat2Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c3.stat3Num} />
                <span className="story-stat-lbl">{c3.stat3Label}</span>
              </div>
            </div>
          </div>

          <div className="story-chapter__media">
            <div className="story-media-frame">
              <img
                src="/596803338_122317878272203556_5827472803529081288_n.jpg"
                alt="BIAB Natural Builder Gel and 3D Molten Chrome liquid droplets artistry"
                className="story-media-img"
                loading="lazy"
                decoding="async"
                width="580"
                height="440"
              />
              <div className="story-media-glass-tag">
                <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
                <span>BIAB Natural Fortification • 3D Molten Chrome</span>
              </div>
            </div>
          </div>
        </article>

        {/* ================= CHAPTER 04 ================= */}
        <article
          id="story-chapter-4"
          ref={chapterRefs[3]}
          className="story-chapter"
        >
          <div className="story-chapter__narrative">
            <span className="story-chapter__tag">{c4.tag}</span>
            <h3 className="story-chapter__headline">{c4.headline}</h3>
            <p className="story-chapter__lead">{c4.lead}</p>

            <div className="story-stat-row">
              <div className="story-stat-card">
                <StoryCountUp text={c4.stat1Num} />
                <span className="story-stat-lbl">{c4.stat1Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c4.stat2Num} />
                <span className="story-stat-lbl">{c4.stat2Label}</span>
              </div>
              <div className="story-stat-card">
                <StoryCountUp text={c4.stat3Num} />
                <span className="story-stat-lbl">{c4.stat3Label}</span>
              </div>
            </div>

            {/* Seamless bridging CTAs */}
            <div className="story-actions">
              <Button
                variant="primary"
                size="lg"
                onClick={() => openBooking()}
                icon={Calendar}
              >
                {t('story.ctaBook')}
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={scrollToPricing}
                icon={ArrowRight}
              >
                {t('story.ctaExplore')}
              </Button>
            </div>
          </div>

          <div className="story-chapter__media">
            <div className="story-media-frame" style={{ marginBottom: '1.25rem' }}>
              <img
                src="/533400903_122289098444203556_6546893410140421819_n.jpg"
                alt="Fashion Nails Morley welcoming diverse clientele with bespoke artistic nail care and henna harmony"
                className="story-media-img"
                loading="lazy"
                decoding="async"
                width="580"
                height="380"
              />
              <div className="story-media-glass-tag">
                <HeartHandshake size={14} style={{ color: '#F3BAA8' }} />
                <span>Morley Community Sanctuary • All Welcome</span>
              </div>
            </div>

            <div className="story-community-card">
              <div className="story-community-badge">
                <HeartHandshake size={28} style={{ color: '#FFFFFF' }} />
              </div>
              <h4 className="story-community-title">Morley Community Privileges</h4>
              <p className="story-community-desc">
                Honoring our Morley neighbors, students, and hard-working Galleria shopping centre colleagues.
              </p>
              <div className="story-community-perks">
                <div className="story-perk-item">
                  <span className="story-perk-pill">10% OFF</span>
                  <span>Seniors, Students & Morley Galleria Staff</span>
                </div>
                <div className="story-perk-item">
                  <span className="story-perk-pill"><Gift size={12} /> VOUCHER</span>
                  <span>Gift Vouchers Available at Counter</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

export default SalonStorytelling;
