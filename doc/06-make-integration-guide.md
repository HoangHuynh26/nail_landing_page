# Task 06: Make.com & Google Sheets Integration Guide

## 1. Architectural Pipeline
```
[ Browser Client ] ──────────► [ Express Backend ] ──────────► [ Make.com Webhook ] ──────────► [ Google Sheets CRM ]
  User submits form              Validates & saves              Receives JSON payload             Appends row & sends SMS
```

---

## 2. Configuration (`.env`)
In `server/.env`:
```env
MAKE_WEBHOOK_URL=https://hook.eu1.make.com/your-custom-webhook-url
```

---

## 3. Webhook Payload Structure
Every valid booking sends the following normalized JSON payload to Make.com:

```json
{
  "bookingId": "AURA-4809",
  "serviceId": "biab-signature",
  "serviceName": "Signature BIAB Natural Nail Sculpting",
  "date": "2026-09-25",
  "time": "10:15 AM",
  "fullName": "Charlotte Vance",
  "phone": "+61 412 345 678",
  "notes": "Gentle cuticle care",
  "language": "en",
  "status": "pending",
  "createdAt": "2026-09-16T10:36:53.288Z",
  "source": "website"
}
```

---

## 4. Google Sheets Column Mapping
Create a Google Sheet with the following headers in Row 1:

| Column | Header Name | Example Value |
|---|---|---|
| A | `Booking ID` | `AURA-4809` |
| B | `Created At` | `2026-09-25T10:36:53.288Z` |
| C | `Language` | `en` |
| D | `Service` | `Signature BIAB Natural Nail Sculpting` |
| E | `Date` | `2026-09-25` |
| F | `Time` | `10:15 AM` |
| G | `Full Name` | `Charlotte Vance` |
| H | `Phone` | `+61 412 345 678` |
| I | `Notes` | `Gentle cuticle care` |
| J | `Status` | `pending` |
| K | `Source` | `website` |

---

## 5. Fault Tolerance & Graceful Fallback
If the Make.com webhook is temporarily offline, returns a non-200 status code, or exceeds the 6-second timeout:
- The server captures the error and logs a warning.
- The local persistent record in `server/data/bookings.json` remains intact.
- The client receives their valid booking reference (`AURA-XXXX`) and calendar invite without disruption.
