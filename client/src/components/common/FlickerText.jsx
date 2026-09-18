import React, { useState, useEffect, useRef } from 'react';

/**
 * Cubic Bezier solver for custom easing curves
 */
function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(dx) < 1e-6) break;
      if (d === 0) break;
      t -= dx / d;
    }
    return sampleY(Math.max(0, Math.min(1, t)));
  };
}

function makeEaseFn(ease) {
  if (Array.isArray(ease) && ease.length === 4) {
    return cubicBezier(ease[0], ease[1], ease[2], ease[3]);
  }
  switch (ease) {
    case 'linear':
      return (t) => t;
    case 'easeIn':
      return (t) => t * t;
    case 'easeOut':
      return (t) => 1 - (1 - t) * (1 - t);
    case 'easeInOut':
      return (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
    case 'circIn':
      return (t) => 1 - Math.sqrt(1 - t * t);
    case 'circOut':
      return (t) => Math.sqrt(1 - (t - 1) * (t - 1));
    case 'circInOut':
      return (t) =>
        t < 0.5
          ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
          : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
    case 'backIn':
      return (t) => 2.70158 * t * t * t - 1.70158 * t * t;
    case 'backOut':
      return (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
    default:
      return (t) => t;
  }
}

function buildTextCfg(m) {
  return {
    duration: m?.ease?.duration ?? 3,
    easeCurve: m?.ease?.ease ?? 'easeInOut',
    flickerCount: m?.flickerCount ?? 6,
    showStroke: m?.showStroke ?? true,
    strokePosition: m?.strokePosition ?? 'start',
    strokeCount: m?.strokeCount ?? 2,
    strokeColor: m?.strokeColor ?? '#E2C376',
    strokeWidth: m?.strokeWidth ?? 1.5,
    restState: m?.restState ?? 'filled',
    delay: m?.delay ?? 0,
    shakeEnabled: m?.shakeEnabled ?? false,
    shakeWidth: m?.shakeWidth ?? 10,
    shakeSpeed: m?.shakeSpeed ?? 10,
    wordFlickerEnabled: m?.wordFlickerEnabled ?? true,
    letterFlickerEnabled: m?.letterFlickerEnabled ?? true,
    letterFlickerMode: m?.letterFlickerMode ?? 'stroke',
    letterFlickerIntensity: m?.letterFlickerIntensity ?? 10,
    letterFlickerOpacity: m?.letterFlickerOpacity ?? 30,
  };
}

function buildImageCfg(m) {
  return {
    duration: m?.ease?.duration ?? 5,
    easeCurve: m?.ease?.ease ?? 'linear',
    flickerCount: m?.flickerCount ?? 4,
    showStroke: false,
    strokePosition: 'start',
    strokeCount: 1,
    strokeColor: '#ffffff',
    strokeWidth: 1.5,
    restState: m?.restState ?? 'filled',
    delay: m?.delay ?? 0,
    shakeEnabled: m?.shakeEnabled ?? false,
    shakeWidth: m?.shakeWidth ?? 10,
    shakeSpeed: m?.shakeSpeed ?? 10,
    wordFlickerEnabled: true,
    letterFlickerEnabled: false,
    letterFlickerMode: 'stroke',
    letterFlickerIntensity: 10,
    letterFlickerOpacity: 30,
  };
}

const COMPONENT_DEFAULTS = {
  contentType: 'text',
  text: 'Flicker Text',
  font: {
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    fontSize: 'inherit',
    lineHeight: '1.2em',
    letterSpacing: '-0.01em',
  },
  colorMode: 'solid',
  fontColor: '#FFFFFF',
  gradientAngle: 135,
  gradientStart: '#F9E4B7',
  gradientEnd: '#D4AF37',
  textEnterFlickerEnabled: true,
  flicker: {
    position: 'above',
    replay: 'yes',
    restState: 'filled',
    delay: 0,
    ease: { type: 'tween', duration: 2, ease: 'easeInOut' },
    flickerCount: 6,
    showStroke: true,
    strokePosition: 'start',
    strokeCount: 2,
    strokeColor: '#E2C376',
    strokeWidth: 1.5,
    wordFlickerEnabled: true,
    shakeEnabled: false,
    shakeWidth: 8,
    shakeSpeed: 10,
    letterFlickerEnabled: true,
    letterFlickerMode: 'stroke',
    letterFlickerOpacity: 30,
    letterFlickerIntensity: 10,
  },
  textHoverFlickerEnabled: true,
  flickerHover: {
    ease: { type: 'tween', duration: 1.2, ease: 'easeInOut' },
    flickerCount: 3,
    showStroke: true,
    strokePosition: 'middle',
    strokeCount: 1,
    strokeColor: '#E2C376',
    strokeWidth: 1.5,
    wordFlickerEnabled: false,
    shakeEnabled: false,
    shakeWidth: 6,
    shakeSpeed: 10,
    letterFlickerEnabled: true,
    letterFlickerMode: 'stroke',
    letterFlickerOpacity: 40,
    letterFlickerIntensity: 10,
  },
  tag: 'h2',
};

/**
 * Flicker Text — Originkit (OutlineFillText)
 * Cyberpunk / Luxury Neon flickering text effect with stroke/fill phases and letter shimmer.
 */
export function FlickerText(props) {
  const mergedProps = { ...COMPONENT_DEFAULTS, ...props };
  const {
    contentType,
    text,
    image,
    font,
    colorMode,
    fontColor,
    gradientStart,
    gradientEnd,
    gradientAngle,
    tag,
    textEnterFlickerEnabled,
    flicker,
    textHoverFlickerEnabled,
    flickerHover,
    imageEnterFlickerEnabled,
    flickerImage,
    imageHoverFlickerEnabled,
    flickerImageHover,
    className = '',
    style = {},
  } = mergedProps;

  const isImage = (contentType ?? 'text') === 'image';

  const enterCfg = isImage ? buildImageCfg(flickerImage) : buildTextCfg(flicker);
  const hoverCfg = isImage ? buildImageCfg(flickerImageHover) : buildTextCfg(flickerHover);

  const enterEnabled = isImage
    ? (imageEnterFlickerEnabled ?? true)
    : (textEnterFlickerEnabled ?? true);
  const hoverEnabled = isImage
    ? (imageHoverFlickerEnabled ?? false)
    : (textHoverFlickerEnabled ?? false);

  const enterModal = isImage ? flickerImage : flicker;
  const replay = enterModal?.replay ?? 'no';
  const amount = enterModal?.position ?? 'above';

  const initialCfg = enterEnabled ? enterCfg : hoverEnabled ? hoverCfg : enterCfg;
  const [activeCfg, setActiveCfg] = useState(initialCfg);
  const [currentPhase, setCurrentPhase] = useState(initialCfg.restState);
  const [moveX, setMoveX] = useState(0);
  const [flickerLetters, setFlickerLetters] = useState(new Set());

  const timersRef = useRef([]);
  const elementRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const enterDoneRef = useRef(!enterEnabled);

  const getThreshold = () => {
    switch (amount) {
      case 'above':
        return 0;
      case 'middle':
        return 0.35;
      case 'below':
        return 0.75;
      default:
        return 0;
    }
  };

  function generateTimings(count, totalMs, easeCurve) {
    const slots = count;
    const fn = makeEaseFn(easeCurve);
    const intervals = [];
    let prev = 0;
    for (let i = 1; i <= slots; i++) {
      const t = i / slots;
      const cur = fn(t) * totalMs;
      intervals.push(Math.max(0, cur - prev));
      prev = cur;
    }
    return intervals;
  }

  function buildVisibleItems(cfg) {
    const sc = Math.min(cfg.strokeCount ?? 1, cfg.flickerCount);
    if (!cfg.showStroke) {
      return Array(cfg.flickerCount).fill('filled');
    }
    const fillCount = Math.max(1, cfg.flickerCount - sc);
    const strokes = Array(sc).fill('outline');
    const pos = cfg.strokePosition ?? 'start';
    if (pos === 'start') {
      return [...strokes, ...Array(fillCount).fill('filled')];
    }
    if (pos === 'end') {
      return [...Array(fillCount - 1).fill('filled'), ...strokes, 'filled'];
    }
    const before = Math.floor(fillCount / 2);
    const after = fillCount - before;
    return [...Array(before).fill('filled'), ...strokes, ...Array(after).fill('filled')];
  }

  function runAnimation(cfg) {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setFlickerLetters(new Set());
    setActiveCfg(cfg);
    if (!cfg.wordFlickerEnabled && !cfg.letterFlickerEnabled) return;

    const totalMs = cfg.duration * 1000;
    const chars = (text ?? '').split('');
    const nonSpaceIndices = chars.reduce((acc, c, i) => {
      if (c.trim() !== '') acc.push(i);
      return acc;
    }, []);

    const scheduleTicks = (windowStart, windowDuration) => {
      if (!cfg.letterFlickerEnabled || nonSpaceIndices.length === 0) return;
      const cycleDuration = Math.round(
        1000 * Math.pow(50 / 1000, (cfg.letterFlickerIntensity - 1) / 19)
      );
      const sub1 = Math.round(cycleDuration / 3);
      const sub2 = Math.round((2 * cycleDuration) / 3);
      const windowEnd = windowStart + windowDuration;
      let tickCursor = windowStart;

      while (tickCursor < windowEnd) {
        const tFlicker1 = tickCursor;
        const tFill = tickCursor + sub1;
        const tFlicker2 = tickCursor + sub2;
        const slot = { sel: new Set() };

        timersRef.current.push(
          setTimeout(() => {
            const count = Math.min(nonSpaceIndices.length, Math.floor(Math.random() * 2) + 1);
            const shuffled = [...nonSpaceIndices].sort(() => Math.random() - 0.5);
            slot.sel = new Set(shuffled.slice(0, count));
            setFlickerLetters(slot.sel);
          }, tFlicker1)
        );

        if (tFill < windowEnd) {
          timersRef.current.push(
            setTimeout(() => setFlickerLetters(new Set()), tFill)
          );
        }

        if (tFlicker2 < windowEnd) {
          timersRef.current.push(
            setTimeout(() => setFlickerLetters(slot.sel), tFlicker2)
          );
        }

        tickCursor += cycleDuration;
      }

      timersRef.current.push(
        setTimeout(() => setFlickerLetters(new Set()), windowEnd)
      );
    };

    if (cfg.wordFlickerEnabled) {
      setCurrentPhase(cfg.restState);
      setMoveX(0);
      const visibleItems = buildVisibleItems(cfg);
      const sequence = [];
      visibleItems.forEach((item) => {
        sequence.push('invisible');
        sequence.push(item);
      });

      const intervals = generateTimings(sequence.length, totalMs, cfg.easeCurve);
      let cursor = cfg.delay * 1000;

      sequence.forEach((phase, i) => {
        const startMs = cursor;
        const durationMs = intervals[i] ?? 0;
        timersRef.current.push(
          setTimeout(() => setCurrentPhase(phase), startMs)
        );
        if (phase === 'filled' || phase === 'outline') {
          scheduleTicks(startMs, durationMs);
        }
        cursor += durationMs;
      });

      timersRef.current.push(
        setTimeout(() => {
          setCurrentPhase(cfg.restState);
          setMoveX(0);
          setFlickerLetters(new Set());
        }, cursor)
      );

      if (cfg.shakeEnabled) {
        const flipMs = Math.round(500 * Math.pow(30 / 500, (cfg.shakeSpeed - 1) / 19));
        let flipCursor = cfg.delay * 1000;
        let dir = 1;
        while (flipCursor < cursor) {
          const t = flipCursor;
          const d = dir;
          timersRef.current.push(
            setTimeout(() => setMoveX(d * cfg.shakeWidth), t)
          );
          dir *= -1;
          flipCursor += flipMs;
        }
      }
    } else {
      scheduleTicks(cfg.delay * 1000, totalMs);
    }
  }

  // Effect for IntersectionObserver (Enter trigger)
  useEffect(() => {
    if (!enterEnabled) return;
    const element = elementRef.current;
    if (!element) return;

    const threshold = getThreshold();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!hasPlayedRef.current) {
              hasPlayedRef.current = true;
              enterDoneRef.current = false;
              runAnimation(enterCfg);
              const totalMs = (enterCfg.delay + enterCfg.duration) * 1000;
              timersRef.current.push(
                setTimeout(() => {
                  enterDoneRef.current = true;
                }, totalMs)
              );
            }
          } else {
            if (replay === 'yes') {
              hasPlayedRef.current = false;
              enterDoneRef.current = false;
              timersRef.current.forEach(clearTimeout);
              timersRef.current = [];
              setFlickerLetters(new Set());
              setCurrentPhase(enterCfg.restState);
              setMoveX(0);
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
    };
  }, [enterEnabled, text, replay]);

  const handleMouseEnter = () => {
    if (!hoverEnabled) return;
    if (enterEnabled && !enterDoneRef.current) return;
    runAnimation(hoverCfg);
  };

  // External trigger for parent button hover
  useEffect(() => {
    if (props.triggerFlicker && hoverEnabled) {
      runAnimation(hoverCfg);
    }
  }, [props.triggerFlicker, hoverEnabled]);

  const getFilledStyle = () => {
    if (colorMode === 'gradient') {
      return {
        background: `linear-gradient(${gradientAngle}deg, ${gradientStart}, ${gradientEnd})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        WebkitTextStroke: '0px transparent',
        color: 'transparent',
      };
    }
    return {
      color: fontColor,
      WebkitTextFillColor: fontColor,
      WebkitTextStroke: '0px transparent',
      background: 'none',
    };
  };

  const getTextStyle = () => {
    switch (currentPhase) {
      case 'invisible':
        return {
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: '0px transparent',
          background: 'none',
        };
      case 'outline':
        return {
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: `${activeCfg.strokeWidth}px ${activeCfg.strokeColor}`,
          background: 'none',
        };
      case 'filled':
        return getFilledStyle();
      default:
        return {
          color: 'transparent',
          WebkitTextFillColor: 'transparent',
          WebkitTextStroke: '0px transparent',
          background: 'none',
        };
    }
  };

  const getImageStyle = () => {
    switch (currentPhase) {
      case 'invisible':
        return { opacity: 0 };
      case 'outline':
        return { opacity: 0.18 };
      case 'filled':
        return { opacity: 1 };
      default:
        return { opacity: 0 };
    }
  };

  const sharedContainerStyle = {
    transform: `translateX(${moveX}px)`,
    transition: 'none',
    cursor: hoverEnabled ? 'pointer' : undefined,
  };

  const getFlickerLetterStyle = () => {
    if (activeCfg.letterFlickerMode === 'stroke') {
      if (currentPhase === 'outline') {
        return {
          opacity: 0,
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          WebkitTextStroke: '0px transparent',
          background: 'none',
        };
      }
      return {
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
        WebkitTextStroke: `${activeCfg.strokeWidth}px ${activeCfg.strokeColor}`,
        background: 'none',
        WebkitBackgroundClip: 'unset',
        backgroundClip: 'unset',
      };
    }
    return { opacity: activeCfg.letterFlickerOpacity / 100 };
  };

  const renderText = () => {
    if (
      !activeCfg.letterFlickerEnabled ||
      (currentPhase !== 'filled' && currentPhase !== 'outline') ||
      flickerLetters.size === 0
    ) {
      return text;
    }
    return (text ?? '').split('').map((char, i) => {
      if (char.trim() === '' || !flickerLetters.has(i)) {
        return <span key={i}>{char}</span>;
      }
      return (
        <span key={i} style={getFlickerLetterStyle()}>
          {char}
        </span>
      );
    });
  };

  if (isImage) {
    return (
      <div
        ref={elementRef}
        onMouseEnter={handleMouseEnter}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          ...sharedContainerStyle,
          ...getImageStyle(),
          ...style,
        }}
      >
        {image ? (
          <img
            src={image}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        ) : null}
      </div>
    );
  }

  const Tag = tag || 'h2';

  return (
    <Tag
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      className={className}
      style={{
        margin: 0,
        padding: 0,
        ...sharedContainerStyle,
        ...font,
        ...getTextStyle(),
        ...style,
      }}
    >
      {renderText()}
    </Tag>
  );
}

export default FlickerText;
export const OutlineFillText = FlickerText;
