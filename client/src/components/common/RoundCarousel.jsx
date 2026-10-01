import React, { useEffect, useRef, useState, useMemo } from 'react';

/**
 * Round Carousel — Pure Database 3D Cylindrical Showcase
 * - No buttons: users rotate the 3D cylinder directly via mouse/touch drag.
 * - Dynamic drag speed based on image count:
 *     * Many images (e.g. 16 images): drag moves slowly, controlled, and smoothly ("quay chậm thôi").
 *     * Few images (e.g. 2 images): drag moves faster and responsive, flipping easily ("quay nhanh xíu").
 * - Pure database items: strictly renders the real items from database, zero padding.
 * - Tap to focus: clicking on any card smoothly rotates it front and center.
 */
export default function RoundCarousel({
  images = [],
  imageWidth = 360,
  imageHeight = 360,
  spacing = 2.4,
  speed = 1.0,
  direction = "right",
  drag = true,
  sensitivity = 1.0,
  tilt = -6,
  perspective = 2600,
  cornerRadius = 22,
  innerDim = 3.5,
  background = "transparent",
  style = {},
  onCardClick = null,
  onActiveIndexChange = null,
  isPaused = false,
  targetIndex = null,
}) {
  // Pure database items — strictly 1:1 with database data
  const items = useMemo(() => (Array.isArray(images) && images.length > 0 ? images : []), [images]);
  const count = items.length;

  // Responsive sizing state
  const [responsiveSize, setResponsiveSize] = useState({
    width: imageWidth,
    height: imageHeight
  });

  const ringRef = useRef(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, startX: 0, lastX: 0, moved: false });
  const isHoveredRef = useRef(false);
  const targetAngleRef = useRef(null);
  const activeIdxRef = useRef(0);

  // Auto-adapt sizes to viewport width
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 440) {
        setResponsiveSize({
          width: Math.min(imageWidth, 240),
          height: Math.min(imageHeight, 260)
        });
      } else if (w < 640) {
        setResponsiveSize({
          width: Math.min(imageWidth, 290),
          height: Math.min(imageHeight, 310)
        });
      } else if (w < 900) {
        setResponsiveSize({
          width: Math.min(imageWidth, 330),
          height: Math.min(imageHeight, 350)
        });
      } else {
        setResponsiveSize({
          width: imageWidth,
          height: imageHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageWidth, imageHeight]);

  const effectiveWidth = responsiveSize.width;
  const effectiveHeight = responsiveSize.height;

  // Angular distance between consecutive cards
  const angle = count > 0 ? 360 / count : 60;
  const factor = 1 + spacing * 0.15;

  // 3D cylinder radius:
  // For count = 2: 180° separation with depth separation
  // For count = 3: comfortable triangle separation
  // For count >= 4: regular polygon inradius
  const radius = useMemo(() => {
    if (count <= 1) return 0;
    if (count === 2) {
      return Math.round(effectiveWidth * 0.85);
    }
    if (count === 3) {
      return Math.round(effectiveWidth * 0.75);
    }
    return Math.round((effectiveWidth * factor) / (2 * Math.tan(Math.PI / count)));
  }, [count, effectiveWidth, factor]);

  const radiusPx = cornerRadius;

  // Adaptive auto-rotation speed:
  // - Many images (count >= 10): slow & calm (~4.3 deg/s)
  // - Few images (count 2): ~32 deg/s
  const adaptiveDegPerSec = useMemo(() => {
    if (count <= 1) return 0;

    let targetSecondsPerCard = 5.0;
    if (count === 2) {
      targetSecondsPerCard = 5.6;
    } else if (count >= 12) {
      targetSecondsPerCard = 5.2;
    }

    const baseSpeed = angle / targetSecondsPerCard;
    const mult = typeof speed === 'number' && speed > 0 ? speed : 1.0;
    return baseSpeed * mult * (direction === "left" ? -1 : 1);
  }, [count, angle, speed, direction]);

  // Dynamic drag factor when user holds and drags the mouse:
  // - Many images (count >= 10): 0.07 -> slow, smooth, controlled dragging ("quay chậm thôi")
  // - Medium images (count 4-9): 0.15 - 0.28
  // - Few images (count 3): 0.48
  // - Very few images (count 2): 0.92 -> quick, effortless 180° flip ("quay nhanh xíu")
  const dragFactor = useMemo(() => {
    if (count <= 1) return 0;
    if (count === 2) return 0.92 * sensitivity;
    if (count === 3) return 0.48 * sensitivity;
    if (count === 4) return 0.28 * sensitivity;
    if (count <= 7) return 0.18 * sensitivity;
    if (count <= 10) return 0.12 * sensitivity;
    return 0.07 * sensitivity; // For 11+ images (e.g. 16 images)
  }, [count, sensitivity]);

  // Rotate to targetIndex when requested externally
  useEffect(() => {
    if (targetIndex !== null && targetIndex >= 0 && targetIndex < count) {
      const targetDeg = -targetIndex * angle;
      const current = rotYRef.current;
      const diff = ((targetDeg - current) % 360 + 540) % 360 - 180;
      targetAngleRef.current = current + diff;
      velRef.current = 0;
    }
  }, [targetIndex, angle, count]);

  // Pause 3D animation loop when carousel is outside viewport
  const isVisibleRef = useRef(true);
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
          if (entry.isIntersecting) {
            lastRef.current = performance.now();
          }
        });
      },
      { threshold: 0.05, rootMargin: '100px 0px 100px 0px' }
    );
    observer.observe(ring);
    return () => observer.disconnect();
  }, []);

  // Main 3D render loop with inertial damping & smooth auto-rotation
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || count === 0) return;

    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
    };
    apply();

    const draw = (now) => {
      if (!isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      const d = dragRef.current;

      if (targetAngleRef.current !== null) {
        // Snappy, smooth lerp to target angle (~300ms)
        const diff = targetAngleRef.current - rotYRef.current;
        if (Math.abs(diff) < 0.12) {
          rotYRef.current = targetAngleRef.current;
          targetAngleRef.current = null;
        } else {
          rotYRef.current += diff * Math.min(1, f * 7.5);
        }
      } else if (!d.active) {
        if (Math.abs(velRef.current) > 0.02) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.88; // rapid cushioned decay
        } else if (!isPaused && count > 1) {
          // Slow down on hover (35% speed) so user can easily examine details
          const currentSpeed = isHoveredRef.current ? adaptiveDegPerSec * 0.35 : adaptiveDegPerSec;
          rotYRef.current += currentSpeed * f;
        }
      } else {
        // Holding down mouse without moving:
        // Slow crawl when many images, slightly faster when few images
        if (!d.moved && !isPaused && count > 1) {
          const holdSpeed = count <= 3 ? adaptiveDegPerSec * 0.35 : adaptiveDegPerSec * 0.12;
          rotYRef.current += holdSpeed * f;
        }
      }

      apply();

      // Compute active front-facing item index
      if (count > 0) {
        const normalizedAngle = (((-rotYRef.current) % 360) + 360) % 360;
        const currentIdx = Math.round(normalizedAngle / angle) % count;
        if (currentIdx !== activeIdxRef.current) {
          activeIdxRef.current = currentIdx;
          onActiveIndexChange?.(currentIdx);
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, adaptiveDegPerSec, count, isPaused, angle, onActiveIndexChange]);

  const onPointerDown = (e) => {
    if (!drag || count <= 1) return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch (_) {}
    dragRef.current = {
      active: true,
      startX: e.clientX,
      lastX: e.clientX,
      moved: false,
    };
    velRef.current = 0;
    targetAngleRef.current = null;
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active || count <= 1) return;
    const totalDist = Math.abs(e.clientX - d.startX);
    if (totalDist > 4) {
      d.moved = true;
    }
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;

    // Apply count-adaptive drag factor:
    // Many images -> slow, controlled drag
    // Few images -> fast, responsive drag
    rotYRef.current += dx * dragFactor;

    // Controlled momentum / flick inertia
    const rawVel = dx * dragFactor * (count <= 3 ? 9 : 3.5);
    const maxVel = count <= 3 ? angle * 1.5 : 8.0;
    velRef.current = Math.sign(rawVel) * Math.min(Math.abs(rawVel), maxVel);
  };

  const onPointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    dragRef.current.active = false;
  };

  const handleCardClick = (item, index, e) => {
    e.stopPropagation();
    if (dragRef.current.moved) return;

    if (count > 1) {
      // Rotate to face this card front and center
      const targetDeg = -index * angle;
      const current = rotYRef.current;
      const diff = ((targetDeg - current) % 360 + 540) % 360 - 180;
      targetAngleRef.current = current + diff;
      velRef.current = 0;
    }

    onCardClick?.(item, index);
  };

  const faceBase = {
    position: "absolute",
    inset: 0,
    borderRadius: radiusPx,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  if (count === 0) {
    return null;
  }

  return (
    <div
      className="round-carousel-stage"
      style={{
        ...style,
        width: "100%",
        minHeight: `${effectiveHeight + 150}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag && count > 1 ? "grab" : "default",
        touchAction: count > 1 ? "none" : "auto",
        position: "relative",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => { isHoveredRef.current = false; }}
      role="region"
      aria-label="3D Cylindrical Nail Showcase Carousel"
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
          transition: "transform 0.4s ease-out",
        }}
      >
        <div
          ref={ringRef}
          className="round-carousel-ring"
          style={{
            position: "relative",
            width: effectiveWidth,
            height: effectiveHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item, i) => {
            const src = item?.src;

            return (
              <div
                key={item.id || i}
                className="round-carousel-card"
                onClick={(e) => handleCardClick(item, i, e)}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
              >
                {/* Front face with clean, ultra-luxury gold border and subtle soft shadow */}
                <div
                  style={{
                    ...faceBase,
                    backgroundColor: src ? "transparent" : "#1a1a1a",
                    backgroundImage: src ? `url(${src})` : undefined,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.07), 0 0 0 1.5px rgba(212, 175, 55, 0.35)",
                  }}
                />

                {/* Back face (realistic reverse-dimming for 3D depth) */}
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    backgroundColor: src ? "transparent" : "#111",
                    backgroundImage: src ? `url(${src})` : undefined,
                    filter: `brightness(${innerDim / 10})`,
                    opacity: count <= 2 ? 0.35 : 0.85,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
