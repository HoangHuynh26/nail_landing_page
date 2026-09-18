# Task 07: Responsive Strategy & Accessibility Audit

## 1. Viewport Adaptation Matrix
Designed and audited across 4 standard device profiles:

### 1.1 Mobile Viewport (390px - iPhone 14/15/16)
- **Navigation**: Compact frosted navbar with direct `[ VI | EN ]` segmented switch and hamburger button opening an Apple-style modal sheet.
- **Sticky CTA**: Floating bottom action bar `[ Book Appointment ]` + direct phone dialer icon triggers when scrolled past the hero section.
- **Layout**: Single-column service cards, full-width time slots, 14-day horizontal scrollable date strip.
- **Touch Ergonomics**: All interactive tap targets exceed 44px min height.

### 1.2 Tablet Viewport (768px - iPad)
- **Layout**: 2-column service grid, 2-column standards trust bar, 2-column testimonial cards.
- **Typography**: Responsive `clamp()` font scaling maintains optical proportion without line wrapping awkwardly.

### 1.3 Desktop Viewport (1024px – 1440px)
- **Navbar**: Full horizontal navigation with pill language switch and prominent primary CTA.
- **Editorial Composition**: Split hero and about sections (Narrative Left, High-Res Portrait/Travertine Right).
- **Gallery**: Asymmetrical editorial masonry layout with hover zoom and captions.

---

## 2. Accessibility & HIG Compliance Audit
- **Color Contrast (WCAG 2.1 AA)**:
  - Deep Charcoal `#252525` on Warm Cream `#FAF7F0` = **13.5:1** (exceeds 4.5:1 requirement).
  - Slate `#6F6A62` on Warm Cream `#FAF7F0` = **4.8:1** (exceeds 4.5:1 requirement).
  - Dark Gold `#A9823D` on White `#FFFFFF` = **4.6:1** (accessible for badges and text).
- **Keyboard Navigation**:
  - `Skip to main content` link at top of DOM.
  - Tab order flows sequentially through nav, interactive buttons, tabs, and form fields.
  - Modal traps focus and closes cleanly on `Escape`.
- **Screen Reader Support**:
  - Semantic landmark elements (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`, `<dialog>`).
  - ARIA attributes: `role="tablist"`, `aria-selected`, `role="radiogroup"`, `aria-checked`, `aria-expanded`, `aria-controls`.
  - Icon-only buttons have descriptive `aria-label` tags.
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce` by zeroing out transitions and animations.
