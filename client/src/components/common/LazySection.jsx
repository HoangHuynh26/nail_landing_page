import React, { useState, useEffect, useRef } from 'react';

/**
 * Smooth Scroll-Reveal Section
 * - Sections start in hidden state (opacity: 0, translateY: 28px).
 * - When entering viewport, smooth reveal animation is triggered (opacity: 1, translateY: 0).
 * - Clean, flicker-free presentation without jarring layout shifts.
 */
export function LazySection({
  id,
  children,
  className = '',
  hasOwnId = true,
  rootMargin = '120px 0px -40px 0px',
  threshold = 0.05
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    // If URL hash points to this section, render immediately
    if (typeof window !== 'undefined' && window.location.hash === `#${id}`) {
      setIsRevealed(true);
      return;
    }

    // Listen for navigation clicks from Navbar or Drawer to render instantly
    const handleManualMount = (e) => {
      if (e.detail?.id === id || e.detail?.id === 'all') {
        setIsRevealed(true);
      }
    };
    window.addEventListener('lazy-section-mount', handleManualMount);

    if (!('IntersectionObserver' in window)) {
      setIsRevealed(true);
      return () => window.removeEventListener('lazy-section-mount', handleManualMount);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('lazy-section-mount', handleManualMount);
    };
  }, [id, rootMargin, threshold]);

  // If child component already has an id (e.g. <section id="services">), avoid duplicate id on wrapper
  const containerId = hasOwnId ? undefined : id;

  return (
    <div
      ref={containerRef}
      id={containerId}
      data-reveal-section={id}
      className={`scroll-reveal-wrapper ${isRevealed ? 'is-revealed' : 'is-hidden'} ${className}`}
    >
      {children}
    </div>
  );
}

export default LazySection;
