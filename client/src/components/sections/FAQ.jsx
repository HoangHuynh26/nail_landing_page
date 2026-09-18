import React, { useState, useMemo } from 'react';
import { ChevronDown, Search, X, Phone, Calendar, Sparkles, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { FAQ_CATEGORIES, FAQ_ITEMS } from '../../data/faqData';

export function FAQ() {
  const { t, language } = useLanguage();
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
        const q = (language === 'vi' ? item.qVi : item.qEn).toLowerCase();
        const a = (language === 'vi' ? item.aVi : item.aEn).toLowerCase();
        const tag = (language === 'vi' ? item.tagVi : item.tagEn).toLowerCase();
        return q.includes(query) || a.includes(query) || tag.includes(query);
      }
      return true;
    });
  }, [activeCategory, searchQuery, language]);

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
          {line}
        </p>
      );
    });
  };

  return (
    <section id="faq" className="section faq-section" aria-labelledby="faq-heading">
      <div className="container faq-section__container">
        <SectionHeader
          badgeText={language === 'vi' ? 'Tiêu Chuẩn Tiệm Nail Tại Úc' : 'Perth Nail Salon Standards'}
          title={language === 'vi' ? 'Giải Đáp Thắc Mắc Thường Gặp' : 'Frequently Asked Questions'}
          subtitle={
            language === 'vi'
              ? 'Tổng hợp thông tin chi tiết về công nghệ móng BIAB, khử trùng y tế, đặt lịch và tiện ích tại Morley Galleria.'
              : 'Essential details on BIAB technology, hospital-grade sterilisation, booking policies, and your visit to Morley Galleria.'
          }
        />

        {/* Search & Category Filter Controls */}
        <div className="faq-controls">
          {/* Quick Search Bar */}
          <div className="faq-search-wrap">
            <Search size={18} className="faq-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="faq-search-input"
              placeholder={
                language === 'vi'
                  ? 'Tìm kiếm: BIAB, Acrylic, tháo móng, bà bầu, bãi đậu xe, voucher...'
                  : 'Search questions: BIAB, Acrylic, removal, pregnancy, parking, voucher...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={language === 'vi' ? 'Tìm câu hỏi' : 'Search FAQ'}
            />
            {searchQuery && (
              <button
                type="button"
                className="faq-search-clear"
                onClick={() => setSearchQuery('')}
                aria-label={language === 'vi' ? 'Xoá tìm kiếm' : 'Clear search'}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
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
                  <span>{language === 'vi' ? cat.labelVi : cat.labelEn}</span>
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
                {language === 'vi' ? 'Không tìm thấy câu hỏi phù hợp' : 'No matching questions found'}
              </div>
              <p>
                {language === 'vi'
                  ? `Thử tìm từ khoá khác hoặc gọi trực tiếp (08) 9375 2888 để được giải đáp.`
                  : `Try different keywords or call us directly on (08) 9375 2888.`}
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isOpen = openId === item.id;
              const question = language === 'vi' ? item.qVi : item.qEn;
              const answer = language === 'vi' ? item.aVi : item.aEn;
              const tag = language === 'vi' ? item.tagVi : item.tagEn;

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

        {/* Contact & Booking Support Prompt */}
        <div className="faq-contact-box">
          <div className="faq-contact-box__info">
            <div className="faq-contact-box__title">
              {language === 'vi' ? 'Bạn vẫn còn câu hỏi riêng về móng?' : 'Have More Questions About Your Nails?'}
            </div>
            <div className="faq-contact-box__desc">
              {language === 'vi'
                ? 'Đội ngũ chuyên viên Fashion Nails luôn sẵn sàng tư vấn dáng móng và dịch vụ phù hợp nhất cho bạn.'
                : 'Our friendly nail artisans are happy to assist with custom art quotes, bridal packages, and consultations.'}
            </div>
          </div>
          <div className="faq-contact-box__actions">
            <a
              href="tel:0893752888"
              className="btn btn--secondary btn--md"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Phone size={16} />
              <span>(08) 9375 2888</span>
            </a>
            <Button
              variant="primary"
              size="md"
              onClick={() => openBooking()}
              icon={Calendar}
            >
              {language === 'vi' ? 'Đặt Lịch Hẹn Ngay' : 'Book Appointment'}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
