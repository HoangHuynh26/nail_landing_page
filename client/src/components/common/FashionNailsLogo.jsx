import React from 'react';

export default function FashionNailsLogo({ className = '', size = 'md', showSub = true }) {
  // Size dimensions
  const dimensions = {
    sm: { width: 140, height: 42, iconSize: 28 },
    md: { width: 190, height: 58, iconSize: 36 },
    lg: { width: 260, height: 80, iconSize: 52 },
    hero: { width: 320, height: 96, iconSize: 64 },
  }[size] || { width: 190, height: 58, iconSize: 36 };

  return (
    <div className={`fashion-nails-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <svg
        width={dimensions.iconSize}
        height={dimensions.iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="brand-crest-svg"
        aria-label="Fashion Nails Crest Logo"
      >
        <defs>
          <linearGradient id="roseGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBD7CE" />
            <stop offset="25%" stopColor="#D48278" />
            <stop offset="50%" stopColor="#F8DFD7" />
            <stop offset="75%" stopColor="#BD6D64" />
            <stop offset="100%" stopColor="#EAA397" />
          </linearGradient>
          <linearGradient id="roseGoldShine" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C8746A" />
            <stop offset="50%" stopColor="#FFF0EC" />
            <stop offset="100%" stopColor="#A8574E" />
          </linearGradient>
          <filter id="roseGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D48278" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Crown on top */}
        <path
          d="M38 24L42 32L50 20L58 32L62 24L65 35H35L38 24Z"
          fill="url(#roseGoldGradient)"
          filter="url(#roseGlow)"
        />
        <circle cx="50" cy="19" r="2" fill="#FFF0EC" />
        <circle cx="38" cy="23" r="1.5" fill="#FFF0EC" />
        <circle cx="62" cy="23" r="1.5" fill="#FFF0EC" />

        {/* Left Wings */}
        <path
          d="M44 42C38 35 28 28 14 30C12 36 15 44 24 48C16 48 11 54 13 60C17 66 26 67 36 62C27 66 24 73 29 77C35 80 43 73 47 64L44 42Z"
          fill="url(#roseGoldGradient)"
          opacity="0.95"
        />
        <path
          d="M42 46C35 40 26 36 18 37C20 44 28 48 35 50L42 46Z"
          fill="#FFF0EC"
          opacity="0.6"
        />

        {/* Right Wings */}
        <path
          d="M56 42C62 35 72 28 86 30C88 36 85 44 76 48C84 48 89 54 87 60C83 66 74 67 64 62C73 66 76 73 71 77C65 80 57 73 53 64L56 42Z"
          fill="url(#roseGoldGradient)"
          opacity="0.95"
        />
        <path
          d="M58 46C65 40 74 36 82 37C80 44 72 48 65 50L58 46Z"
          fill="#FFF0EC"
          opacity="0.6"
        />

        {/* Center Diamond Shield */}
        <polygon
          points="50,34 62,48 50,72 38,48"
          fill="#FFFFFF"
          stroke="url(#roseGoldShine)"
          strokeWidth="2.5"
        />

        {/* Rose Gold Monogram "fn" in cursive inside diamond */}
        <text
          x="50"
          y="55"
          fontFamily="'Cormorant Garamond', 'Playfair Display', serif"
          fontSize="14"
          fontWeight="bold"
          fontStyle="italic"
          fill="url(#roseGoldGradient)"
          textAnchor="middle"
          dominantBaseline="central"
        >
          fn
        </text>

        {/* Bottom Sparkle */}
        <circle cx="50" cy="79" r="2" fill="url(#roseGoldGradient)" />
      </svg>

      <div className="brand-text-lockup" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          className="brand-title"
          style={{
            fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: size === 'hero' ? '2.1rem' : size === 'lg' ? '1.65rem' : size === 'sm' ? '1.15rem' : '1.35rem',
            letterSpacing: '0.02em',
            background: 'linear-gradient(135deg, #BD6D64 0%, #D48278 40%, #E8A296 70%, #9F463D 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 2px 10px rgba(212, 130, 120, 0.2)',
          }}
        >
          fashion nails
        </span>
        {showSub && (
          <span
            className="brand-location"
            style={{
              fontFamily: "'Be Vietnam Pro', sans-serif",
              fontSize: size === 'sm' ? '0.62rem' : '0.68rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              marginTop: '1px',
            }}
          >
            Morley Galleria
          </span>
        )}
      </div>
    </div>
  );
}
