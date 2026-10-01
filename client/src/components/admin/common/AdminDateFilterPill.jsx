import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './AdminDateFilterPill.css';

export function AdminDateFilterPill({
  label,
  value,
  onChange,
  options = [],
  title,
  align = 'left',
  alignRight = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const activeItemRef = useRef(null);

  const effectiveAlign = alignRight ? 'right' : align;

  // Close when clicking/touching outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('pointerdown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active item into view when opening dropdown
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];
  const rawLabel = selectedOption ? selectedOption.label : value;

  // Clean compact label for the pill button (e.g. "Day 30 (Today)" -> "Day 30", "2026 (This Year)" -> "2026")
  // Prevents text truncation like "Day 3(" on narrow mobile screens
  const compactLabel = React.useMemo(() => {
    if (!rawLabel) return value;
    return String(rawLabel).replace(/\s*\([^)]*\)/, '');
  }, [rawLabel, value]);

  const handleSelect = (optVal) => {
    onChange(optVal);
    setIsOpen(false);
  };

  return (
    <div
      className={`admin-date-pill-wrapper ${isOpen ? 'is-open' : ''}`}
      ref={containerRef}
      title={title}
    >
      <button
        type="button"
        className={`admin-date-pill-btn ${isOpen ? 'is-active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="admin-date-pill-tag">{label}</span>
        <span className="admin-date-pill-text">{compactLabel}</span>
        <ChevronDown size={13} className={`admin-date-pill-arrow ${isOpen ? 'is-open' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`admin-date-pill-menu admin-date-pill-menu--${effectiveAlign}`}
          role="listbox"
        >
          <div className="admin-date-pill-menu-inner">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  ref={isSelected ? activeItemRef : null}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`admin-date-pill-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span className="admin-date-pill-item-label">{opt.label}</span>
                  {isSelected && <Check size={14} className="admin-date-pill-item-check" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDateFilterPill;
