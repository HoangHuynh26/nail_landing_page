import React from 'react';

/**
 * Reusable Apple-inspired Button Component
 * Meets HIG minimum 44px touch target guidelines
 */
export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'outline'
  size = 'md',        // 'sm' | 'md' | 'lg'
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
  id,
  'aria-label': ariaLabel,
  icon: Icon = null,
  ...props
}) {
  const baseClasses = 'atelier-btn';
  const variantClass = `atelier-btn--${variant}`;
  const sizeClass = `atelier-btn--${size}`;
  const widthClass = fullWidth ? 'atelier-btn--full' : '';
  const loadingClass = loading ? 'atelier-btn--loading' : '';

  return (
    <button
      id={id}
      type={type}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="atelier-btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {Icon && <Icon className="atelier-btn__icon" size={18} aria-hidden="true" />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
