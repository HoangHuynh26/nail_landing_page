import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function GalleryCustomSelect({
  value,
  onChange,
  options = [],
  className = '',
  ariaLabel = 'Select option'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const activeItemRef = useRef(null);

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

  // Scroll active item into view on open
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
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
      className={`admin-gallery-custom-select-wrap ${className} ${isOpen ? 'is-open' : ''}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`admin-gallery-custom-select-btn ${isOpen ? 'is-active' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="admin-gallery-custom-select-display-text" title={displayLabel}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`admin-gallery-custom-select-chevron ${isOpen ? 'is-rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="admin-gallery-custom-select-dropdown" role="listbox">
          <div className="admin-gallery-custom-select-dropdown-inner">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  ref={isSelected ? activeItemRef : null}
                  type="button"
                  className={`admin-gallery-custom-select-option ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="admin-gallery-custom-select-option-label">
                    {opt.label}
                  </span>
                  {isSelected && (
                    <Check size={16} className="admin-gallery-custom-select-check" />
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

export default GalleryCustomSelect;
