import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function PromoCustomSelect({
  value,
  onChange,
  options = [],
  icon: Icon,
  className = '',
  ariaLabel = 'Select option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOpt = options.find((opt) => String(opt.value) === String(value)) || options[0];
  const displayLabel = selectedOpt ? selectedOpt.label : value;

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`admin-promo-custom-select-wrap ${className} ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`admin-promo-custom-select-btn ${isOpen ? 'is-active' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <div className="admin-promo-custom-select-btn-content">
          {Icon && <Icon size={14} className="admin-promo-custom-select-icon" />}
          {selectedOpt?.dot && (
            <span className={`admin-promo-opt-dot admin-promo-opt-dot--${selectedOpt.dot}`} />
          )}
          <span className="admin-promo-custom-select-display-text" title={displayLabel}>
            {displayLabel}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`admin-promo-custom-select-chevron ${isOpen ? 'is-rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="admin-promo-custom-select-dropdown" role="listbox">
          <div className="admin-promo-custom-select-dropdown-inner">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`admin-promo-custom-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="admin-promo-custom-select-option-left">
                    {opt.dot && (
                      <span className={`admin-promo-opt-dot admin-promo-opt-dot--${opt.dot}`} />
                    )}
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check size={15} className="admin-promo-custom-select-check" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PromoCustomSelect;
