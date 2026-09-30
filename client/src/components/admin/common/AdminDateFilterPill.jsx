import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import './AdminDateFilterPill.css';

export function AdminDateFilterPill({ label, value, onChange, options = [], title, alignRight = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

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

  const selectedOption = options.find((opt) => String(opt.value) === String(value)) || options[0];
  const rawLabel = selectedOption ? selectedOption.label : value;

  // Clean compact label for the pill button (e.g. "Day 30 (Today)" -> "Day 30", "2026 (This Year)" -> "2026")
  // Prevents text truncation like "Day 3(" on narrow mobile screens
  const compactLabel = React.useMemo(() => {
    if (!rawLabel) return value;
    return String(rawLabel).replace(/\s*\([^)]*\)/, '');
  }, [rawLabel, value]);

  return (
    <div className="admin-date-pill-wrapper" ref={containerRef} title={title}>
      {/* Invisible native select on mobile devices for smooth native picker */}
      <select
        className="admin-date-pill-native-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={title || label}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

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
        <div className={`admin-date-pill-menu ${alignRight ? 'admin-date-pill-menu--right' : ''}`} role="listbox">
          <div className="admin-date-pill-menu-inner">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  className={`admin-date-pill-item ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <span className="admin-date-pill-item-label">{opt.label}</span>
                  {isSelected && <Check size={14} className="admin-date-pill-item-check" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDateFilterPill;
