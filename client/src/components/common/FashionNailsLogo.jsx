import React from 'react';

export default function FashionNailsLogo({ className = '', size = 'md', showSub = true, mode = 'lockup' }) {
  // Size dimensions
  const dimensions = {
    sm: { height: 34, fontSize: '1.2rem', subSize: '0.62rem', gap: '10px' },
    md: { height: 44, fontSize: '1.4rem', subSize: '0.68rem', gap: '12px' },
    lg: { height: 58, fontSize: '1.75rem', subSize: '0.78rem', gap: '14px' },
    hero: { height: 76, fontSize: '2.2rem', subSize: '0.9rem', gap: '16px' },
  }[size] || { height: 44, fontSize: '1.4rem', subSize: '0.68rem', gap: '12px' };

  if (mode === 'full') {
    return (
      <div className={`fashion-nails-brand ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <img
          src="/images/logo.png"
          alt="Fashion Nails Morley"
          style={{
            height: `${dimensions.height * 1.6}px`,
            width: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 4px 12px rgba(197, 168, 128, 0.35))'
          }}
          loading="eager"
        />
      </div>
    );
  }

  return (
    <div 
      className={`fashion-nails-brand ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: dimensions.gap }}
    >
      <img
        src="/images/logo-icon.png"
        alt="Fashion Nails Golden Wings Crest"
        className="brand-crest-img"
        style={{
          height: `${dimensions.height}px`,
          width: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 8px rgba(197, 168, 128, 0.45))'
        }}
        loading="eager"
      />

      <div className="brand-text-lockup" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span
          className="brand-title"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontStyle: 'normal',
            fontWeight: 700,
            fontSize: dimensions.fontSize,
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
              fontFamily: "'Inter', sans-serif",
              fontSize: dimensions.subSize,
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-text-secondary)',
              marginTop: '2px',
            }}
          >
            Morley Galleria
          </span>
        )}
      </div>
    </div>
  );
}
