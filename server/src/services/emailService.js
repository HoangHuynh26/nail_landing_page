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
  const totalOriginal = (booking.originalPrice != null && Number(booking.originalPrice) > 0)
    ? Number(booking.originalPrice)
    : (booking.price != null && Number(booking.price) > 0 ? Number(booking.price) : null);

  const unitPrice = (booking.unitPrice != null && Number(booking.unitPrice) > 0)
    ? Number(booking.unitPrice)
    : (totalOriginal != null && guests > 0
        ? Math.round((totalOriginal / guests) * 100) / 100
        : (booking.price != null && Number(booking.price) > 0
            ? Math.round((Number(booking.price) / guests) * 100) / 100
            : null));

  const totalFinal = (booking.price != null && Number(booking.price) >= 0)
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
      <!-- Brand Header with Luxury Emblem -->
      <div class="header">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
          <tr>
            <td align="center">
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 12px auto;">
                <tr>
                  <td align="center" style="width: 48px; height: 48px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(180, 83, 9, 0.15) 100%); border: 1.5px solid #d4af37; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f6d376" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v1H5z" fill="#d4af37" fill-opacity="0.3"></path>
                      <circle cx="12" cy="4" r="1.5" fill="#fef08a"></circle>
                      <circle cx="5" cy="4" r="1.5" fill="#fef08a"></circle>
                      <circle cx="19" cy="4" r="1.5" fill="#fef08a"></circle>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #FAF7F2; text-transform: uppercase; margin: 0 0 4px 0;">
                Fashion Nails
              </div>
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: #E5C170; text-transform: uppercase;">
                Luxury Nail Boutique &amp; Deluxe Spa &bull; Morley Galleria
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Main Body -->
      <div class="content">
        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 14px;">
          <tr>
            <td style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 9999px; padding: 5px 14px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #059669;">
              <span style="display: inline-block; vertical-align: middle; margin-right: 5px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
              <span style="vertical-align: middle;">Booking Confirmed</span>
            </td>
          </tr>
        </table>

        <h1 class="title">Thank You for Booking With Us!</h1>
        <p class="greeting">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          Thank you for choosing Fashion Nails Morley Galleria. Your appointment has been successfully received and scheduled. Below is your complete booking summary:
        </p>

        <!-- Service & Appointment Details -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 22px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef3c7; border: 1px solid #fde68a; text-align: center; line-height: 24px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              APPOINTMENT DETAILS
            </td>
          </tr>
        </table>

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

        <!-- Price Breakdown -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #ecfdf5; border: 1px solid #a7f3d0; text-align: center; line-height: 24px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              PRICE BREAKDOWN
            </td>
          </tr>
        </table>

        <div class="price-box">
          <table class="price-grid-table" role="presentation">
            <tr>
              <td class="price-grid-item" style="width: 33.33%;">
                <div class="price-grid-label">UNIT PRICE</div>
                <div class="price-grid-val">
                  ${unitPrice != null ? `$${unitPrice.toFixed(2)}` : 'Custom'}
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
                  ${totalOriginal != null ? `$${totalOriginal.toFixed(2)}` : 'Calculated'}
                </div>
              </td>
            </tr>
          </table>

          <!-- Voucher Row -->
          ${hasDiscount ? `
          <div class="voucher-row is-applied">
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="font-weight: 700; color: #166534; font-size: 13px; vertical-align: middle;">
                  <span style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </span>
                  <span style="vertical-align: middle;">Discount / Promo: <strong>${escapeHtml(booking.voucher || '10% Discount')}</strong></span>
                </td>
                <td style="text-align: right; font-weight: 800; color: #15803d; font-size: 14px; vertical-align: middle;">
                  - $${discountAmount.toFixed(2)}
                </td>
              </tr>
            </table>
          </div>
          ` : `
          <div class="voucher-row is-none">
            <table style="width: 100%; border-collapse: collapse;" role="presentation">
              <tr>
                <td style="font-size: 12.5px; color: #64748b; vertical-align: middle;">
                  <span style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                  </span>
                  <span style="vertical-align: middle;">Discount / Promo Code: <strong style="color: #475569;">None</strong></span>
                </td>
                <td style="text-align: right; font-size: 13px; color: #94a3b8; font-weight: 600; vertical-align: middle;">
                  $0.00
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
                      $${totalOriginal.toFixed(2)}
                    </span>
                  ` : ''}
                  <span style="font-size: 20px; font-weight: 900; color: #047857;">
                    ${totalFinal != null ? `$${totalFinal.toFixed(2)}` : 'Calculated at salon'}
                  </span>
                </td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Contact & Notes Details -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center; line-height: 24px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              CONTACT &amp; SPECIAL REQUESTS
            </td>
          </tr>
        </table>

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
          <div style="font-weight: 700; color: #92400e; margin-bottom: 8px;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </span>
            <span style="vertical-align: middle;">Important Arrival &amp; Payment Guidance:</span>
          </div>
          <div style="line-height: 1.6;">
            &bull; <strong>Arrival:</strong> Please arrive <strong>5 to 10 minutes early</strong> to select your preferred nail shades and relax.<br>
            &bull; <strong>Discount Verification:</strong> If claiming the 10% Community Discount, please bring your valid Student ID, Seniors Card, or Morley Galleria Staff pass to present at checkout.<br>
            &bull; <strong>Payment:</strong> Payment is settled directly at the salon after your treatment is completed.
          </div>
        </div>

        <!-- Salon Address & Contact -->
        <div class="location-box">
          <div class="location-title">
            <span style="display: inline-block; vertical-align: middle; margin-right: 6px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </span>
            <span style="vertical-align: middle;">Salon Location &amp; Contact</span>
          </div>
          <div><strong>Fashion Nails Morley Galleria</strong></div>
          <div>Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre</div>
          <div>Cnr Collier Rd &amp; Walter Rd W, Morley WA 6062, Australia</div>
          <div style="margin-top: 8px;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 5px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </span>
            Phone: <a href="tel:+61893752888" style="color: #0284c7; text-decoration: none; font-weight: 700;">(08) 9375 2888</a>
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

  const totalOriginal = (booking.originalPrice != null && Number(booking.originalPrice) > 0)
    ? Number(booking.originalPrice)
    : (booking.price != null && Number(booking.price) > 0 ? Number(booking.price) : null);

  const unitPrice = (booking.unitPrice != null && Number(booking.unitPrice) > 0)
    ? Number(booking.unitPrice)
    : (totalOriginal != null && guests > 0
        ? Math.round((totalOriginal / guests) * 100) / 100
        : (booking.price != null && Number(booking.price) > 0
            ? Math.round((Number(booking.price) / guests) * 100) / 100
            : null));

  const totalFinal = (booking.price != null && Number(booking.price) >= 0)
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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
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
      padding: 28px 24px;
      text-align: center;
      border-bottom: 3px solid #d97706;
    }
    .content {
      padding: 26px 24px;
    }
    .alert-banner {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      padding: 14px 16px;
      margin-bottom: 22px;
    }
    .table-info {
      width: 100%;
      border-collapse: collapse;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 20px;
    }
    .table-info td {
      padding: 11px 16px;
      font-size: 13.5px;
      border-bottom: 1px solid #e2e8f0;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13.5px;
      text-align: center;
    }
    .footer {
      background-color: #f8fafc;
      padding: 18px 24px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Luxury Brand Header -->
      <div class="header">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
          <tr>
            <td align="center">
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 10px auto;">
                <tr>
                  <td align="center" style="width: 46px; height: 46px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(180, 83, 9, 0.2) 100%); border: 1.5px solid #d4af37; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f6d376" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: 0 auto;">
                      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v1H5z" fill="#d4af37" fill-opacity="0.3"></path>
                      <circle cx="12" cy="4" r="1.5" fill="#fef08a"></circle>
                      <circle cx="5" cy="4" r="1.5" fill="#fef08a"></circle>
                      <circle cx="19" cy="4" r="1.5" fill="#fef08a"></circle>
                    </svg>
                  </td>
                </tr>
              </table>
              <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.08em; color: #FAF7F2; text-transform: uppercase; margin: 0 0 8px 0;">
                FASHION NAILS MORLEY
              </div>
              <div style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; box-shadow: 0 2px 6px rgba(180, 83, 9, 0.35);">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 6px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                      </svg>
                    </td>
                    <td style="vertical-align: middle; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                      NEW ONLINE BOOKING RECEIVED
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="content">
        <!-- Alert Notification Card -->
        <div class="alert-banner">
          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%;">
            <tr>
              <td style="width: 28px; vertical-align: top; padding-top: 2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </td>
              <td style="vertical-align: top; font-size: 13.5px; color: #1e40af; line-height: 1.5; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <strong style="color: #1e3a8a;">A new appointment was just booked online.</strong><br>
                Please review the client contact and schedule details below.
              </td>
            </tr>
          </table>
        </div>

        <!-- Customer Contact Header -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center; line-height: 24px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              CUSTOMER CONTACT
            </td>
          </tr>
        </table>

        <table class="table-info" role="presentation">
          <tr>
            <td class="td-k">Client Name</td>
            <td class="td-v" style="color: #0f172a; font-size: 14.5px;">${escapeHtml(booking.name)}</td>
          </tr>
          <tr>
            <td class="td-k">Phone Number</td>
            <td class="td-v">
              <a href="tel:${escapeHtml(booking.phone)}" style="color: #0284c7; text-decoration: none;">
                <span style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <span style="vertical-align: middle;">${escapeHtml(booking.phone)}</span>
              </a>
            </td>
          </tr>
          <tr>
            <td class="td-k">Email Address</td>
            <td class="td-v">
              <a href="mailto:${escapeHtml(booking.email)}" style="color: #0284c7; text-decoration: none;">
                <span style="display: inline-block; vertical-align: middle; margin-right: 4px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </span>
                <span style="vertical-align: middle;">${escapeHtml(booking.email)}</span>
              </a>
            </td>
          </tr>
        </table>

        <!-- Appointment Specifics Header -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef3c7; border: 1px solid #fde68a; text-align: center; line-height: 24px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle; display: inline-block;">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              APPOINTMENT SPECIFICS
            </td>
          </tr>
        </table>

        <table class="table-info" role="presentation">
          <tr>
            <td class="td-k">Booking Reference</td>
            <td class="td-v" style="font-family: monospace; color: #bd6d64; font-size: 14px;">#${escapeHtml(booking.bookingId || 'AURA')}</td>
          </tr>
          <tr>
            <td class="td-k">Date &amp; Time</td>
            <td class="td-v" style="color: #b45309; font-size: 14.5px;">${escapeHtml(formattedDate)} at ${escapeHtml(booking.time)}</td>
          </tr>
          <tr>
            <td class="td-k">Service Booked</td>
            <td class="td-v" style="color: #0f172a;">${escapeHtml(booking.service || 'Nail Treatment')}</td>
          </tr>
          <tr>
            <td class="td-k">Category</td>
            <td class="td-v" style="color: #475569;">${escapeHtml(booking.category || 'Nail Care')}</td>
          </tr>
          <tr>
            <td class="td-k">Party Size</td>
            <td class="td-v">${escapeHtml(String(guests))} ${guests > 1 ? 'Guests' : 'Guest'}</td>
          </tr>
          <tr>
            <td class="td-k">Unit Price</td>
            <td class="td-v">${unitPrice != null ? `$${unitPrice.toFixed(2)} / person` : 'Custom'}</td>
          </tr>
          <tr>
            <td class="td-k">Subtotal</td>
            <td class="td-v">${totalOriginal != null ? `$${totalOriginal.toFixed(2)}` : 'Calculated'}</td>
          </tr>
          <tr>
            <td class="td-k">Voucher / Promo</td>
            <td class="td-v">
              ${hasDiscount ? `<span style="color: #15803d; font-weight: 700;">${escapeHtml(booking.voucher || '10% Discount')} (-$${discountAmount.toFixed(2)})</span>` : 'None'}
            </td>
          </tr>
          <tr>
            <td class="td-k">Total Payable</td>
            <td class="td-v" style="color: #059669; font-size: 16px; font-weight: 800;">
              ${totalFinal != null ? `$${totalFinal.toFixed(2)}` : 'Calculated at salon'}
            </td>
          </tr>
          <tr>
            <td class="td-k">Customer Note</td>
            <td class="td-v" style="font-weight: 500; font-style: italic; color: #475569;">
              ${cleanNote ? `"${escapeHtml(cleanNote)}"` : 'No special requests'}
            </td>
          </tr>
        </table>

        <!-- Quick Action Buttons -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px auto 0 auto;">
          <tr>
            <td style="padding: 0 6px;">
              <a href="tel:${escapeHtml(booking.phone)}" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 6px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                    </td>
                    <td style="vertical-align: middle; color: #ffffff; font-size: 13.5px; font-weight: 700;">
                      Call Client
                    </td>
                  </tr>
                </table>
              </a>
            </td>
            <td style="padding: 0 6px;">
              <a href="http://localhost:3000/admin" style="display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 6px;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display: block;">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                    </td>
                    <td style="vertical-align: middle; color: #ffffff; font-size: 13.5px; font-weight: 700;">
                      Open Admin Dashboard
                    </td>
                  </tr>
                </table>
              </a>
            </td>
          </tr>
        </table>
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

  const attachments = [];

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
