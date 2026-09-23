import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Calendar,
  Phone,
  RotateCcw,
  Bot,
  User,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useBooking } from '../../context/BookingContext';
import {
  QUICK_PROMPTS,
  INITIAL_MESSAGES,
  FAQ_RESPONSES,
  findChatResponse
} from '../../data/chatbotKnowledge';

const CONCIERGE_TIPS = [
  {
    badge: 'Fashion Nails Concierge',
    text: 'Hello! Looking for nail styles or pricing advice today? ✨'
  },
  {
    badge: 'Nail Care & Styling',
    text: 'Need help choosing between BIAB, SNS dipping, or Acrylic sets? Ask me anything! 💅'
  },
  {
    badge: 'Special Savings',
    text: 'Did you know? We offer 10% OFF for Seniors, Students & Galleria Staff! 🏷️'
  },
  {
    badge: 'Complimentary Consult',
    text: 'Have a Pinterest or Instagram inspo design? Book a free consultation with our artists! 🎨'
  },
  {
    badge: 'Visit Us in Morley',
    text: 'Located opposite Kmart, Level 1 Morley Galleria. Walk-ins are always welcome! 🏬'
  },
  {
    badge: 'Bridal & Occasion Packages',
    text: 'Planning a wedding or party? We craft custom bridal packages for groups! 👰'
  }
];

export function QuickChatbot() {
  const { openBooking } = useBooking();

  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState(() => INITIAL_MESSAGES.en);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isChipsExpanded, setIsChipsExpanded] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 1. Proactive welcome speech bubble after 2.5 seconds
  useEffect(() => {
    if (isOpen) return;

    const timer = setTimeout(() => {
      setShowWelcomeBubble(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // 2. Rotate to different messages every 1 minute (60,000 ms) if customer stays on the site
  useEffect(() => {
    if (isOpen) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % CONCIERGE_TIPS.length);
      setShowWelcomeBubble(true);
      setHasUnread(true);
    }, 60000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages, isTyping]);

  const toggleChat = () => {
    if (!isOpen) {
      setIsOpen(true);
      setShowWelcomeBubble(false);
      setHasUnread(false);
    } else {
      setIsOpen(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES.en);
  };

  const handleActionClick = (action) => {
    if (!action) return;

    if (action.type === 'book') {
      openBooking(action.serviceId || null);
    } else if (action.type === 'call') {
      window.location.href = 'tel:+61893752888';
    } else if (action.type === 'pricing') {
      const el = document.getElementById('pricing') || document.getElementById('services');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSend = (textToSend = null) => {
    const content = typeof textToSend === 'string' ? textToSend : inputValue;
    if (!content || !content.trim() || isTyping) return;

    const trimmed = content.trim();

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate smart bot typing response (400-650ms for realistic natural cadence)
    setTimeout(() => {
      const botReply = findChatResponse(trimmed, 'en');
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply.text,
        action: botReply.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 550);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const prompts = QUICK_PROMPTS.en;

  // Simple parser to render **bold** text and lists cleanly
  const renderFormattedText = (rawText) => {
    const lines = rawText.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <span key={idx} className="chatbot__break" />;
      }

      // Convert **bold** tags to <strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <p key={idx} className="chatbot__text-line">
          {formattedLine}
        </p>
      );
    });
  };

  return (
    <aside className="chatbot-root" aria-label="Fashion Nails Virtual Concierge">
      {/* 1. Proactive Welcome Speech Bubble (When closed, rotates every 1 min) */}
      {!isOpen && showWelcomeBubble && (
        <div 
          className="chatbot-welcome-bubble" 
          role="alert"
          key={currentTipIndex}
        >
          <button
            type="button"
            className="chatbot-welcome-bubble__close"
            onClick={(e) => {
              e.stopPropagation();
              setShowWelcomeBubble(false);
            }}
            aria-label="Close notification"
          >
            <X size={13} />
          </button>
          <div className="chatbot-welcome-bubble__inner" onClick={toggleChat}>
            <span className="chatbot-welcome-bubble__badge">
              <Sparkles size={13} /> {CONCIERGE_TIPS[currentTipIndex].badge}
            </span>
            <p className="chatbot-welcome-bubble__text">
              {CONCIERGE_TIPS[currentTipIndex].text}
            </p>
          </div>
        </div>
      )}

      {/* 2. Floating Action Button (Trigger) */}
      <button
        type="button"
        id="quick-chatbot-toggle-btn"
        className={`chatbot-trigger-btn ${isOpen ? 'chatbot-trigger-btn--open' : ''}`}
        onClick={toggleChat}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close chat concierge' : 'Open Fashion Nails Concierge'}
      >
        <span className="chatbot-trigger-btn__glow" aria-hidden="true" />
        
        {/* Pulsing Online Green Status Dot */}
        <span className="chatbot-trigger-btn__status" aria-label="Online">
          <span className="chatbot-trigger-btn__status-ring" />
          <span className="chatbot-trigger-btn__status-dot" />
        </span>

        {/* Dynamic Icon */}
        <span className="chatbot-trigger-btn__icon-wrapper">
          {isOpen ? (
            <X size={24} className="chatbot-trigger-btn__icon chatbot-trigger-btn__icon--close" />
          ) : (
            <MessageCircle size={24} className="chatbot-trigger-btn__icon chatbot-trigger-btn__icon--chat" />
          )}
        </span>

        {/* Unread notification badge */}
        {!isOpen && hasUnread && (
          <span className="chatbot-trigger-btn__badge" aria-label="1 new message">
            1
          </span>
        )}
      </button>

      {/* 3. Luxury Chatbot Window Modal / Popover */}
      {isOpen && (
        <>
          {/* Mobile Dim Blur Backdrop Overlay */}
          <div
            className="chatbot-mobile-backdrop"
            onClick={toggleChat}
            aria-hidden="true"
          />

          <div
            className="chatbot-window"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chatbot-header-title"
          >
            {/* Header */}
            <div className="chatbot-header">
              <div className="chatbot-header__brand">
                <div className="chatbot-header__avatar">
                  <Sparkles size={18} className="chatbot-header__avatar-icon" />
                </div>
                <div className="chatbot-header__info">
                  <div className="chatbot-header__title-row">
                    <h3 id="chatbot-header-title" className="chatbot-header__title">
                      Fashion Nails
                    </h3>
                  </div>
                  <div className="chatbot-header__status">
                    <span className="chatbot-header__dot" />
                    <span className="chatbot-header__status-text">
                      Online & Ready to Help
                    </span>
                  </div>
                </div>
              </div>

              <div className="chatbot-header__actions">
                {/* Close window */}
                <button
                  type="button"
                  className="chatbot-header__btn chatbot-header__btn--close"
                  onClick={toggleChat}
                  title="Close"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

          {/* Quick FAQ / Prompt Chips */}
          <div className="chatbot-chips-container" aria-label="Quick suggestions">
            <div className="chatbot-chips-header">
              <span className="chatbot-chips-label">
                ⚡ Quick suggestions:
              </span>
              <button
                type="button"
                className="chatbot-chips-toggle"
                onClick={() => setIsChipsExpanded(prev => !prev)}
                aria-expanded={isChipsExpanded}
                title={isChipsExpanded ? 'Collapse' : 'Expand'}
              >
                <span>{isChipsExpanded ? 'Hide' : 'Show (6)'}</span>
                <ChevronDown
                  size={13}
                  className={`chatbot-chips-toggle-icon ${isChipsExpanded ? 'chatbot-chips-toggle-icon--up' : ''}`}
                />
              </button>
            </div>
            {isChipsExpanded && (
              <div className="chatbot-chips-wrap">
                {prompts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="chatbot-chip"
                    onClick={() => handleSend(p.text)}
                  >
                    {p.text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Stream */}
          <div className="chatbot-messages" tabIndex={0}>
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`chatbot-message-row ${
                    isBot ? 'chatbot-message-row--bot' : 'chatbot-message-row--user'
                  }`}
                >
                  {isBot && (
                    <div className="chatbot-message__avatar" aria-hidden="true">
                      <Sparkles size={14} />
                    </div>
                  )}

                  <div className="chatbot-message-col">
                    <div className={`chatbot-bubble ${isBot ? 'chatbot-bubble--bot' : 'chatbot-bubble--user'}`}>
                      <div className="chatbot-bubble__content">
                        {renderFormattedText(msg.text)}
                      </div>

                      {/* Interactive Action Button (e.g. Book Now, Call, View Price) */}
                      {msg.action && (
                        <div className="chatbot-bubble__action">
                          <button
                            type="button"
                            className="chatbot-action-btn"
                            onClick={() => handleActionClick(msg.action)}
                          >
                            <span>
                              {msg.action.labelEn || msg.action.labelVi}
                            </span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="chatbot-message__time">{msg.time}</span>
                  </div>

                  {!isBot && (
                    <div className="chatbot-message__avatar chatbot-message__avatar--user" aria-hidden="true">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bouncing Typing Animation */}
            {isTyping && (
              <div className="chatbot-message-row chatbot-message-row--bot">
                <div className="chatbot-message__avatar" aria-hidden="true">
                  <Sparkles size={14} />
                </div>
                <div className="chatbot-bubble chatbot-bubble--bot chatbot-bubble--typing">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input & Send Form */}
          <form
            className="chatbot-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="chatbot-input-field"
              placeholder="Ask about prices, BIAB, bookings..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Message input"
            />
            <button
              type="submit"
              className="chatbot-send-btn"
              disabled={!inputValue.trim() || isTyping}
              aria-label="Send question"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Footer Quick Bar */}
          <div className="chatbot-footer-bar">
            <button
              type="button"
              className="chatbot-footer-link"
              onClick={() => openBooking()}
            >
              <Calendar size={13} />
              Book Online
            </button>
            <span className="chatbot-footer-divider">•</span>
            <a href="tel:+61893752888" className="chatbot-footer-link">
              <Phone size={13} />
              (08) 9375 2888
            </a>
          </div>
        </div>
      </>
    )}
  </aside>
);
}

export default QuickChatbot;
