import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PanelLeft,
  Search,
  Calendar,
  Menu,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { LanguageToggle } from '../ui/LanguageToggle';
import { MobileDrawer } from './MobileDrawer';
import FashionNailsLogo from '../common/FashionNailsLogo';

export function Navbar() {
  const { language, t } = useLanguage();
  const { openBooking } = useBooking();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const tabsRef = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });

  // Navigation tabs matching the user's Apple Liquid Glass layout (Tab 1 to Tab 5)
  // "Trang chủ" replaces "Câu chuyện" as the prime home anchor
  const tabs = [
    { id: 'hero', label: t('nav.home') },
    { id: 'services', label: t('nav.services') },
    { id: 'about', label: language === 'vi' ? 'Về tiệm' : 'About' },
    { id: 'gallery', label: t('nav.gallery') },
    { id: 'reviews', label: language === 'vi' ? 'Đánh giá' : 'Reviews' },
  ];

  // Smooth sliding position measurement
  const updateIndicator = useCallback(() => {
    if (activeSection && tabsRef.current[activeSection]) {
      const el = tabsRef.current[activeSection];
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
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  // Scroll Spy: Automatically lights up the liquid glass bubble on the current section
  useEffect(() => {
    const sectionIds = ['hero', 'services', 'about', 'gallery', 'reviews'];

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 30);

      // If at the very top (Hero section), set active to 'hero'
      if (scrollY < 200) {
        setActiveSection('hero');
        return;
      }

      const viewportHeight = window.innerHeight;
      const triggerPoint = viewportHeight * 0.32; // 32% threshold from top of viewport

      let currentActive = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerPoint && rect.bottom > triggerPoint) {
            currentActive = id;
            break;
          }
        }
      }

      // If between sections, snap to closest one
      if (!currentActive) {
        let minDistance = Infinity;
        for (const id of sectionIds) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(rect.top - triggerPoint);
            if (dist < minDistance && rect.top < viewportHeight) {
              minDistance = dist;
              currentActive = id;
            }
          }
        }
      }

      if (currentActive) {
        setActiveSection(currentActive);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll handler with offset for the floating island navbar
  const scrollTo = (id) => {
    setActiveSection(id);
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // Trigger immediate mount for lazy section if not yet loaded
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lazy-section-mount', { detail: { id } }));
    }
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    setActiveSection('hero');
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
            {/* Left Inner Icon (Sidebar / Overview / Sparkles) */}
            <button
              type="button"
              className="apple-glass-inner-icon-btn"
              onClick={() => scrollTo('services')}
              title={language === 'vi' ? 'Tổng quan dịch vụ' : 'Services Overview'}
              aria-label="Services overview"
            >
              <PanelLeft size={17} strokeWidth={1.9} />
            </button>

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
              title={language === 'vi' ? 'Tìm kiếm dịch vụ' : 'Search services'}
              aria-label="Search services"
            >
              <Search size={16} strokeWidth={2} />
            </button>
          </nav>

          {/* 3. Right Action Buttons (Language Toggle + Booking Text Button with Shimmer & Glow) */}
          <div className="apple-glass-right-actions">
            {/* Action 1: Language Toggle (Hidden on mobile navbar, accessible in mobile drawer) */}
            <div className="apple-glass-action-item apple-glass-action-item--lang">
              <LanguageToggle />
            </div>

            {/* Action 2: Text Booking CTA Button, reliable touch target */}
            <button
              type="button"
              id="nav-book-btn"
              className="apple-glass-book-cta-btn"
              onClick={() => openBooking()}
              title={language === 'vi' ? 'Đặt lịch làm móng' : 'Book Appointment'}
              aria-label={language === 'vi' ? 'Đặt lịch' : 'Book Now'}
            >
              <Calendar size={15} strokeWidth={2.2} className="nav-book-icon" />
              <span className="nav-book-label">{language === 'vi' ? 'Đặt lịch' : 'Book Now'}</span>
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
