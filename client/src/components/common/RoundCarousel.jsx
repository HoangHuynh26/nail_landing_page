import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Round Carousel — Originkit (Enhanced for Luxury Nail Showcase)
 * 3D Cylindrical Carousel with inertia drag, touch gestures, auto-rotation,
 * and responsive dimension scaling.
 */
export default function RoundCarousel({
  images = [],
  imageWidth = 360,
  imageHeight = 360,
  spacing = 2.4,
  speed = 0.6,
  direction = "right",
  drag = true,
  sensitivity = 1.2,
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
  const items = images && images.length > 0 ? images : [];
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

  // Auto-adapt sizes to viewport width with enlarged cards
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

  const angle = count > 0 ? 360 / count : 45;
  const factor = 1 + spacing * 0.15;
  const radius = count > 0 ? (effectiveWidth * factor) / (2 * Math.tan(Math.PI / count)) : 300;
  const radiusPx = cornerRadius;
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);

  // Rotate to specific target index when requested from external buttons
  useEffect(() => {
    if (targetIndex !== null && targetIndex >= 0 && targetIndex < count) {
      // Calculate target angle
      // Card i is at i * angle. To face forward (0 deg), ring should be at -i * angle
      const targetDeg = -targetIndex * angle;
      // Find closest representation relative to current rotY
      const current = rotYRef.current;
      const diff = ((targetDeg - current) % 360 + 540) % 360 - 180;
      targetAngleRef.current = current + diff;
      velRef.current = 0;
    }
  }, [targetIndex, angle, count]);

  // Main 3D render loop with inertial damping & smooth auto-rotation
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring || count === 0) return;

    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;
    };
    apply();

    const draw = (now) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      const d = dragRef.current;

      if (targetAngleRef.current !== null) {
        // Smooth lerp to target angle
        const diff = targetAngleRef.current - rotYRef.current;
        if (Math.abs(diff) < 0.15) {
          rotYRef.current = targetAngleRef.current;
          targetAngleRef.current = null;
        } else {
          rotYRef.current += diff * Math.min(1, f * 2.8);
        }
      } else if (!d.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.84; // rapid cushioned decay
        } else if (!isPaused) {
          // Slow down even further on hover (ultra-slow crawl ~35% speed)
          const currentSpeed = isHoveredRef.current ? degPerSec * 0.35 : degPerSec;
          rotYRef.current += currentSpeed * f;
        }
      } else {
        // Pointer is pressed / held down (d.active = true)
        // If holding without dragging (or subtle press), rotate ultra-slowly ~25% speed
        if (!d.moved && !isPaused) {
          rotYRef.current += degPerSec * 0.25 * f;
        }
      }

      apply();

      // Compute active front-facing index
      const normalizedAngle = (((-rotYRef.current) % 360) + 360) % 360;
      const currentIdx = Math.round(normalizedAngle / angle) % count;
      if (currentIdx !== activeIdxRef.current) {
        activeIdxRef.current = currentIdx;
        onActiveIndexChange?.(currentIdx);
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count, isPaused, angle, onActiveIndexChange]);

  const onPointerDown = (e) => {
    if (!drag) return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch (_) {}
    dragRef.current = {
      active: true,
      startX: e.clientX,
      lastX: e.clientX,
      moved: false
    };
    velRef.current = 0;
    targetAngleRef.current = null;
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const totalDist = Math.abs(e.clientX - d.startX);
    if (totalDist > 4) {
      d.moved = true;
    }
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    // Gentle damped factor for buttery smooth luxury feel
    const k = 0.07 * sensitivity;
    rotYRef.current += dx * k;
    // Soft, capped inertia velocity so it glides and never flings wildly
    const rawVel = dx * k * 12;
    velRef.current = Math.sign(rawVel) * Math.min(Math.abs(rawVel), 12);
  };

  const onPointerUp = (e) => {
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch (_) {}
    dragRef.current.active = false;
  };

  const handleCardClick = (item, index, e) => {
    e.stopPropagation();
    // If user dragged more than 6px, treat as drag, not a click
    if (dragRef.current.moved) return;

    // Rotate to face this card
    const targetDeg = -index * angle;
    const current = rotYRef.current;
    const diff = ((targetDeg - current) % 360 + 540) % 360 - 180;
    targetAngleRef.current = current + diff;
    velRef.current = 0;

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
        cursor: drag ? "grab" : "default",
        touchAction: "none",
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
            const title = item?.title_vi || item?.title_en || item?.title;
            const category = item?.category_vi || item?.category_en || item?.tag_vi || item?.tag_en;

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
                {/* Front face with ultra-luxury finish */}
                <div
                  style={{
                    ...faceBase,
                    backgroundColor: src ? "transparent" : "#1a1a1a",
                    backgroundImage: src ? `url(${src})` : undefined,
                    boxShadow: "0 14px 40px rgba(0, 0, 0, 0.45), 0 0 0 1.5px rgba(212, 175, 55, 0.35)",
                  }}
                >
                  {/* Subtle luxury vignette & sheen overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.85) 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Bottom title & category overlay */}
                  {(title || category) && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: "16px 14px",
                        color: "#fff",
                        pointerEvents: "none",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      {category && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#E2C376",
                            fontWeight: 600,
                            display: "inline-block",
                            background: "rgba(0, 0, 0, 0.5)",
                            backdropFilter: "blur(6px)",
                            padding: "2px 8px",
                            borderRadius: "100px",
                            alignSelf: "flex-start",
                            border: "1px solid rgba(226, 195, 118, 0.35)",
                          }}
                        >
                          {category}
                        </span>
                      )}
                      {title && (
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            lineHeight: 1.25,
                            textShadow: "0 2px 4px rgba(0,0,0,0.8)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {title}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Golden corner highlight */}
                  <div
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: "#E2C376",
                      boxShadow: "0 0 10px #E2C376",
                    }}
                  />
                </div>

                {/* Back face (Originkit signature reverse-dimming for 3D realism) */}
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    backgroundColor: src ? "transparent" : "#111",
                    backgroundImage: src ? `url(${src})` : undefined,
                    filter: `brightness(${innerDim / 10})`,
                    boxShadow: "0 10px 24px rgba(0,0,0,0.5)",
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
