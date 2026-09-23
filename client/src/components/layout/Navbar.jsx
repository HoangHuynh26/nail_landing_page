import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  PanelLeft,
  Search,
  Calendar,
  Menu,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { MobileDrawer } from './MobileDrawer';
import FashionNailsLogo from '../common/FashionNailsLogo';

export function Navbar() {
  const { language, t } = useLanguage();
  const { openBooking } = useBooking();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const tabsRef = useRef({});
  const tabsMetricsRef = useRef({});
  const lastScrolledRef = useRef(false);
  const currentActiveSectionRef = useRef('hero');
  const isManualScrollingRef = useRef(false);
  const manualScrollTimerRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  const tabs = useMemo(() => [
    { id: 'hero', label: t('nav.home') },
    { id: 'services', label: t('nav.services') },
    { id: 'about', label: t('nav.about') },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'reviews', label: t('nav.reviews') },
    { id: 'location', label: t('nav.contact') },
  ], [t]);

  // Smooth sliding position measurement
  const updateIndicator = useCallback(() => {
    const el = tabsRef.current[activeSection];
    if (el) {
      setIndicatorStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeSection]);

  useEffect(() => {
    updateIndicator();
  }, [updateIndicator, language]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator, { passive: true });
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  // Ultra-smooth 60/120fps Scroll Spy with RequestAnimationFrame Throttling
  useEffect(() => {
    const sectionIds = ['hero', 'services', 'about', 'gallery', 'reviews', 'location'];
    let ticking = false;

    const updateScrollState = () => {
      const scrollY = window.scrollY;
      const isNowScrolled = scrollY > 30;

      if (isNowScrolled !== lastScrolledRef.current) {
        lastScrolledRef.current = isNowScrolled;
        setIsScrolled(isNowScrolled);
      }

      // If manual smooth scroll is in progress from clicking a tab, keep the active tab locked
      if (isManualScrollingRef.current) {
        return;
      }

      // If at the very top (Hero section), set active to 'hero'
      if (scrollY < 180) {
        if (currentActiveSectionRef.current !== 'hero') {
          currentActiveSectionRef.current = 'hero';
          setActiveSection('hero');
        }
        return;
      }

      const viewportHeight = window.innerHeight;

      // 1. Bottom of page check:
      // When user reaches near the bottom of the page, the active section is 'location' (Contact)
      const isAtBottom = viewportHeight + scrollY >= document.documentElement.scrollHeight - 100;
      if (isAtBottom) {
        if (currentActiveSectionRef.current !== 'location') {
          currentActiveSectionRef.current = 'location';
          setActiveSection('location');
        }
        return;
      }

      // 2. Direct visibility check for Location section:
      // Location is below FAQ. When location's top reaches upper-middle viewport, activate it.
      const locationEl = document.getElementById('location');
      if (locationEl) {
        const locRect = locationEl.getBoundingClientRect();
        if (locRect.top <= viewportHeight * 0.55 && locRect.bottom > 80) {
          if (currentActiveSectionRef.current !== 'location') {
            currentActiveSectionRef.current = 'location';
            setActiveSection('location');
          }
          return;
        }
      }

      // 3. Trigger point check for preceding sections:
      const triggerPoint = viewportHeight * 0.35;
      let detected = '';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            detected = id;
            break;
          }
        }
      }

      if (!detected) {
        let minDistance = Infinity;
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(rect.top - triggerPoint);
            if (dist < minDistance && rect.top < viewportHeight) {
              minDistance = dist;
              detected = id;
            }
          }
        }
      }

      if (detected && detected !== currentActiveSectionRef.current) {
        currentActiveSectionRef.current = detected;
        setActiveSection(detected);
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollState();
          ticking = false;
        });
        ticking = true;
      }
    };

    // If user interacts with mouse wheel or touch, release manual scroll lock
    const handleUserInterrupt = () => {
      if (isManualScrollingRef.current) {
        isManualScrollingRef.current = false;
        if (manualScrollTimerRef.current) {
          clearTimeout(manualScrollTimerRef.current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleUserInterrupt, { passive: true });
    window.addEventListener('touchmove', handleUserInterrupt, { passive: true });
    updateScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleUserInterrupt);
      window.removeEventListener('touchmove', handleUserInterrupt);
      if (manualScrollTimerRef.current) {
        clearTimeout(manualScrollTimerRef.current);
      }
    };
  }, []);

  // Smooth scroll handler with offset for the floating island navbar
  const scrollTo = (id) => {
    setActiveSection(id);
    currentActiveSectionRef.current = id;

    // Set lock so scroll spy does not overwrite activeSection during scroll animation
    isManualScrollingRef.current = true;
    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1200);

    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Trigger immediate mount for all lazy sections to prevent layout shift during scroll
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lazy-section-mount', { detail: { id: 'all' } }));
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -80;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      }
    }, 30);
  };

  const scrollToTop = () => {
    setActiveSection('hero');
    currentActiveSectionRef.current = 'hero';
    isManualScrollingRef.current = true;
    if (manualScrollTimerRef.current) {
      clearTimeout(manualScrollTimerRef.current);
    }
    manualScrollTimerRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 1200);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchClick = () => {
    scrollTo('services');
    setTimeout(() => {
      const searchInput = document.querySelector('.services-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 400);
  };

  return (
    <>
      <header
        className={`apple-island-navbar-container ${isScrolled ? 'is-scrolled' : 'is-transparent'}`}
        role="banner"
      >
        <div className="apple-island-navbar-row">
          {/* 1. Left Brand Logo */}
          <a
            href="#hero"
            className="apple-glass-brand-logo"
            onClick={(e) => {
              e.preventDefault();
              scrollToTop();
            }}
            title="Fashion Nails Morley Galleria"
            aria-label="Fashion Nails Morley Galleria - Home"
          >
            <FashionNailsLogo size="sm" showSub={false} />
          </a>

          {/* 2. Center Floating Pill Toolbar (Sidebar Icon + Tab 1..5 + Search Icon) */}
          <nav
            className="apple-liquid-glass-pill"
            aria-label="Main Navigation Toolbar"
          >


            {/* Segmented Liquid Glass Tabs with Smooth Sliding Indicator */}
            <div className="apple-glass-tabs-list" role="tablist">
              {/* Fluid Sliding Liquid Glass Bubble */}
              <span
                className="apple-liquid-glass-indicator"
                style={{
                  transform: `translateX(${indicatorStyle.left}px)`,
                  width: `${indicatorStyle.width}px`,
                  opacity: indicatorStyle.opacity,
                }}
                aria-hidden="true"
              />

              {tabs.map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    ref={(el) => (tabsRef.current[tab.id] = el)}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`apple-glass-tab-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => scrollTo(tab.id)}
                  >
                    <span className="apple-glass-tab-text">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Inner Search Icon */}
            <button
              type="button"
              className="apple-glass-inner-icon-btn apple-glass-inner-icon-btn--search"
              onClick={handleSearchClick}
              title="Search services"
              aria-label="Search services"
            >
              <Search size={16} strokeWidth={2} />
            </button>
          </nav>

          {/* 3. Right Action Buttons (Booking Text Button with Shimmer & Glow) */}
          <div className="apple-glass-right-actions">
            {/* Text Booking CTA Button, reliable touch target */}
            <button
              type="button"
              id="nav-book-btn"
              className="apple-glass-book-cta-btn"
              onClick={() => openBooking()}
              title="Book Appointment"
              aria-label="Book Now"
            >
              <Calendar size={15} strokeWidth={2.2} className="nav-book-icon" />
              <span className="nav-book-label">Book Now</span>
              <Sparkles size={13} className="nav-book-sparkle-icon" />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              id="mobile-menu-btn"
              className="apple-glass-circle-btn apple-glass-circle-btn--mobile"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

export default Navbar;
