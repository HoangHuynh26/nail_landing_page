import React, { useEffect, useMemo, useRef, useState } from 'react';

const MAX_SCALE = 1.6;
const MIN_SCALE = 0.55;

function wrap(value, span) {
  return ((value % span) + span) % span;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function resolveSrc(value) {
  if (!value) return null;
  if (typeof value === 'string') return value || null;
  if (typeof value === 'object') {
    return value.src || value.avatar || value.image || null;
  }
  return null;
}

function imageOf(item) {
  if (item && typeof item === 'object' && 'image' in item) {
    return resolveSrc(item.image);
  }
  return resolveSrc(item);
}

function offsetOf(item) {
  if (item && typeof item === 'object' && 'offsetY' in item) {
    const offset = item.offsetY;
    return typeof offset === 'number' && isFinite(offset) ? offset : 0;
  }
  return 0;
}

function placeholderFill(index) {
  const hue = (index * 47 + 210) % 360;
  return `linear-gradient(150deg, hsl(${hue} 42% 34%), hsl(${(hue + 45) % 360} 55% 10%))`;
}

/**
 * SmoothScrollSlider — Originkit (Enhanced for Luxury Testimonials & Showcase)
 * Features dynamic scale, edge dimming, inertia drag, wheel scrolling,
 * infinite looping, and responsive sizing.
 */
export default function SmoothScrollSlider({
  images = [],
  items = [],
  slideWidth = 380,
  slideHeight = 440,
  spacing = 2,
  direction = "right",
  smoothness = 10,
  radius = 20,
  dim = 8,
  background = "transparent",
  sensitivity = 5,
  loop = true,
  autoDrift = true,
  driftSpeed = 0.8,
  renderSlide = null,
  style = {},
  onSlideClick = null,
}) {
  const containerRef = useRef(null);
  const nodes = useRef([]);
  const target = useRef(0);
  const current = useRef(0);
  const [width, setWidth] = useState(0);

  // Responsive dimensions
  const [responsiveDimensions, setResponsiveDimensions] = useState({
    w: slideWidth,
    h: slideHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      const screenW = window.innerWidth;
      if (screenW < 480) {
        setResponsiveDimensions({
          w: Math.min(slideWidth, 290),
          h: Math.min(slideHeight, 400),
        });
      } else if (screenW < 768) {
        setResponsiveDimensions({
          w: Math.min(slideWidth, 330),
          h: Math.min(slideHeight, 420),
        });
      } else {
        setResponsiveDimensions({
          w: slideWidth,
          h: slideHeight,
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [slideWidth, slideHeight]);

  const activeSlideWidth = responsiveDimensions.w;
  const activeSlideHeight = responsiveDimensions.h;

  // Resolve data source (supports both `items` and `images` props)
  const inputSource = useMemo(() => {
    if (items && items.length > 0) return items;
    if (images && images.length > 0) return images;
    return [];
  }, [items, images]);

  const source = useMemo(() => {
    const resolved = [];
    for (const item of inputSource) {
      const src = imageOf(item);
      resolved.push({
        src,
        offsetY: offsetOf(item),
        raw: item,
      });
    }
    return resolved.length
      ? resolved
      : Array.from({ length: 6 }, (_, i) => ({
          src: null,
          offsetY: 0,
          raw: null,
        }));
  }, [inputSource]);

  const step = activeSlideWidth + clamp(spacing, 0, 10) * 16;
  const ease = 0.15 - (clamp(smoothness, 0, 10) / 10) * 0.12;
  const dimAmount = (clamp(dim, 0, 10) / 10) * 0.75;
  const wheelMultiplier = 0.4 + (clamp(sensitivity, 0, 10) / 10) * 1.2;
  const dragMultiplier = 0.6 + (clamp(sensitivity, 0, 10) / 10) * 1.8;
  const flip = direction === "left";

  const repeats = useMemo(() => {
    if (!loop || width <= 0 || step <= 0) return 1;
    return Math.max(1, Math.ceil((width + step * 3) / (source.length * step)));
  }, [loop, width, step, source.length]);

  const slides = useMemo(() => {
    const out = [];
    for (let r = 0; r < repeats; r += 1) {
      out.push(...source);
    }
    return out;
  }, [source, repeats]);

  const isInteracting = useRef(false);
  const isHovered = useRef(false);

  const frame = useRef({
    count: 0,
    step: 0,
    slideWidth: 0,
    width: 0,
    ease: 0.075,
    maxScale: MAX_SCALE,
    minScale: MIN_SCALE,
    dim: 0,
    loop: true,
    flip: false,
  });

  frame.current = {
    count: slides.length,
    step,
    slideWidth: activeSlideWidth,
    width,
    ease,
    maxScale: MAX_SCALE,
    minScale: MIN_SCALE,
    dim: dimAmount,
    loop,
    flip,
  };

  const input = useRef({ wheelMultiplier, dragMultiplier, flip });
  input.current = { wheelMultiplier, dragMultiplier, flip };

  // Observe width
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0] && entries[0].contentRect) {
        setWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(node);
    setWidth(node.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    nodes.current.length = slides.length;
  }, [slides.length]);

  // Main animation frame tick loop
  useEffect(() => {
    let raf = 0;
    let last = 0;

    const tick = (now) => {
      raf = requestAnimationFrame(tick);
      const c = frame.current;
      const delta = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      if (!c.count || c.step <= 0 || c.width <= 0) return;

      const span = c.count * c.step;

      // Gentle auto-drift when not user-dragging or hovered
      if (autoDrift && !isInteracting.current && !isHovered.current) {
        target.current += (c.flip ? -1 : 1) * driftSpeed * delta * 60;
      }

      if (c.loop) {
        if (current.current > span || current.current < -span) {
          const shift = Math.trunc(current.current / span) * span;
          current.current -= shift;
          target.current -= shift;
        }
      } else {
        target.current = clamp(target.current, 0, (c.count - 1) * c.step);
      }

      const k = 1 - Math.pow(1 - c.ease, delta * 60);
      current.current += (target.current - current.current) * k;

      const pad = (c.width - c.slideWidth) / 2;
      const half = c.width / 2;

      for (let i = 0; i < c.count; i += 1) {
        const node = nodes.current[i];
        if (!node) continue;

        const raw = i * c.step - current.current + pad;
        const x = c.loop ? wrap(raw + c.step, span) - c.step : raw;

        const distance = x + c.slideWidth / 2 - half;
        let scale;
        let push;
        if (distance > 0) {
          scale = Math.min(c.maxScale, 1 + (distance / c.width) * 0.45);
          push = (scale - 1) * c.slideWidth * 0.5;
        } else {
          scale = Math.max(c.minScale, 1 + (distance / c.width) * 0.45);
          push = 0;
        }

        const left = c.flip ? c.width - c.slideWidth - (x + push) : x + push;
        node.style.transform = `translate3d(${left}px, -50%, 0) scale(${scale})`;

        if (c.dim > 0 && scale < 1) {
          const t = (1 - scale) / Math.max(0.001, 1 - c.minScale);
          node.style.filter = `brightness(${Math.max(0.25, 1 - t * c.dim)})`;
        } else {
          node.style.filter = "none";
        }
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoDrift, driftSpeed]);

  // Horizontal Wheel / Trackpad listener
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const onWheel = (event) => {
      // Only hijack when user uses horizontal scroll / shift key or dominant deltaX
      const isHorizontalDominant = Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (isHorizontalDominant || event.shiftKey) {
        event.preventDefault();
        const delta = isHorizontalDominant ? event.deltaX : event.deltaY;
        target.current += delta * input.current.wheelMultiplier;
      }
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  // Pointer drag gestures
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    let pointer = null;
    let lastX = 0;

    const onDown = (event) => {
      if (pointer !== null) return;
      pointer = event.pointerId;
      lastX = event.clientX;
      isInteracting.current = true;
      try {
        node.setPointerCapture(event.pointerId);
      } catch (_) {}
    };

    const onMove = (event) => {
      if (pointer !== event.pointerId) return;
      const dx = event.clientX - lastX;
      lastX = event.clientX;
      target.current += (input.current.flip ? dx : -dx) * input.current.dragMultiplier;
    };

    const onUp = (event) => {
      if (pointer !== event.pointerId) return;
      pointer = null;
      isInteracting.current = false;
      try {
        if (node.hasPointerCapture(event.pointerId)) {
          node.releasePointerCapture(event.pointerId);
        }
      } catch (_) {}
    };

    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerup", onUp);
    node.addEventListener("pointercancel", onUp);
    return () => {
      node.removeEventListener("pointerdown", onDown);
      node.removeEventListener("pointermove", onMove);
      node.removeEventListener("pointerup", onUp);
      node.removeEventListener("pointercancel", onUp);
    };
  }, []);

  // Expose step function via custom container attributes or window helper
  const handlePrevStep = (e) => {
    e?.stopPropagation();
    target.current -= step;
  };

  const handleNextStep = (e) => {
    e?.stopPropagation();
    target.current += step;
  };

  return (
    <div
      className="smooth-scroll-slider-wrapper"
      style={{
        position: "relative",
        width: "100%",
        minHeight: `${activeSlideHeight + 60}px`,
        ...style,
      }}
      onMouseEnter={() => { isHovered.current = true; }}
      onMouseLeave={() => { isHovered.current = false; }}
    >
      <div
        ref={containerRef}
        className="smooth-scroll-slider-viewport"
        style={{
          position: "relative",
          width: "100%",
          height: `${activeSlideHeight + 40}px`,
          overflow: "hidden",
          background,
          cursor: "grab",
          touchAction: "pan-y",
          opacity: width > 0 ? 1 : 0,
          transition: "opacity 0.35s ease",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              nodes.current[i] = el;
            }}
            className="smooth-scroll-slider-node"
            onClick={() => onSlideClick?.(slide.raw || slide, i)}
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: activeSlideWidth,
              height: activeSlideHeight,
              borderRadius: radius,
              overflow: "hidden",
              background: slide.src ? "#181414" : placeholderFill(i),
              willChange: "transform, filter",
              transform: "translate3d(0, -50%, 0)",
              cursor: "pointer",
              boxShadow: "0 14px 38px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(212, 175, 55, 0.22)",
            }}
          >
            {renderSlide ? (
              renderSlide(slide.raw || slide, i, {
                width: activeSlideWidth,
                height: activeSlideHeight,
              })
            ) : slide.src ? (
              <img
                src={slide.src}
                alt=""
                draggable={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `50% calc(50% + ${slide.offsetY}px)`,
                  display: "block",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
