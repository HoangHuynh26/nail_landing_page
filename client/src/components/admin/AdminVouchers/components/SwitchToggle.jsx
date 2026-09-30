import React from 'react';

/**
 * iOS-style Toggle Switch
 * Vibrant green track (#00c853) with smooth sliding white circle thumb
 */
export function SwitchToggle({ checked, onChange, disabled = false, size = 'md', label = '', title = '' }) {
  const isLg = size === 'lg';

  return (
    <div className="admin-switch-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled && onChange) onChange(!checked);
        }}
        title={title || (checked ? 'Click to deactivate' : 'Click to activate')}
        className={`admin-switch-btn ${isLg ? 'admin-switch-btn--lg' : 'admin-switch-btn--sm'} ${checked ? 'is-active' : 'is-inactive'}`}
      >
        <span
          className={`admin-switch-thumb ${isLg ? 'admin-switch-thumb--lg' : 'admin-switch-thumb--sm'} ${checked ? (isLg ? 'is-active-lg' : 'is-active-sm') : ''}`}
        />
      </button>
      {label && (
        <span className={`admin-switch-label ${checked ? 'is-active' : ''}`}>
          {label}
        </span>
      )}
    </div>
  );
}

export default SwitchToggle;
