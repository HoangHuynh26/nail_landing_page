import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache logo buffer for CID email attachments
let cachedLogoBuffer = null;
function getLogoBuffer() {
  if (cachedLogoBuffer) return cachedLogoBuffer;
  try {
    const primaryPath = path.resolve(__dirname, '../assets/logo-email.png');
    if (fs.existsSync(primaryPath)) {
      cachedLogoBuffer = fs.readFileSync(primaryPath);
      return cachedLogoBuffer;
    }
    const fallbackPath = path.resolve(__dirname, '../../../client/public/images/logo-email.png');
    if (fs.existsSync(fallbackPath)) {
      cachedLogoBuffer = fs.readFileSync(fallbackPath);
      return cachedLogoBuffer;
    }
  } catch (err) {
    console.warn('[Email] Could not load logo file for email attachment:', err.message);
  }
  return null;
}

/**
 * Initializes Resend client with process.env.RESEND or RESEND_API_KEY
 */
function getResendClient() {
  let apiKey = config.resendApiKey || process.env.RESEND_API_KEY || process.env.RESEND || '';
  apiKey = apiKey.replace(/^https?:\/\/.*?\//, '').trim();
  if (!apiKey || apiKey === '') {
    return null;
  }
  return new Resend(apiKey);
}

/**
 * Formats YYYY-MM-DD into a human-friendly English date
 * e.g., "2026-09-29" -> "Tuesday, 29 September 2026"
 */
function formatEnglishDate(dateStr) {
  if (!dateStr) return '';
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(Date.UTC(y, m - 1, d));
    return dateObj.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Builds HTML email for the customer confirmation & thank-you matching Step Review
 */
function buildCustomerEmailHtml(booking) {
  const formattedDate = formatEnglishDate(booking.date);
  const guests = Math.max(1, Number(booking.guests) || 1);

  // Financial calculations
  const unitPrice = booking.unitPrice != null && Number(booking.unitPrice) > 0
    ? Number(booking.unitPrice)
    : (booking.price != null && Number(booking.price) > 0
        ? Math.round((Number(booking.price) / guests) * 100) / 100
        : null);

  const totalOriginal = booking.originalPrice != null && Number(booking.originalPrice) > 0
    ? Number(booking.originalPrice)
    : (unitPrice ? Math.round(unitPrice * guests * 100) / 100 : null);

  const totalFinal = booking.price != null && Number(booking.price) >= 0
    ? Number(booking.price)
    : totalOriginal;

  const discountAmount = (totalOriginal != null && totalFinal != null && totalOriginal > totalFinal)
    ? Math.round((totalOriginal - totalFinal) * 100) / 100
    : 0;

  const hasDiscount = discountAmount > 0;

  // Clean customer notes
  const rawNote = booking.message || booking.notes || '';
  const cleanNote = rawNote
    .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
    .replace(/\[Voucher:[^\]]*\]/gi, '')
    .trim();

  const categoryName = booking.category || 'Nail Treatment';
  const durationText = booking.duration ? `~${booking.duration} mins` : '~45-50 mins';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Booking - Fashion Nails Morley</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 32px 12px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e1b18 0%, #2d2621 100%);
      padding: 36px 24px;
      text-align: center;
      border-bottom: 2px solid #d4af37;
    }
    .logo-img {
      max-width: 180px;
      height: auto;
      margin-bottom: 8px;
    }
    .header-tagline {
      color: #e2d9cf;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin: 6px 0 0;
      font-weight: 500;
    }
    .content {
      padding: 32px 28px;
    }
    .badge-confirmed {
      display: inline-block;
      background-color: #ecfdf5;
      color: #059669;
      border: 1px solid #10b981;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 9999px;
      margin-bottom: 14px;
    }
    .title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px;
      line-height: 1.3;
    }
    .greeting {
      font-size: 15px;
      color: #475569;
      line-height: 1.6;
      margin: 0 0 24px;
    }
    .section-heading {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #475569;
      margin: 22px 0 10px;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      background-color: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .details-table td {
      padding: 11px 16px;
      font-size: 14px;
      border-bottom: 1px solid #f0eee9;
    }
    .details-table tr:last-child td {
      border-bottom: none;
    }
    .td-label {
      color: #78716c;
      width: 40%;
      font-weight: 500;
    }
    .td-value {
      color: #1c1917;
      font-weight: 700;
      text-align: right;
    }
    .ref-code {
      display: inline-block;
      background-color: #f5f5f4;
      color: #bd6d64;
      font-family: monospace;
      font-size: 14px;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px dashed #d6d3d1;
    }
    .price-box {
      background-color: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 24px;
    }
    .price-grid-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 6px 0;
      margin-bottom: 12px;
    }
    .price-grid-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      vertical-align: top;
    }
    .price-grid-item.is-subtotal {
      background: #fffbeb;
      border-color: #fde68a;
    }
    .price-grid-label {
      font-size: 10px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .price-grid-label.is-subtotal {
      color: #b45309;
    }
    .price-grid-val {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin-top: 4px;
    }
    .price-grid-val.is-subtotal {
      color: #b45309;
    }
    .voucher-row {
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
      font-size: 13px;
    }
    .voucher-row.is-applied {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }
    .voucher-row.is-none {
      background-color: #f8fafc;
      border: 1px dashed #cbd5e1;
      color: #64748b;
    }
    .total-row {
      border-top: 1.5px dashed #cbd5e1;
      padding-top: 12px;
    }
    .info-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      font-size: 13.5px;
      color: #78350f;
      line-height: 1.55;
    }
    .location-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 18px;
      margin-bottom: 24px;
      font-size: 13.5px;
      color: #334155;
      line-height: 1.5;
    }
    .location-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px;
    }
    .footer {
      background-color: #f1f5f9;
      padding: 24px 28px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.55;
    }
    .footer a {
      color: #b45309;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Brand Header with Logo -->
      <div class="header">
        <img src="cid:salon-logo" alt="Fashion Nails Morley" class="logo-img" />
        <div class="header-tagline">Luxury Nail Boutique &amp; Deluxe Spa • Morley Galleria</div>
      </div>

      <!-- Main Body -->
      <div class="content">
        <div class="badge-confirmed">✓ Booking Confirmed</div>
        <h1 class="title">Thank You for Booking With Us!</h1>
        <p class="greeting">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          Thank you for choosing Fashion Nails Morley Galleria. Your appointment has been successfully received and scheduled. Below is your complete booking summary:
        </p>

        <!-- Service & Appointment Details -->
        <div class="section-heading">📅 APPOINTMENT DETAILS</div>
        <table class="details-table" role="presentation">
          <tr>
            <td class="td-label">Booking Reference</td>
            <td class="td-value"><span class="ref-code">#${escapeHtml(booking.bookingId || 'AURA')}</span></td>
          </tr>
          <tr>
            <td class="td-label">Service Booked</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(booking.service || 'Nail Treatment')}</td>
          </tr>
          <tr>
            <td class="td-label">Category</td>
            <td class="td-value" style="color: #475569;">${escapeHtml(categoryName)}</td>
          </tr>
          <tr>
            <td class="td-label">Estimated Duration</td>
            <td class="td-value">${escapeHtml(durationText)}</td>
          </tr>
          <tr>
            <td class="td-label">Scheduled Date</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(formattedDate)}</td>
          </tr>
          <tr>
            <td class="td-label">Scheduled Time</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(booking.time || 'Scheduled')}</td>
          </tr>
          <tr>
            <td class="td-label">Party Size</td>
            <td class="td-value">${escapeHtml(String(guests))} ${guests > 1 ? 'People' : 'Person'}</td>
          </tr>
        </table>

        <!-- Price Breakdown (Matching Step Review) -->
        <div class="section-heading">💰 PRICE BREAKDOWN</div>
        <div class="price-box">
          <table class="price-grid-table" role="presentation">
            <tr>
              <td class="price-grid-item" style="width: 33.33%;">
                <div class="price-grid-label">UNIT PRICE</div>
                <div class="price-grid-val">
                  ${unitPrice != null ? `AU$${unitPrice.toFixed(2)}` : 'Custom'}
                  <span style="font-size: 10px; font-weight: 500; color: #64748b;">/ person</span>
                </div>
              </td>
              <td class="price-grid-item" style="width: 33.33%;">
                <div class="price-grid-label">PARTY SIZE</div>
                <div class="price-grid-val">
                  × ${guests} ${guests > 1 ? 'people' : 'person'}
                </div>
              </td>
              <td class="price-grid-item is-subtotal" style="width: 33.33%;">
                <div class="price-grid-label is-subtotal">SUBTOTAL</div>
                <div class="price-grid-val is-subtotal">
                  ${totalOriginal != null ? `AU$${totalOriginal.toFixed(2)}` : 'Calculated'}
                </div>
              </td>
            </tr>
          </table>

          <!-- Voucher Row -->
          ${hasDiscount ? `
          <div class="voucher-row is-applied">
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="font-weight: 700; color: #166534; font-size: 13px;">
                  🏷️ Discount / Promo: <strong>${escapeHtml(booking.voucher || '10% Discount')}</strong>
                </td>
                <td style="text-align: right; font-weight: 800; color: #15803d; font-size: 14px;">
                  - AU$${discountAmount.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>
          ` : `
          <div class="voucher-row is-none">
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="font-size: 12.5px; color: #64748b;">
                  🏷️ Discount / Promo Code: <strong style="color: #475569;">None</strong>
                </td>
                <td style="text-align: right; font-size: 13px; color: #94a3b8; font-weight: 600;">
                  AU$0.00
                </td>
              </tr>
            </table>
          </div>
          `}

          <!-- Total Due Row -->
          <div class="total-row">
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="font-size: 14px; font-weight: 800; color: #0f172a;">
                  Total Amount Payable ${hasDiscount ? '(After Discount):' : ':'}
                </td>
                <td style="text-align: right;">
                  ${hasDiscount && totalOriginal != null ? `
                    <span style="font-size: 13px; color: #94a3b8; text-decoration: line-through; margin-right: 6px;">
                      AU$${totalOriginal.toFixed(2)}
                    </span>
                  ` : ''}
                  <span style="font-size: 20px; font-weight: 900; color: #047857;">
                    ${totalFinal != null ? `AU$${totalFinal.toFixed(2)}` : 'Calculated at salon'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Contact & Notes Details -->
        <div class="section-heading">👤 CONTACT &amp; SPECIAL REQUESTS</div>
        <table class="details-table" role="presentation">
          <tr>
            <td class="td-label">Full Name</td>
            <td class="td-value">${escapeHtml(booking.name)}</td>
          </tr>
          <tr>
            <td class="td-label">Contact Phone</td>
            <td class="td-value"><a href="tel:${escapeHtml(booking.phone)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(booking.phone)}</a></td>
          </tr>
          <tr>
            <td class="td-label">Email Address</td>
            <td class="td-value"><a href="mailto:${escapeHtml(booking.email)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(booking.email)}</a></td>
          </tr>
          <tr>
            <td class="td-label">Special Notes</td>
            <td class="td-value" style="font-weight: 500; font-style: italic; color: #475569;">
              ${cleanNote ? `"${escapeHtml(cleanNote)}"` : 'None provided'}
            </td>
          </tr>
        </table>

        <!-- Helpful Reminders -->
        <div class="info-box">
          <strong>Important Arrival &amp; Payment Guidance:</strong><br>
          • <strong>Arrival:</strong> Please arrive <strong>5 to 10 minutes early</strong> to select your preferred nail shades and relax.<br>
          • <strong>Discount Verification:</strong> If claiming the 10% Community Discount, please bring your valid Student ID, Seniors Card, or Morley Galleria Staff pass to present at checkout.<br>
          • <strong>Payment:</strong> Payment is settled directly at the salon after your treatment is completed.
        </div>

        <!-- Salon Address & Contact -->
        <div class="location-box">
          <div class="location-title">📍 Salon Location &amp; Contact</div>
          <div><strong>Fashion Nails Morley Galleria</strong></div>
          <div>Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre</div>
          <div>Cnr Collier Rd &amp; Walter Rd W, Morley WA 6062, Australia</div>
          <div style="margin-top: 6px;">
            📞 Phone: <a href="tel:+61893752888" style="color: #0284c7; text-decoration: none; font-weight: 700;">(08) 9375 2888</a>
          </div>
        </div>

        <p style="font-size: 14px; color: #64748b; margin-bottom: 0;">
          If you have any questions or wish to modify your service, feel free to give us a call or reply to this email. We look forward to seeing you soon!
        </p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div><strong>Trading Hours:</strong> Mon–Wed, Fri–Sat: 9:00 AM – 5:30 PM | Thu: 9:00 AM – 9:00 PM | Sun: 11:00 AM – 5:00 PM</div>
        <div style="margin-top: 8px;">
          Fashion Nails Morley Galleria WA &bull;
          <a href="https://www.instagram.com/fashion_nails_morley/">Instagram</a> &bull;
          <a href="https://www.facebook.com/FashionNailsMorley/">Facebook</a>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Fashion Nails Morley Galleria. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Builds HTML email for the salon owner notification
 */
function buildOwnerEmailHtml(booking) {
  const formattedDate = formatEnglishDate(booking.date);
  const guests = Math.max(1, Number(booking.guests) || 1);

  const unitPrice = booking.unitPrice != null && Number(booking.unitPrice) > 0
    ? Number(booking.unitPrice)
    : (booking.price != null && Number(booking.price) > 0
        ? Math.round((Number(booking.price) / guests) * 100) / 100
        : null);

  const totalOriginal = booking.originalPrice != null && Number(booking.originalPrice) > 0
    ? Number(booking.originalPrice)
    : (unitPrice ? Math.round(unitPrice * guests * 100) / 100 : null);

  const totalFinal = booking.price != null && Number(booking.price) >= 0
    ? Number(booking.price)
    : totalOriginal;

  const discountAmount = (totalOriginal != null && totalFinal != null && totalOriginal > totalFinal)
    ? Math.round((totalOriginal - totalFinal) * 100) / 100
    : 0;

  const hasDiscount = discountAmount > 0;

  const rawNote = booking.message || booking.notes || '';
  const cleanNote = rawNote
    .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
    .replace(/\[Voucher:[^\]]*\]/gi, '')
    .trim();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Alert - Fashion Nails Morley</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
    }
    .wrapper {
      width: 100%;
      background-color: #f1f5f9;
      padding: 28px 12px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid #cbd5e1;
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.06);
    }
    .header {
      background: #0f172a;
      padding: 26px 24px;
      text-align: center;
      border-bottom: 3px solid #d97706;
    }
    .logo-img {
      max-width: 150px;
      height: auto;
      margin-bottom: 6px;
    }
    .header-badge {
      display: inline-block;
      background: #d97706;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 6px;
      margin-top: 6px;
    }
    .content {
      padding: 28px 24px;
    }
    .alert-banner {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 22px;
      font-size: 14px;
      color: #1e40af;
      line-height: 1.5;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      margin: 20px 0 8px;
    }
    .table-info {
      width: 100%;
      border-collapse: collapse;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 16px;
    }
    .table-info td {
      padding: 10px 14px;
      font-size: 14px;
      border-bottom: 1px solid #e2e8f0;
    }
    .table-info tr:last-child td {
      border-bottom: none;
    }
    .td-k {
      color: #64748b;
      font-weight: 600;
      width: 38%;
    }
    .td-v {
      color: #0f172a;
      font-weight: 700;
    }
    .btn-action {
      display: inline-block;
      background-color: #d97706;
      color: #ffffff !important;
      text-decoration: none;
      padding: 11px 22px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      margin-top: 8px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 18px 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="cid:salon-logo" alt="Fashion Nails Morley" class="logo-img" />
        <div><span class="header-badge">🔔 NEW ONLINE BOOKING RECEIVED</span></div>
      </div>

      <div class="content">
        <div class="alert-banner">
          <strong>A new appointment was just booked online.</strong><br>
          Please review the client and schedule information below.
        </div>

        <div class="section-title">👤 Customer Contact</div>
        <table class="table-info" role="presentation">
          <tr>
            <td class="td-k">Client Name</td>
            <td class="td-v">${escapeHtml(booking.name)}</td>
          </tr>
          <tr>
            <td class="td-k">Phone Number</td>
            <td class="td-v">
              <a href="tel:${escapeHtml(booking.phone)}" style="color: #0284c7; text-decoration: none;">
                📞 ${escapeHtml(booking.phone)}
              </a>
            </td>
          </tr>
          <tr>
            <td class="td-k">Email Address</td>
            <td class="td-v">
              <a href="mailto:${escapeHtml(booking.email)}" style="color: #0284c7; text-decoration: none;">
                ✉️ ${escapeHtml(booking.email)}
              </a>
            </td>
          </tr>
        </table>

        <div class="section-title">📅 Appointment Specifics</div>
        <table class="table-info" role="presentation">
          <tr>
            <td class="td-k">Booking Reference</td>
            <td class="td-v" style="font-family: monospace; color: #bd6d64;">#${escapeHtml(booking.bookingId || 'AURA')}</td>
          </tr>
          <tr>
            <td class="td-k">Date &amp; Time</td>
            <td class="td-v" style="color: #b45309;">${escapeHtml(formattedDate)} at ${escapeHtml(booking.time)}</td>
          </tr>
          <tr>
            <td class="td-k">Service Booked</td>
            <td class="td-v">${escapeHtml(booking.service || 'Nail Treatment')}</td>
          </tr>
          <tr>
            <td class="td-k">Category</td>
            <td class="td-v">${escapeHtml(booking.category || 'Nail Care')}</td>
          </tr>
          <tr>
            <td class="td-k">Party Size</td>
            <td class="td-v">${escapeHtml(String(guests))} ${guests > 1 ? 'Guests' : 'Guest'}</td>
          </tr>
          <tr>
            <td class="td-k">Unit Price</td>
            <td class="td-v">${unitPrice != null ? `AU$${unitPrice.toFixed(2)} / person` : 'Custom'}</td>
          </tr>
          <tr>
            <td class="td-k">Subtotal</td>
            <td class="td-v">${totalOriginal != null ? `AU$${totalOriginal.toFixed(2)}` : 'Calculated'}</td>
          </tr>
          <tr>
            <td class="td-k">Voucher / Promo</td>
            <td class="td-v">
              ${hasDiscount ? `<span style="color: #15803d; font-weight: 700;">${escapeHtml(booking.voucher || '10% Discount')} (-AU$${discountAmount.toFixed(2)})</span>` : 'None'}
            </td>
          </tr>
          <tr>
            <td class="td-k">Total Payable</td>
            <td class="td-v" style="color: #059669; font-size: 16px;">
              ${totalFinal != null ? `AU$${totalFinal.toFixed(2)}` : 'Calculated at salon'}
            </td>
          </tr>
          <tr>
            <td class="td-k">Customer Note</td>
            <td class="td-v" style="font-weight: 500; font-style: italic;">
              ${cleanNote ? `"${escapeHtml(cleanNote)}"` : 'No special requests'}
            </td>
          </tr>
          <tr>
            <td class="td-k">Booking Timestamp</td>
            <td class="td-v" style="font-size: 12px; color: #64748b;">
              ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Perth' })} (Perth AWST)
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-top: 24px;">
          <a href="tel:${escapeHtml(booking.phone)}" class="btn-action" style="background-color: #0284c7; margin-right: 8px;">
            📞 Call Client
          </a>
          <a href="http://localhost:3000/admin" class="btn-action">
            Open Admin Dashboard
          </a>
        </div>
      </div>

      <div class="footer">
        Fashion Nails Morley Galleria &bull; Automated Booking Notification System
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function sendBookingEmails(booking) {
  const resend = getResendClient();

  if (!resend) {
    console.info('[Resend Email] Skipping email dispatch: Neither RESEND nor RESEND_API_KEY is set in environment (.env).');
    return {
      sent: false,
      reason: 'Missing RESEND API key in .env'
    };
  }

  const logoBuffer = getLogoBuffer();
  const attachments = logoBuffer ? [
    {
      filename: 'fashion-nails-logo.png',
      content: logoBuffer,
      cid: 'salon-logo'
    }
  ] : [];

  const senderEmail = config.emailFrom || 'Fashion Nails Morley <onboarding@resend.dev>';
  const ownerRecipient = (config.salonOwnerEmail || process.env.SALON_OWNER_EMAIL || process.env.OWNER_EMAIL || '').trim();

  const results = {
    customer: { sent: false },
    owner: { sent: false }
  };

  const emailTasks = [];

  // Helper for Resend testing domain (onboarding@resend.dev) sandbox auto-redirect
  async function attemptSandboxFallback(rawErrorMsg) {
    const match = typeof rawErrorMsg === 'string' ? rawErrorMsg.match(/your own email address \(([^)]+)\)/i) : null;
    const targetEmail = match ? match[1] : (ownerRecipient || '2331540163@vaa.edu.vn');

    if (!targetEmail) return null;

    console.warn(`[Resend Sandbox] Customer email (${booking.email}) was intercepted by Resend sandbox policy (domain unverified).`);
    console.info(`[Resend Sandbox] Auto-redirecting test confirmation copy to registered account: ${targetEmail}`);

    try {
      const fallbackRes = await resend.emails.send({
        from: senderEmail,
        to: targetEmail,
        subject: `[TEST SANDBOX: for ${booking.email}] ✨ Thank You for Booking! - Fashion Nails Morley [#${booking.bookingId || 'AURA'}]`,
        html: `
          <div style="background: #fef3c7; border: 1.5px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #92400e; line-height: 1.5;">
            <strong>⚠️ Resend Sandbox Mode Notice:</strong><br>
            This email was intended for customer <strong>${escapeHtml(booking.email)}</strong>.<br>
            Because the Resend account is currently using the default testing sender address <code>${escapeHtml(senderEmail)}</code> (custom domain not yet verified at <a href="https://resend.com/domains" style="color: #b45309; font-weight: bold; text-decoration: underline;">resend.com/domains</a>), Resend has forwarded this copy to your registered account email (<strong>${escapeHtml(targetEmail)}</strong>) so you can inspect the full email template and data.
          </div>
        ` + buildCustomerEmailHtml(booking),
        attachments
      });

      if (!fallbackRes?.error) {
        console.info(`[Resend Email] Successfully delivered test email to account inbox (${targetEmail})! ID: ${fallbackRes?.data?.id || fallbackRes?.id || 'OK'}`);
        return {
          sent: true,
          id: fallbackRes?.data?.id || fallbackRes?.id,
          sandboxRedirect: targetEmail
        };
      }
    } catch (e) {
      console.error('[Resend Sandbox] Fallback send error:', e.message);
    }
    return null;
  }

  // 1. Task: Send thank-you confirmation to Customer
  if (booking.email && booking.email.includes('@')) {
    emailTasks.push((async () => {
      try {
        const customerHtml = buildCustomerEmailHtml(booking);
        let res = await resend.emails.send({
          from: senderEmail,
          to: booking.email,
          subject: `✨ Thank You for Booking! Appointment Confirmed - Fashion Nails Morley [#${booking.bookingId || 'AURA'}]`,
          html: customerHtml,
          attachments
        });

        const isSandboxError = res?.error && (
          res.error.statusCode === 403 ||
          res.error.name === 'validation_error' ||
          (typeof res.error.message === 'string' && (res.error.message.includes('only send testing emails') || res.error.message.includes('resend.com/domains')))
        );

        if (isSandboxError) {
          const fallbackResult = await attemptSandboxFallback(res.error.message);
          if (fallbackResult) {
            results.customer = fallbackResult;
            return;
          }
        }

        if (res?.error) {
          console.error(`[Resend Email] Resend rejected customer email to ${booking.email}:`, res.error);
          results.customer = { sent: false, error: res.error.message || JSON.stringify(res.error) };
        } else {
          console.info(`[Resend Email] Customer thank-you confirmation email sent successfully to ${booking.email} (ID: ${res?.data?.id || res?.id || 'OK'})`);
          results.customer = { sent: true, id: res?.data?.id || res?.id };
        }
      } catch (err) {
        const isSandboxException = (err?.statusCode === 403 || err?.status === 403) ||
          (typeof err?.message === 'string' && (err.message.includes('only send testing emails') || err.message.includes('resend.com/domains')));

        if (isSandboxException) {
          const fallbackResult = await attemptSandboxFallback(err.message);
          if (fallbackResult) {
            results.customer = fallbackResult;
            return;
          }
        }

        console.error(`[Resend Email] Failed to send customer email to ${booking.email}:`, err.message);
        results.customer = { sent: false, error: err.message };
      }
    })());
  } else {
    console.warn('[Resend Email] No valid customer email address provided for booking:', booking.bookingId);
  }

  // 2. Task: Send alert email concurrently to Salon Owner
  if (ownerRecipient && ownerRecipient.includes('@')) {
    emailTasks.push((async () => {
      try {
        const ownerHtml = buildOwnerEmailHtml(booking);
        const res = await resend.emails.send({
          from: senderEmail,
          to: ownerRecipient,
          subject: `🚨 [New Booking Alert] ${booking.name} - ${booking.date} at ${booking.time} [#${booking.bookingId || 'AURA'}]`,
          html: ownerHtml,
          attachments
        });

        if (res?.error) {
          console.error(`[Resend Email] Resend rejected salon owner email to ${ownerRecipient}:`, res.error);
          results.owner = { sent: false, error: res.error.message || JSON.stringify(res.error) };
        } else {
          console.info(`[Resend Email] Salon owner alert email sent concurrently to ${ownerRecipient} (ID: ${res?.data?.id || res?.id || 'OK'})`);
          results.owner = { sent: true, id: res?.data?.id || res?.id };
        }
      } catch (err) {
        console.error(`[Resend Email] Failed to send owner email to ${ownerRecipient}:`, err.message);
        results.owner = { sent: false, error: err.message };
      }
    })());
  } else {
    console.info('[Resend Email] Notice: SALON_OWNER_EMAIL is not yet configured in .env. When you add it, owner alerts will be sent concurrently.');
    results.owner = { sent: false, reason: 'SALON_OWNER_EMAIL not configured' };
  }

  // Execute both simultaneously
  await Promise.allSettled(emailTasks);

  return results;
}
