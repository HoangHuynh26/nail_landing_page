import React, { useState, useEffect, useRef } from 'react';

/**
 * Smooth Scroll-Reveal Section (Ẩn rồi hiện lên mượt mà theo yêu cầu)
 * - Các section bắt đầu ở trạng thái ẩn (opacity: 0, trượt nhẹ xuống 28px).
 * - Khi người dùng cuộn tới gần (viewport intersection), section lướt lên và hiện ra mượt mà (opacity: 1, translateY: 0).
 * - Hoàn toàn KHÔNG có skeleton chập chờn hay hiện tượng giật lag gián đoạn.
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
    // Nếu URL hash đang trỏ tới section này, hiển thị ngay lập tức
    if (typeof window !== 'undefined' && window.location.hash === `#${id}`) {
      setIsRevealed(true);
      return;
    }

    // Lắng nghe sự kiện click từ thanh Navbar hoặc Drawer để hiển thị tức thì
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

  // Nếu component con đã có sẵn id (ví dụ: <section id="services">), không gán trùng id lên wrapper
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
