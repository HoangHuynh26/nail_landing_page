import React from 'react';

export function Badge({ children, variant = 'gold', className = '' }) {
  return (
    <span className={`atelier-badge atelier-badge--${variant} ${className}`.trim()}>
      <span className="atelier-badge__dot" aria-hidden="true" />
      <span>{children}</span>
    </span>
  );
}
