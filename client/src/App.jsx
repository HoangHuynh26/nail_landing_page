import React, { useState, useEffect } from 'react';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { LazySection } from './components/common/LazySection';
import { MobileStickyCTA } from './components/layout/MobileStickyCTA';
import { BackToHero } from './components/layout/BackToHero';
import { QuickChatbot } from './components/chat/QuickChatbot';
import { BookingModal } from './components/booking/BookingModal';
import { SeasonalPromoModal } from './components/common/SeasonalPromoModal';
import { AdminPage } from './components/admin/AdminPage';

// Direct imports for smooth, lag-free scroll reveal
import TrustBar from './components/sections/TrustBar';
import SalonStorytelling from './components/sections/SalonStorytelling';
import Services from './components/sections/Services';
import WhyChooseUs from './components/sections/WhyChooseUs';
import About from './components/sections/About';
import Gallery from './components/sections/Gallery';
import Testimonials from './components/sections/Testimonials';
import FAQ from './components/sections/FAQ';
import Location from './components/sections/Location';
import FinalCTA from './components/sections/FinalCTA';
import Footer from './components/layout/Footer';

export function App() {
  const { language } = useLanguage();
  
  // URL-based routing to /admin or #admin
  const [isAdminView, setIsAdminView] = useState(() => {
    return (
      window.location.pathname.startsWith('/admin') ||
      window.location.hash === '#admin'
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminView(
        window.location.pathname.startsWith('/admin') ||
        window.location.hash === '#admin'
      );
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Also intercept clicking on internal /admin links without full reload
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.getAttribute('href') === '/admin') {
        e.preventDefault();
        window.history.pushState({}, '', '/admin');
        setIsAdminView(true);
      }
    };
    document.addEventListener('click', handleLinkClick);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const handleBackToWebsite = () => {
    window.history.pushState({}, '', '/');
    setIsAdminView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin view, render Executive Admin Suite
  if (isAdminView) {
    return <AdminPage onBackToWebsite={handleBackToWebsite} />;
  }

  // Otherwise render Luxury Landing Page
  return (
    <div className="atelier-app lang-en">
      {/* Accessibility: Skip to Main Content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Navbar */}
      <Navbar />

      {/* Main Landing Content */}
      <main id="main-content">
        {/* 1. Hero: Eagerly Loaded for Instant 0ms First Contentful Paint */}
        <Hero />

        {/* 2. Trust Bar: Core Standards */}
        <LazySection id="trust-bar" minHeight="130px" hasOwnId={false}>
          <TrustBar />
        </LazySection>

        {/* 3. Services Catalog & Search (Live Dynamic Prices & Services) */}
        <LazySection id="services" minHeight="750px" hasOwnId={true}>
          <Services />
        </LazySection>

        {/* 4. Why Choose Us: 4 Core Pillars */}
        <LazySection id="why-us" minHeight="450px" hasOwnId={true}>
          <WhyChooseUs />
        </LazySection>

        {/* 5. About Salon & Serene Architecture */}
        <LazySection id="about" minHeight="500px" hasOwnId={true}>
          <About />
        </LazySection>

        {/* 6. Craftsmanship Gallery */}
        <LazySection id="gallery" minHeight="650px" hasOwnId={true}>
          <Gallery />
        </LazySection>

        {/* 7. Verified Client Reviews & Social Proof */}
        <LazySection id="reviews" minHeight="600px" hasOwnId={true}>
          <Testimonials />
        </LazySection>

        {/* 8. 13 Australian Salon FAQs */}
        <LazySection id="faq" minHeight="600px" hasOwnId={true}>
          <FAQ />
        </LazySection>

        {/* 9. Salon Location, Hours & Google Maps */}
        <LazySection id="location" minHeight="580px" hasOwnId={true}>
          <Location />
        </LazySection>

        {/* 10. Final Call to Action */}
        <LazySection id="final-cta" minHeight="380px" hasOwnId={false}>
          <FinalCTA />
        </LazySection>
      </main>

      {/* 11. Footer */}
      <LazySection id="footer" minHeight="320px" hasOwnId={false}>
        <Footer />
      </LazySection>

      {/* Mobile Sticky Booking CTA Bar */}
      <MobileStickyCTA />

      {/* Floating Back to Hero Section Button */}
      <BackToHero />

      {/* Floating Quick Response Chatbot (Bottom Right) */}
      <QuickChatbot />

      {/* Global Frictionless 6-Step Booking Modal */}
      <BookingModal />

      {/* Seasonal & Holiday Promotion Visitor Pop-up Modal */}
      <SeasonalPromoModal />
    </div>
  );
}

export default App;
