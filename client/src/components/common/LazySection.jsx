import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * Luxury Skeleton Placeholder to prevent Cumulative Layout Shift (CLS)
 * during code-splitting and viewport lazy-loading.
 */
export function SectionSkeleton({ minHeight = '400px', label = '' }) {
  return (
    <div
      className="lazy-section-skeleton"
      style={{ minHeight }}
      role="status"
      aria-busy="true"
      aria-label={label ? `Đang tải ${label}...` : 'Đang tải nội dung...'}
    >
      <div className="lazy-section-skeleton__shimmer" />
      <div className="lazy-section-skeleton__content">
        <div className="lazy-section-skeleton__badge">
          <Sparkles size={14} className="lazy-section-skeleton__icon" />
          <span>Fashion Nails Morley</span>
        </div>
        <div className="lazy-section-skeleton__line lazy-section-skeleton__line--title" />
        <div className="lazy-section-skeleton__line lazy-section-skeleton__line--subtitle" />
      </div>
    </div>
  );
}

/**
 * Intelligent Viewport & Code-Splitting Lazy Loader.
 * - IntersectionObserver with generous rootMargin (350px) for seamless 0-lag reading.
 * - Instant mount on anchor link / navbar click / hash navigation.
 * - Zero Layout Shift (CLS) with calibrated minHeight fallback.
 */
export function LazySection({
  id,
  minHeight = '450px',
  rootMargin = '350px 0px',
  hasOwnId = true,
  children,
  className = ''
}) {
  const [shouldMount, setShouldMount] = useState(() => {
    // If URL hash matches this section, mount immediately
    if (typeof window !== 'undefined' && window.location.hash === `#${id}`) {
      return true;
    }
    return false;
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef(null);

  // Check if hash matches on hashchange
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === `#${id}`) {
        setShouldMount(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [id]);

  // Listen to manual navbar trigger events
  useEffect(() => {
    const handleManualMount = (e) => {
      if (e.detail?.id === id || e.detail?.id === 'all') {
        setShouldMount(true);
      }
    };

    window.addEventListener('lazy-section-mount', handleManualMount);
    return () => window.removeEventListener('lazy-section-mount', handleManualMount);
  }, [id]);

  // IntersectionObserver for natural scroll detection
  useEffect(() => {
    if (shouldMount) return;

    if (!('IntersectionObserver' in window)) {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldMount(true);
            observer.disconnect();
            break;
          }
        }
      },
      { rootMargin, threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [shouldMount, rootMargin]);

  // When shouldMount becomes true, mark loaded after a microtask
  useEffect(() => {
    if (shouldMount) {
      setIsLoaded(true);
    }
  }, [shouldMount]);

  // Delegate ID to child once mounted if child has its own id, else keep ID on wrapper
  const containerId = hasOwnId ? (shouldMount ? undefined : id) : id;

  return (
    <div
      ref={containerRef}
      id={containerId}
      data-lazy-section={id}
      className={`lazy-section-container ${
        isLoaded ? 'lazy-section--loaded' : 'lazy-section--pending'
      } ${className}`}
      style={!isLoaded ? { minHeight } : undefined}
    >
      {shouldMount ? (
        <Suspense fallback={<SectionSkeleton minHeight={minHeight} label={id} />}>
          {children}
        </Suspense>
      ) : (
        <SectionSkeleton minHeight={minHeight} label={id} />
      )}
    </div>
  );
}

export default LazySection;
