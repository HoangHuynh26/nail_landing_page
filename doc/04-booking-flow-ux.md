# Task 04: Frictionless 6-Step Booking Flow UX

## 1. Flow Overview
The booking funnel breaks a complex appointment scheduling process into 6 effortless, low-cognitive-load steps:

```
[ Step 1: Treatment ] ──► [ Step 2: Date ] ──► [ Step 3: Time ] ──► [ Step 4: Details ] ──► [ Step 5: Review ] ──► [ Step 6: Confirmation ]
  Service Cards             14-Day Strip         Pill Slots           Name & AU Phone        Complete Summary       Booking Ref & Calendar
```

---

## 2. Micro-Interactions & Step Mechanics

### Step 1: Select Treatment
- Radio selection cards with duration and AUD price.
- If the user clicked "Select Service" on a specific card on the landing page, the modal opens directly into Step 2 with that service already selected.

### Step 2: Choose Date
- 14-day interactive card strip showing Day of Week, Date number, and Month.
- Automatically greys out Sundays (Atelier is closed).
- Includes native HTML5 `<input type="date">` fallback with `min` set to today to prevent booking in the past.

### Step 3: Select Time Slot
- Grid of clean pill buttons (`09:30 AM`, `10:15 AM`, `11:00 AM`, etc.).
- Occupied slots are visibly styled with `is-booked` and disabled to prevent double-booking.

### Step 4: Contact Information
- Full Name: Validated for 2–100 characters, XSS sanitized.
- Mobile Phone: Validated for Australian formats (`04XX XXX XXX`, `+61 4XX XXX XXX`) and international numbers.
- Optional Notes: For allergies, nail conditions, or old gel removal.

### Step 5: Review Appointment
- Summary card presenting the service name, scheduled date, time, duration, estimated total in AUD, client name, and phone.
- Reassurance notice: No prepayment required; payments are settled at the salon.
- Submit button with animated loading spinner.

### Step 6: Confirmation & Calendar Synchronization
- Displays confirmed booking reference (e.g., `AURA-4809`).
- **"Add to Calendar (.ics)"**: Generates and downloads a RFC 5545-compliant `.ics` iCalendar file that syncs directly with Apple Calendar, Outlook, and mobile devices.
- **"Google Calendar"**: Generates a prefilled web link with appointment name, salon address, and start/end timestamps.
