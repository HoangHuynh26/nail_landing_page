# Task 09: Netlify Deployment & Serverless Architecture Guide

## 1. Overview
The **Atelier Lumière Melbourne** application is completely optimized for continuous deployment on **Netlify**. It features a modern decoupled architecture:
- **Static Frontend**: React 19 + Vite SPA built to `client/dist` and served via Netlify's global CDN with instant cache invalidation.
- **Serverless Backend API**: Netlify Serverless Function (`netlify/functions/api.js`) handling `/api/health` and `/api/bookings` with zero server maintenance, zero idle costs, and automatic scaling.
- **Make.com Integration**: The serverless function reads `MAKE_WEBHOOK_URL` securely from Netlify Environment Variables, preventing client-side exposure.

---

## 2. Modular Component Breakdown
The frontend is decomposed into small, single-responsibility, highly maintainable components:

```
client/src/
├── components/
│   ├── layout/
│   │   ├── AnnouncementBar.jsx   # Top location & opening hours banner
│   │   ├── Navbar.jsx            # Frosted glass header & desktop navigation
│   │   ├── MobileDrawer.jsx      # Apple-inspired mobile sliding sheet
│   │   ├── MobileStickyCTA.jsx   # Conversion-boosting sticky bottom bar for mobile
│   │   └── Footer.jsx            # Australian legal details, hours, and social media
│   ├── ui/
│   │   ├── Button.jsx            # Reusable button with loading states & 44px HIG targets
│   │   ├── Badge.jsx             # Luxury gold pill labels
│   │   ├── LanguageSwitch.jsx    # Apple segmented toggle [ VI | EN ]
│   │   └── SectionHeader.jsx     # Editorial typography heading component
│   ├── sections/
│   │   ├── Hero.jsx              # Editorial split layout & verified Google reviews
│   │   ├── TrustBar.jsx          # 4 core hygiene & ethics standards
│   │   ├── Services.jsx          # Filterable treatments catalog
│   │   ├── PricingTable.jsx      # Transparent AUD pricing matrix
│   │   ├── WhyChooseUs.jsx       # 4 pillar value proposition cards
│   │   ├── About.jsx             # Brand story & atelier interior photography
│   │   ├── Gallery.jsx           # Asymmetrical editorial portfolio
│   │   ├── Testimonials.jsx      # Verified client reviews
│   │   ├── FAQ.jsx               # Apple-style accessible accordion
│   │   └── FinalCTA.jsx          # Closing booking invitation card
│   └── booking/
│       ├── BookingModal.jsx      # Modal wrapper with stepper progress
│       ├── StepService.jsx       # Step 1: Select treatment
│       ├── StepDate.jsx          # Step 2: 14-day date strip + HTML5 calendar
│       ├── StepTime.jsx          # Step 3: Select available time slot
│       ├── StepDetails.jsx       # Step 4: Full name & Australian phone input
│       ├── StepReview.jsx        # Step 5: Summary review & policy notice
│       └── StepConfirmation.jsx  # Step 6: Booking reference & .ics/Google Calendar sync
├── context/
│   ├── LanguageContext.jsx       # Dual language state & localStorage persistence
│   └── BookingContext.jsx        # Global appointment state & API dispatchers
├── data/
│   ├── services.js               # Treatment menu (durations, AUD prices)
│   ├── testimonials.js           # Client reviews & Melbourne suburbs
│   └── gallery.js                # Editorial photography items
└── styles/
    ├── tokens.css                # 60/30/10 colors, typography scales, radii, shadows
    ├── base.css                  # CSS reset, accessibility focus rings, motion queries
    └── components.css            # Component-level styling
```

---

## 3. How to Deploy to Netlify (Step-by-Step)

### Option A: Via Netlify Web Dashboard (Connected to Git)
1. Push your code to your GitHub, GitLab, or Bitbucket repository.
2. Log into [Netlify](https://app.netlify.com/) and click **"Add new site"** > **"Import an existing project"**.
3. Select your repository.
4. Netlify will automatically detect [`netlify.toml`](file:///c:/nail_salon_landing_page/netlify.toml):
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
5. Go to **Site Configuration** > **Environment Variables** and add:
   - `MAKE_WEBHOOK_URL` = `https://hook.eu1.make.com/your-custom-webhook-url`
6. Click **Deploy Site**. Your luxury nail salon landing page and serverless booking system will be live globally in under 60 seconds!

### Option B: Via Netlify CLI
```bash
# 1. Install Netlify CLI globally if needed
npm install -g netlify-cli

# 2. Build the production client
cd client
npm run build

# 3. Deploy directly to Netlify
netlify deploy --prod
```

---

## 4. Testing the Netlify Serverless Function Locally
You can run Netlify's local development emulator anytime:
```bash
npx netlify dev
```
This emulates Netlify CDN, edge routing, and serverless functions locally on port `8888`.
- Frontend: `http://localhost:8888`
- Health check: `http://localhost:8888/api/health`
- Bookings API: `http://localhost:8888/api/bookings`
