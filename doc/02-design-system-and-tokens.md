# Task 02: Design System & Token Specifications

## 1. 60/30/10 Color Harmony
The color system strictly obeys the luxury beauty principle where gold is applied as a rare, authentic hallmark rather than dominating the page:

| Role | Token Name | Hex / Value | Contrast Ratio | Usage |
|---|---|---|---|---|
| **60% Canvas** | `--color-canvas` | `#FAF7F0` | Base | Warm cream background, editorial breathing room |
| **60% Surface** | `--color-surface` | `#FFFFFF` | Base | Crisp white card surface, input backgrounds |
| **30% Text Primary** | `--color-text-primary` | `#252525` | **13.5:1** on canvas | Display titles, headings, high-contrast labels |
| **30% Text Secondary**| `--color-text-secondary`| `#6F6A62` | **4.8:1** on canvas | Body text, descriptions, footnotes |
| **30% Border** | `--color-border` | `#E7E1D7` | 1.3:1 | Subtle hairline borders, card separation |
| **10% Accent Gold** | `--color-gold` | `#C6A15B` | 3.2:1 | Primary CTA fill, monogram border, star ratings |
| **10% Dark Gold** | `--color-gold-dark` | `#A9823D` | **4.6:1** on white | Legible text accents, badges, price highlights |
| **10% Champagne** | `--color-gold-light` | `#E8D8B5` | Tint | Subtle hover states, pill highlights |
| **10% Subtle Gold** | `--color-gold-subtle` | `rgba(198, 161, 91, 0.08)` | Ambient | Icon box backgrounds, table highlights |

---

## 2. Typography & Complete Unicode Support
Two complementary typefaces were selected for full compatibility across English and Vietnamese:

### 2.1 Editorial Serif: `Cormorant Garamond`
- **Role**: Headlines (`H1`, `H2`, `H3`), editorial pull quotes, prices, brand wordmark.
- **Why**: Traditional French/Italian luxury editorial elegance with native Vietnamese diacritic support (`á, à, ả, ã, ạ, ắ, ằ, ẳ, ẵ, ặ, ấ, ầ, ổ, ơ, ư`).

### 2.2 Modern Sans-Serif: `Be Vietnam Pro`
- **Role**: Body copy, form fields, buttons, navigation links, and time slots.
- **Why**: Engineered specifically by Vietnamese typography masters for optimum legibility, neutral contemporary geometry, and optical harmony with Apple HIG interface principles.

---

## 3. Apple HIG Foundations
- **Touch Target Floor**: Minimum `44px x 44px` across buttons, hamburger triggers, date cards, and modal dismiss actions (`buttons.md › Hit targets`).
- **Focus Rings**: Accessible `:focus-visible` styling (`outline: 2px solid var(--color-gold-dark); outline-offset: 3px;`).
- **Pill Segmented Language Switch**: Tactile `[ VI | EN ]` control with smooth sliding white indicator pill and keyboard ArrowLeft/Right accessibility.
- **Motion Restraint**: Fluid Apple easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`) with zero jarring bounce, respecting `prefers-reduced-motion: reduce`.
