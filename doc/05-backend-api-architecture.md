# Task 05: Backend API Architecture & Security Specification

## 1. Technology Stack
- **Runtime**: Node.js v24.x
- **Framework**: Express.js 4.x
- **Architecture**: Modular layered structure (Controllers, Routes, Middleware, Services)
- **Local Persistence**: `server/data/bookings.json` (asynchronous file storage with automated initialization)

---

## 2. API Endpoints

### 2.1 Health Check
- **Endpoint**: `GET /api/health`
- **Response**:
```json
{
  "status": "ok",
  "service": "Atelier Lumière Melbourne API",
  "uptime": 234.5,
  "timestamp": "2026-09-16T10:36:33.742Z"
}
```

### 2.2 Create Booking
- **Endpoint**: `POST /api/bookings`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "serviceId": "biab-signature",
  "serviceName": "Signature BIAB Natural Nail Sculpting",
  "date": "2026-09-25",
  "time": "10:15 AM",
  "fullName": "Charlotte Vance",
  "phone": "+61 412 345 678",
  "notes": "Gentle cuticle care please",
  "language": "en"
}
```
- **Success Response (HTTP 201 Created)**:
```json
{
  "success": true,
  "bookingId": "AURA-4809",
  "message": "Appointment request received successfully! We will confirm via SMS shortly.",
  "data": {
    "bookingId": "AURA-4809",
    "serviceName": "Signature BIAB Natural Nail Sculpting",
    "date": "2026-09-25",
    "time": "10:15 AM",
    "fullName": "Charlotte Vance",
    "createdAt": "2026-09-16T10:36:53.288Z"
  }
}
```

### 2.3 List Bookings (Audit & Admin)
- **Endpoint**: `GET /api/bookings`
- **Response**: Array of persisted booking records with status (`pending`, `confirmed`, `completed`, `cancelled`).

---

## 3. Security & Validation Controls
1. **Zero Secret Leakage**: The `MAKE_WEBHOOK_URL` is kept strictly within the server environment. It is never transmitted to the browser client.
2. **Strict Server-Side Validation**: All text fields are sanitized to remove `<>` tags. Past dates and dates exceeding 90 days are rejected.
3. **Anti-Spam Rate Limiting**: Powered by `express-rate-limit`, limiting clients to 5 submissions per 15-minute window per IP.
4. **Non-Leaking Error Handler**: Production errors return generalized human-friendly messages without leaking stack traces or internal filenames.
