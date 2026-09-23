import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, X, Phone, Calendar, HelpCircle, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../../data/faqData';

export function FAQ() {
  const { openBooking } = useBooking();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState('diff-biab-gelx-acrylic');

  // Filter FAQ items by category & search keyword
  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const q = item.qEn.toLowerCase();
        const a = item.aEn.toLowerCase();
        const tag = item.tagEn.toLowerCase();
        return q.includes(query) || a.includes(query) || tag.includes(query);
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Compute count per category for filter pills
  const categoryCounts = useMemo(() => {
    const counts = { all: FAQ_ITEMS.length };
    FAQ_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  // Helper to render formatted answers with bullet points
  const renderAnswer = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('•')) {
        return (
          <span key={idx} className="faq-item__answer-bullet">
            <strong>{trimmed.substring(0, trimmed.indexOf(':') + 1 || 1)}</strong>
            {trimmed.substring(trimmed.indexOf(':') + 1 || 1)}
          </span>
        );
      }
      return (
        <p key={idx} className="faq-item__answer-line">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <section id="faq" className="section faq-section" aria-labelledby="faq-heading">
      <div className="container faq-section__container">
        <SectionHeader
          title="Frequently Asked Questions"
          subtitle="Essential details on BIAB technology, hospital-grade sterilisation, booking policies, and your visit to Morley Galleria."
        />

        {/* Sticky Quick Search Bar for FAQ */}
        <div className="faq-search-sticky-wrap">
          <div className="faq-search-wrap">
            <Search size={18} className="faq-search-icon" aria-hidden="true" />
            <input
              id="faq-search-input-field"
              type="text"
              className="faq-search-input"
              placeholder="Search questions: BIAB, Acrylic, removal, pregnancy, parking, voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search FAQ"
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="faq-controls">
          <div className="faq-filters" role="tablist" aria-label="FAQ Categories">
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;

              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`faq-filter-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span>{cat.labelEn}</span>
                  <span className="faq-filter-btn__count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-accordion" role="region" aria-label="FAQ Questions List">
          {filteredItems.length === 0 ? (
            <div className="faq-empty">
              <HelpCircle size={40} style={{ color: 'var(--color-gold)', margin: '0 auto 12px' }} />
              <div className="faq-empty__title">
                No matching questions found
              </div>
              <p>
                Try different keywords or call us directly on (08) 9375 2888.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openId === item.id;
              const question = item.qEn;
              const answer = item.aEn;
              const tag = item.tagEn;

              return (
                <div
                  key={item.id}
                  className={`faq-item ${isOpen ? 'is-open' : ''}`}
                >
                  <button
                    type="button"
                    id={`faq-btn-${item.id}`}
                    className="faq-item__trigger"
                    onClick={() => toggle(item.id)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${item.id}`}
                  >
                    <div className="faq-item__header-left">
                      <span className="faq-item__tag">{tag}</span>
                      <span className="faq-item__question">{question}</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`faq-item__icon ${isOpen ? 'is-rotated' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`faq-panel-${item.id}`}
                    className="faq-item__panel"
                    role="region"
                    aria-labelledby={`faq-btn-${item.id}`}
                    hidden={!isOpen}
                  >
                    <div className="faq-item__answer">
                      {renderAnswer(answer)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
