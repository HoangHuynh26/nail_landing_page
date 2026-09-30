import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './ScheduleCustomSelect.css';

export default function ScheduleCustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  className = '',
  align = 'left',
  disabled = false,
  ariaLabel
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

  // Scroll active item into view when opening
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen]);

  // Normalize options: supports string array or { value, label, subtitle }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: String(opt.value),
        label: opt.label !== undefined ? String(opt.label) : String(opt.value),
        subtitle: opt.subtitle || null
      };
    }
    return { value: String(opt), label: String(opt), subtitle: null };
  });

  const selectedOpt = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOpt ? selectedOpt.label : (value || placeholder);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`admin-schedule-custom-select-wrap ${className} ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`admin-schedule-custom-select-btn ${isOpen ? 'is-active' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || displayLabel}
      >
        <span className="admin-schedule-custom-select-display-text" title={displayLabel}>
          {displayLabel}
        </span>
        <ChevronDown
          size={14}
          className={`admin-schedule-custom-select-chevron ${isOpen ? 'is-rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          role="listbox"
          className={`admin-schedule-custom-select-dropdown admin-schedule-custom-select-dropdown--${align}`}
        >
          <div className="admin-schedule-custom-select-dropdown-inner">
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  ref={isSelected ? activeItemRef : null}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`admin-schedule-custom-select-option ${isSelected ? 'is-selected' : ''}`}
                >
                  <div className="admin-schedule-custom-select-option-content">
                    <span className="admin-schedule-custom-select-option-title">{opt.label}</span>
                    {opt.subtitle && (
                      <span className="admin-schedule-custom-select-option-sub">{opt.subtitle}</span>
                    )}
                  </div>
                  {isSelected && (
                    <Check size={14} className="admin-schedule-custom-select-check" />
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
