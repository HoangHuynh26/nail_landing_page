import React, { lazy } from 'react';
import { useLanguage } from './context/LanguageContext';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/sections/Hero';
import { LazySection } from './components/common/LazySection';
import { MobileStickyCTA } from './components/layout/MobileStickyCTA';
import { BackToHero } from './components/layout/BackToHero';
import { QuickChatbot } from './components/chat/QuickChatbot';
import { BookingModal } from './components/booking/BookingModal';

// Code-Split Dynamic Sections (Loaded on Demand / Viewport Intersection)
const TrustBar = lazy(() => import('./components/sections/TrustBar'));
const SalonStorytelling = lazy(() => import('./components/sections/SalonStorytelling'));
const Services = lazy(() => import('./components/sections/Services'));
const WhyChooseUs = lazy(() => import('./components/sections/WhyChooseUs'));
const About = lazy(() => import('./components/sections/About'));
const Gallery = lazy(() => import('./components/sections/Gallery'));
const Testimonials = lazy(() => import('./components/sections/Testimonials'));
const FAQ = lazy(() => import('./components/sections/FAQ'));
const FinalCTA = lazy(() => import('./components/sections/FinalCTA'));
const Footer = lazy(() => import('./components/layout/Footer'));

export function App() {
  const { language } = useLanguage();

  return (
    <div className={`atelier-app lang-${language}`}>
      {/* Accessibility: Skip to Main Content */}
      <a href="#main-content" className="skip-to-content">
        {language === 'vi' ? 'Chuyển đến nội dung chính' : 'Skip to main content'}
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

        {/* 3. Salon Storytelling: 4 Chapters */}
        <LazySection id="salon-story" minHeight="650px" hasOwnId={true}>
          <SalonStorytelling />
        </LazySection>

        {/* 4. Services Catalog & Search */}
        <LazySection id="services" minHeight="750px" hasOwnId={true}>
          <Services />
        </LazySection>

        {/* 5. Why Choose Us: 4 Core Pillars */}
        <LazySection id="why-us" minHeight="450px" hasOwnId={true}>
          <WhyChooseUs />
        </LazySection>

        {/* 6. About Salon & Founder Philosophy */}
        <LazySection id="about" minHeight="500px" hasOwnId={true}>
          <About />
        </LazySection>

        {/* 7. Craftsmanship Gallery */}
        <LazySection id="gallery" minHeight="650px" hasOwnId={true}>
          <Gallery />
        </LazySection>

        {/* 8. Google Maps Reviews & Social Proof */}
        <LazySection id="reviews" minHeight="600px" hasOwnId={true}>
          <Testimonials />
        </LazySection>

        {/* 9. 13 Australian Salon FAQs */}
        <LazySection id="faq" minHeight="600px" hasOwnId={true}>
          <FAQ />
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
    </div>
  );
}

export default App;

