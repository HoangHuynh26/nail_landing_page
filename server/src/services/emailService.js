import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache logo buffer for CID email attachments
let cachedLogoBuffer = null;
export function getLogoBuffer() {
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
    const [y, m, d] = dateStr.split('-');
    return `${d}-${m}-${y}`;
  } catch {
    return dateStr;
  }
}

/**
 * Builds HTML email for the customer confirmation & thank-you matching Step Review
 */
export function buildCustomerEmailHtml(booking) {
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
  <title>✨ Thank You for Booking! Appointment Confirmed - Fashion Nails Morley</title>
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
      <!-- Brand Header with Official Salon Logo -->
      <div class="header">
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
          <tr>
            <td align="center">
              <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 12px auto;">
                <tr>
                  <td align="center">
                    <img src="cid:salon-logo" alt="Fashion Nail Morley Logo" width="130" style="display: block; margin: 0 auto; max-width: 130px; height: auto; border: 0; outline: none; text-decoration: none;" />
                  </td>
                </tr>
              </table>
              <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 700; letter-spacing: 0.08em; color: #FAF7F2; text-transform: uppercase; margin: 0 0 4px 0;">
                Fashion Nail Morley
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
        <h1 class="title" style="font-size: 21px; font-weight: 800; color: #0f172a; margin: 0 0 14px 0; line-height: 1.35;">
          ✨ Thank You for Booking!
        </h1>
        <p class="greeting" style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          Thank you for choosing Fashion Nail Morley. Your appointment has been successfully received and scheduled. Below is your complete booking summary:
        </p>

        <!-- 1. Customer Information (Thông tin người đặt lên đầu) -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 18px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center; line-height: 24px; font-size: 12px;">
                👤
              </div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              CUSTOMER INFORMATION
            </td>
          </tr>
        </table>

        <table class="details-table" role="presentation">
          <tr>
            <td class="td-label">Full Name</td>
            <td class="td-value" style="color: #0f172a; font-size: 14.5px;">${escapeHtml(booking.name)}</td>
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

        <!-- 2. Service & Appointment Details -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef3c7; border: 1px solid #fde68a; text-align: center; line-height: 24px; font-size: 12px;">
                📅
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

        <!-- 3. Price Breakdown -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #ecfdf5; border: 1px solid #a7f3d0; text-align: center; line-height: 24px; font-size: 12px;">
                💳
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
                  <span style="font-size: 10px; font-weight: 500; color: #64748b;"></span>
                </div>
              </td>
              <td class="price-grid-item" style="width: 33.33%;">
                <div class="price-grid-label">PARTY SIZE</div>
                <div class="price-grid-val">
                  ${guests} ${guests > 1 ? 'people' : 'person'}
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
                  <span style="display: inline-block; vertical-align: middle; margin-right: 6px; font-size: 14px;">🏷️</span>
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
                  <span style="display: inline-block; vertical-align: middle; margin-right: 6px; font-size: 13px;">🏷️</span>
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

        <!-- Helpful Reminders -->
        <div class="info-box">
          <div style="font-weight: 700; color: #92400e; margin-bottom: 8px;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 6px; font-size: 14px;">💡</span>
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
            <span style="display: inline-block; vertical-align: middle; margin-right: 6px; font-size: 14px;">📍</span>
            <span style="vertical-align: middle;">Salon Location &amp; Contact</span>
          </div>
          <div><strong>Fashion Nail Morley</strong></div>
          <div>Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre</div>
          <div>Cnr Collier Rd &amp; Walter Rd W, Morley WA 6062, Australia</div>
          <div style="margin-top: 8px;">
            <span style="display: inline-block; vertical-align: middle; margin-right: 5px; font-size: 13px;">📞</span>
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
          Fashion Nail Morley &bull;
          <a href="https://www.instagram.com/fashion_nails_morley/">Instagram</a> &bull;
          <a href="https://www.facebook.com/profile.php?id=61556106694333">Facebook</a>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
          &copy; ${new Date().getFullYear()} Fashion Nail Morley. All rights reserved.
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
export function buildOwnerEmailHtml(booking) {
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
                  <td align="center">
                    <img src="cid:salon-logo" alt="Fashion Nail Morley Logo" width="120" style="display: block; margin: 0 auto; max-width: 120px; height: auto; border: 0; outline: none; text-decoration: none;" />
                  </td>
                </tr>
              </table>
              <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 21px; font-weight: 700; letter-spacing: 0.08em; color: #FAF7F2; text-transform: uppercase; margin: 0 0 8px 0;">
                FASHION NAIL MORLEY
              </div>
              <div style="display: inline-block; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 14px; border-radius: 20px; box-shadow: 0 2px 6px rgba(180, 83, 9, 0.35);">
                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0;">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 6px; font-size: 12px;">🔔</td>
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
              <td style="width: 28px; vertical-align: top; padding-top: 2px; font-size: 18px; line-height: 1;">
                📢
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
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center; line-height: 24px; font-size: 12px;">
                👤
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
                <span style="display: inline-block; vertical-align: middle; margin-right: 4px; font-size: 13px;">📞</span>
                <span style="vertical-align: middle;">${escapeHtml(booking.phone)}</span>
              </a>
            </td>
          </tr>
          <tr>
            <td class="td-k">Email Address</td>
            <td class="td-v">
              <a href="mailto:${escapeHtml(booking.email)}" style="color: #0284c7; text-decoration: none;">
                <span style="display: inline-block; vertical-align: middle; margin-right: 4px; font-size: 13px;">✉️</span>
                <span style="vertical-align: middle;">${escapeHtml(booking.email)}</span>
              </a>
            </td>
          </tr>
        </table>

        <!-- Appointment Specifics Header -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef3c7; border: 1px solid #fde68a; text-align: center; line-height: 24px; font-size: 12px;">
                📅
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
            <td class="td-v" style="color: #b45309; font-size: 14.5px;">${escapeHtml(formattedDate)} | ${escapeHtml(booking.time)}</td>
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
                <span style="font-size: 14px; margin-right: 6px; vertical-align: middle;">📞</span>
                <span style="vertical-align: middle; color: #ffffff; font-size: 13.5px; font-weight: 700;">Call Client</span>
              </a>
            </td>
            <td style="padding: 0 6px;">
              <a href="${config.adminDashboardUrl || 'https://fashionnailmorley.com.au/admin'}" style="display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; padding: 11px 20px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <span style="font-size: 14px; margin-right: 6px; vertical-align: middle;">📊</span>
                <span style="vertical-align: middle; color: #ffffff; font-size: 13.5px; font-weight: 700;">Open Admin Dashboard</span>
              </a>
            </td>
          </tr>
        </table>
      </div>

      <div class="footer">
        Fashion Nail Morley &bull; Automated Booking Notification System
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

  const logoBuf = getLogoBuffer();
  const attachments = logoBuf ? [
    {
      filename: 'fashion-nail-morley-logo.png',
      content: logoBuf,
      content_id: 'salon-logo',
      contentId: 'salon-logo',
      content_type: 'image/png',
      contentType: 'image/png'
    }
  ] : [];

  const senderEmail = config.emailFrom || 'Fashion Nail Morley <onboarding@resend.dev>';
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
        subject: `[TEST SANDBOX: for ${booking.email}] ✨ Thank You for Booking! Appointment Confirmed - Fashion Nails Morley`,
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
          subject: '✨ Thank You for Booking! Appointment Confirmed - Fashion Nails Morley',
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
          subject: `🚨 [New Booking Alert] ${booking.name} - ${booking.date} | ${booking.time} [#${booking.bookingId || 'AURA'}]`,
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

/**
 * Extracts and computes normalized booking details for status emails
 */
function extractBookingDetails(booking) {
  const formattedDate = formatEnglishDate(booking?.date);
  const guests = Math.max(1, Number(booking?.guests) || 1);

  const totalOriginal = (booking?.originalPrice != null && Number(booking?.originalPrice) > 0)
    ? Number(booking?.originalPrice)
    : (booking?.price != null && Number(booking?.price) > 0 ? Number(booking?.price) : null);

  const unitPrice = (booking?.unitPrice != null && Number(booking?.unitPrice) > 0)
    ? Number(booking?.unitPrice)
    : (totalOriginal != null && guests > 0
        ? Math.round((totalOriginal / guests) * 100) / 100
        : (booking?.price != null && Number(booking?.price) > 0
            ? Math.round((Number(booking?.price) / guests) * 100) / 100
            : null));

  const totalFinal = (booking?.price != null && Number(booking?.price) >= 0)
    ? Number(booking?.price)
    : totalOriginal;

  const discountAmount = (totalOriginal != null && totalFinal != null && totalOriginal > totalFinal)
    ? Math.round((totalOriginal - totalFinal) * 100) / 100
    : 0;

  const hasDiscount = discountAmount > 0;

  const rawNote = booking?.message || booking?.notes || '';
  const cleanNote = rawNote
    .replace(/\[10% Discount:.*?\]\s*(-)?\s*/gi, '')
    .replace(/\[Voucher:[^\]]*\]/gi, '')
    .trim();

  const categoryName = booking?.category || 'Nail Treatment';
  const durationText = booking?.duration ? `~${booking?.duration} mins` : '~45-50 mins';

  return {
    formattedDate,
    guests,
    totalOriginal,
    unitPrice,
    totalFinal,
    discountAmount,
    hasDiscount,
    cleanNote,
    categoryName,
    durationText
  };
}

/**
 * Common luxury brand header HTML
 */
function renderBrandHeaderHtml() {
  return `
    <div style="background: linear-gradient(135deg, #1e1b18 0%, #2d2621 100%); padding: 34px 20px; text-align: center; border-bottom: 2px solid #d4af37;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
        <tr>
          <td align="center">
            <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 10px auto;">
              <tr>
                <td align="center">
                  <img src="cid:salon-logo" alt="Fashion Nail Morley Logo" width="130" style="display: block; margin: 0 auto; max-width: 130px; height: auto; border: 0; outline: none; text-decoration: none;" />
                </td>
              </tr>
            </table>
            <div style="font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-size: 23px; font-weight: 700; letter-spacing: 0.08em; color: #FAF7F2; text-transform: uppercase; margin: 0 0 4px 0;">
              Fashion Nail Morley
            </div>
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; color: #E5C170; text-transform: uppercase;">
              Luxury Nail Boutique &bull; Morley Galleria
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

/**
 * Common salon footer HTML
 */
function renderBrandFooterHtml() {
  return `
    <div style="background-color: #f1f5f9; padding: 24px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12.5px; color: #64748b; line-height: 1.6;">
      <div><strong>Location:</strong> Shop SP094 (Opposite Kmart), Morley Galleria Shopping Centre</div>
      <div style="margin-top: 4px;">Cnr Collier Rd &amp; Walter Rd W, Morley WA 6062 &bull; Phone: <a href="tel:+61893752888" style="color: #0284c7; font-weight: 700; text-decoration: none;">(08) 9375 2888</a></div>
      <div style="margin-top: 6px;"><strong>Trading Hours:</strong> Mon–Wed, Fri–Sat: 9:00 AM – 5:30 PM | Thu: 9:00 AM – 9:00 PM | Sun: 11:00 AM – 5:00 PM</div>
      <div style="margin-top: 10px;">
        <a href="https://fashionnailmorley.com.au" style="color: #b45309; text-decoration: none; font-weight: 600;">Website</a> &bull;
        <a href="https://maps.google.com/?q=Fashion+Nails+Morley+Galleria+Shopping+Centre+WA" style="color: #b45309; text-decoration: none; font-weight: 600;">Google Maps</a> &bull;
        <a href="https://www.instagram.com/fashion_nails_morley/" style="color: #b45309; text-decoration: none; font-weight: 600;">Instagram</a> &bull;
        <a href="https://www.facebook.com/profile.php?id=61556106694333" style="color: #b45309; text-decoration: none; font-weight: 600;">Facebook</a>
      </div>
      <div style="margin-top: 10px; font-size: 11px; color: #94a3b8;">
        &copy; ${new Date().getFullYear()} Fashion Nail Morley. All rights reserved.
      </div>
    </div>
  `;
}

/**
 * 1. Builds HTML email for CONFIRMED status
 * Sent to customer when Admin confirms the booking
 */
export function buildConfirmedEmailHtml(booking) {
  const {
    formattedDate,
    guests,
    totalOriginal,
    unitPrice,
    totalFinal,
    discountAmount,
    hasDiscount,
    cleanNote,
    categoryName,
    durationText
  } = extractBookingDetails(booking);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>✨ Booking Confirmed! Your Appointment is Locked In - Fashion Nails Morley</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 32px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .content { padding: 32px 28px; }
    .details-table { width: 100%; border-collapse: collapse; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; margin-bottom: 22px; }
    .details-table td { padding: 11px 16px; font-size: 14px; border-bottom: 1px solid #f0eee9; }
    .details-table tr:last-child td { border-bottom: none; }
    .td-label { color: #78716c; width: 42%; font-weight: 500; }
    .td-value { color: #1c1917; font-weight: 700; text-align: right; }
    .ref-code { display: inline-block; background-color: #f5f5f4; color: #bd6d64; font-family: monospace; font-size: 14px; padding: 3px 8px; border-radius: 6px; border: 1px dashed #d6d3d1; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${renderBrandHeaderHtml()}

      <div class="content">

        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.35;">
          ✨ Your Appointment is Officially Confirmed!
        </h1>

        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          Great news! Our team at <strong>Fashion Nail Morley Galleria</strong> has reviewed your booking request and <strong>officially confirmed</strong> your appointment. Your dedicated nail specialist and time slot are now locked in. We cannot wait to pamper you!
        </p>

        <!-- Highlight Box -->
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; border-radius: 8px; padding: 14px 18px; margin-bottom: 24px; font-size: 14px; color: #166534; line-height: 1.55;">
          <strong>🗓️ Scheduled Slot:</strong> <strong>${escapeHtml(formattedDate)} | ${escapeHtml(booking.time)}</strong><br>
          Please arrive <strong>5 to 10 minutes early</strong> so you can relax and browse our extensive palette of fresh colours and nail designs.
        </div>

        <!-- Section: Appointment Specifics -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #eff6ff; border: 1px solid #bfdbfe; text-align: center; line-height: 24px; font-size: 12px;">📅</div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              CONFIRMED APPOINTMENT DETAILS
            </td>
          </tr>
        </table>

        <table class="details-table" role="presentation">
          <tr>
            <td class="td-label">Booking Reference</td>
            <td class="td-value"><span class="ref-code">#${escapeHtml(booking.bookingId || 'AURA')}</span></td>
          </tr>
          <tr>
            <td class="td-label">Scheduled Date</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(formattedDate)}</td>
          </tr>
          <tr>
            <td class="td-label">Scheduled Time</td>
            <td class="td-value" style="color: #b45309; font-size: 15px;">${escapeHtml(booking.time || 'Scheduled')}</td>
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
            <td class="td-label">Party Size</td>
            <td class="td-value">${escapeHtml(String(guests))} ${guests > 1 ? 'People' : 'Person'}</td>
          </tr>
          <tr>
            <td class="td-label">Total Payable</td>
            <td class="td-value" style="color: #047857; font-size: 16px; font-weight: 800;">
              ${totalFinal != null ? `$${totalFinal.toFixed(2)}` : 'Calculated at salon'}
              ${hasDiscount ? `<span style="font-size: 12px; color: #166534; font-weight: 600;"> (${escapeHtml(booking.voucher || '10% Discount')} Applied)</span>` : ''}
            </td>
          </tr>
          ${cleanNote ? `
          <tr>
            <td class="td-label">Your Note / Requests</td>
            <td class="td-value" style="font-weight: 500; font-style: italic; color: #475569;">"${escapeHtml(cleanNote)}"</td>
          </tr>
          ` : ''}
        </table>

        <!-- Navigation & Direction CTA Buttons -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 24px auto; width: 100%;">
          <tr>
            <td align="center" style="padding: 6px;">
              <a href="https://www.google.com/maps/place/Fashion+Nails/@-31.8970273,115.8950187,17z/data=!3m2!4b1!5s0x2a32b07d8b01e6d9:0x55f0c5881a2ec5f5!4m6!3m5!1s0x2a32b07d9c6d66f1:0x666e048b782d5d7a!8m2!3d-31.8970273!4d115.8975936!16s%2Fg%2F11dx8_j1f9?entry=ttu" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center;">
                📍 Get Directions on Google Maps
              </a>
            </td>
            <td align="center" style="padding: 6px;">
              <a href="tel:+61893752888" style="display: inline-block; background-color: #1e293b; color: #ffffff !important; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center;">
                📞 Call Us: (08) 9375 2888
              </a>
            </td>
          </tr>
        </table>

        <!-- Helpful Reminders -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-top: 16px; font-size: 13.5px; color: #334155; line-height: 1.55;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px;">
            📍 Where to Find Us in Morley Galleria:
          </div>
          <div>We are located at <strong>Shop SP094 (Opposite Kmart)</strong>, Morley Galleria Shopping Centre. Convenient parking is available right outside the Kmart mall entrance.</div>
          <div style="margin-top: 8px; font-size: 13px; color: #64748b;">
            Need to reschedule or running behind? Please call us directly at <a href="tel:+61893752888" style="color: #0284c7; font-weight: 600;">(08) 9375 2888</a> and our friendly reception team will gladly assist you.
          </div>
        </div>
      </div>

      ${renderBrandFooterHtml()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * 2. Builds HTML email for COMPLETED status
 * Sent to customer when service is marked completed, inviting review on Google Maps
 */
export function buildCompletedEmailHtml(booking) {
  const {
    formattedDate,
    guests,
    categoryName
  } = extractBookingDetails(booking);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>💖 Thank You for Visiting Fashion Nails Morley! How Was Your Experience?</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 32px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .content { padding: 32px 28px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${renderBrandHeaderHtml()}

      <div class="content">
        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.35;">
          💖 Thank You for Pampering with Us Today!
        </h1>

        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          Thank you so much for choosing <strong>Fashion Nail Morley Galleria</strong> today! It was an absolute delight having you with us.<br>
          We hope you are in love with your fresh, flawless nails and that your visit was a relaxing and delightful pampering escape.
        </p>

        <!-- Visit Summary Box -->
        <div style="background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; padding: 16px 18px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;" role="presentation">
            <tr>
              <td style="color: #78716c; padding: 4px 0; width: 40%;">Service Received:</td>
              <td style="color: #0f172a; font-weight: 700; text-align: right; padding: 4px 0;">${escapeHtml(booking.service || 'Nail Treatment')}</td>
            </tr>
            <tr>
              <td style="color: #78716c; padding: 4px 0;">Appointment Date:</td>
              <td style="color: #0f172a; font-weight: 700; text-align: right; padding: 4px 0;">${escapeHtml(formattedDate)} | ${escapeHtml(booking.time)}</td>
            </tr>
            <tr>
              <td style="color: #78716c; padding: 4px 0;">Booking Reference:</td>
              <td style="color: #bd6d64; font-family: monospace; font-weight: 700; text-align: right; padding: 4px 0;">#${escapeHtml(booking.bookingId || 'AURA')}</td>
            </tr>
          </table>
        </div>

        <!-- ================= GOOGLE MAPS REVIEW & FEEDBACK HERO CARD ================= -->
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 26px 20px; margin: 26px 0; text-align: center;">
          <div style="font-size: 30px; line-height: 1; letter-spacing: 5px; color: #f59e0b; margin-bottom: 8px;">
            ★★★★★
          </div>
          <div style="font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; color: #78350f; margin-bottom: 10px;">
            We'd Love Your 5-Star Feedback on Google Maps!
          </div>
          <p style="font-size: 14px; color: #92400e; line-height: 1.6; margin: 0 auto 20px auto; max-width: 480px;">
            As a local family salon, your review and photos mean the world to our nail artists! If you enjoyed your treatment today, would you please take just <strong>30 seconds</strong> to share your thoughts and snap a photo of your new nails on Google Maps? It helps others in our Morley community discover us and means so much to our passionate team!
          </p>

          <!-- Primary Gold Review Button -->
          <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto 14px auto;">
            <tr>
              <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%); box-shadow: 0 4px 14px rgba(180, 83, 9, 0.25);">
                <a href="https://maps.google.com/?q=Fashion+Nails+Morley+Galleria+Shopping+Centre+WA" target="_blank" style="display: inline-block; padding: 14px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14.5px; font-weight: 800; color: #ffffff !important; text-decoration: none; border-radius: 8px; letter-spacing: 0.03em;">
                  ⭐⭐⭐⭐⭐ Leave a Review on Google Maps &rarr;
                </a>
              </td>
            </tr>
          </table>

          <!-- Secondary Link: View Google Maps Location -->
          <div style="margin-top: 10px;">
            <a href="https://www.google.com/maps/place/Fashion+Nails/@-31.8970273,115.8950187,17z/data=!3m2!4b1!5s0x2a32b07d8b01e6d9:0x55f0c5881a2ec5f5!4m6!3m5!1s0x2a32b07d9c6d66f1:0x666e048b782d5d7a!8m2!3d-31.8970273!4d115.8975936!16s%2Fg%2F11dx8_j1f9?entry=ttu" target="_blank" style="font-size: 13px; font-weight: 700; color: #b45309; text-decoration: underline;">
              📍 View Our Salon Profile &amp; Customer Photos on Google Maps
            </a>
          </div>

          <!-- Direct Constructive Feedback Reassurance -->
          <div style="margin-top: 18px; padding-top: 14px; border-top: 1px dashed #fde68a; font-size: 12.5px; color: #92400e; line-height: 1.55;">
            <strong>Was anything not 100% perfect?</strong> Your satisfaction is our top priority. If any aspect of your service fell short of your expectations, please reply to <a href="mailto:info@fashionnailmorley.com.au" style="color: #78350f; font-weight: 700; text-decoration: underline;">this email</a> or call us at <a href="tel:+61893752888" style="color: #78350f; font-weight: 700; text-decoration: underline;">(08) 9375 2888</a>. We guarantee our work and will always make it right for you!
          </div>
        </div>

        <!-- Pro Nail Aftercare Tips Card -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 10px; font-size: 14px;">
            💅 Pro Tips to Keep Your Nails Gorgeous &amp; Healthy:
          </div>
          <div style="font-size: 13px; color: #475569; line-height: 1.6;">
            &bull; <strong>Daily Cuticle Hydration:</strong> Gently massage cuticle oil twice daily to keep cuticles nourished and prevent any premature lifting.<br>
            &bull; <strong>Protect with Gloves:</strong> Wear protective rubber gloves when doing house chores, washing dishes, or working with chemicals.<br>
            &bull; <strong>Timely Maintenance:</strong> We recommend scheduling your refill or fresh set every <strong>2 to 3 weeks</strong> for optimal nail strength and beauty.
          </div>
        </div>

        <!-- Re-book Next Visit CTA -->
        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 20px auto; width: 100%;">
          <tr>
            <td align="center">
              <a href="https://fashionnailmorley.com.au" style="display: inline-block; background-color: #1e1b18; color: #ffffff !important; text-decoration: none; padding: 13px 26px; border-radius: 8px; font-weight: 700; font-size: 14px; text-align: center; border: 1px solid #d4af37;">
                📅 Book Your Next Appointment Online
              </a>
            </td>
          </tr>
        </table>
      </div>

      ${renderBrandFooterHtml()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * 3. Builds HTML email for CANCELLED status
 * Sent to customer with sincere apology and options to reschedule
 */
export function buildCancelledEmailHtml(booking) {
  const {
    formattedDate,
    guests
  } = extractBookingDetails(booking);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notice: Appointment Cancellation [#${booking.bookingId || 'AURA'}] - Fashion Nails Morley</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; }
    .wrapper { width: 100%; background-color: #f8fafc; padding: 32px 12px; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    .content { padding: 32px 28px; }
    .details-table { width: 100%; border-collapse: collapse; background-color: #fafaf9; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; margin-bottom: 22px; }
    .details-table td { padding: 11px 16px; font-size: 14px; border-bottom: 1px solid #f0eee9; }
    .details-table tr:last-child td { border-bottom: none; }
    .td-label { color: #78716c; width: 42%; font-weight: 500; }
    .td-value { color: #1c1917; font-weight: 700; text-align: right; }
    .ref-code { display: inline-block; background-color: #f5f5f4; color: #bd6d64; font-family: monospace; font-size: 14px; padding: 3px 8px; border-radius: 6px; border: 1px dashed #d6d3d1; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      ${renderBrandHeaderHtml()}

      <div class="content">
        <!-- Status Badge -->
        <div style="text-align: left; margin-bottom: 16px;">
          <span style="display: inline-block; background-color: #fff1f2; color: #be123c; border: 1.5px solid #fecdd3; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; padding: 6px 14px; border-radius: 9999px;">
            ⚠️ APPOINTMENT CANCELLED
          </span>
        </div>

        <h1 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0; line-height: 1.35;">
          Notice: Your Appointment Has Been Cancelled
        </h1>

        <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 20px 0;">
          Dear <strong>${escapeHtml(booking.name)}</strong>,<br>
          We are writing to notify you that your scheduled appointment at <strong>Fashion Nail Morley Galleria</strong> has been cancelled.
        </p>

        <!-- Sincere Apology Card -->
        <div style="background-color: #fff1f2; border: 1.5px solid #fecdd3; border-left: 4px solid #e11d48; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; font-size: 14px; color: #881337; line-height: 1.6;">
          <div style="font-weight: 800; color: #9f1239; margin-bottom: 6px; font-size: 15px;">
            🙏 Our Sincerest Apologies
          </div>
          <div>
            We sincerely apologize for any inconvenience, disruption, or frustration this cancellation may cause to your schedule and plans. Our team always strives to deliver the highest standard of client care, and we deeply regret that we are unable to fulfill this appointment as scheduled.
          </div>
        </div>

        <!-- Cancelled Booking Details Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0 10px 0; width: 100%;">
          <tr>
            <td style="width: 26px; vertical-align: middle;">
              <div style="width: 24px; height: 24px; border-radius: 6px; background-color: #fef2f2; border: 1px solid #fecaca; text-align: center; line-height: 24px; font-size: 12px;">📋</div>
            </td>
            <td style="vertical-align: middle; padding-left: 8px; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #475569;">
              CANCELLED APPOINTMENT SUMMARY
            </td>
          </tr>
        </table>

        <table class="details-table" role="presentation">
          <tr>
            <td class="td-label">Booking Reference</td>
            <td class="td-value"><span class="ref-code">#${escapeHtml(booking.bookingId || 'AURA')}</span></td>
          </tr>
          <tr>
            <td class="td-label">Originally Scheduled Date</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(formattedDate)}</td>
          </tr>
          <tr>
            <td class="td-label">Originally Scheduled Time</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(booking.time || 'Scheduled')}</td>
          </tr>
          <tr>
            <td class="td-label">Service Booked</td>
            <td class="td-value" style="color: #0f172a;">${escapeHtml(booking.service || 'Nail Treatment')}</td>
          </tr>
          <tr>
            <td class="td-label">Party Size</td>
            <td class="td-value">${escapeHtml(String(guests))} ${guests > 1 ? 'People' : 'Person'}</td>
          </tr>
        </table>

        <!-- Rescheduling CTA and Direct Contact -->
        <p style="font-size: 14.5px; color: #475569; line-height: 1.6; margin: 0 0 18px 0;">
          We truly value your patronage and would love the opportunity to welcome you back at a more convenient date and time. You can easily pick a new time slot online with just a few clicks, or speak directly with our reception team:
        </p>

        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 20px auto; width: 100%;">
          <tr>
            <td align="center" style="padding: 6px;">
              <a href="https://fashionnailmorley.com.au" style="display: inline-block; background-color: #b45309; color: #ffffff !important; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center;">
                📅 Re-Book Appointment Online
              </a>
            </td>
            <td align="center" style="padding: 6px;">
              <a href="tel:+61893752888" style="display: inline-block; background-color: #1e293b; color: #ffffff !important; text-decoration: none; padding: 12px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-align: center;">
                📞 Call Front Desk: (08) 9375 2888
              </a>
            </td>
          </tr>
        </table>

        <!-- Support Reassurance -->
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; margin-top: 16px; font-size: 13px; color: #475569; line-height: 1.55;">
          <strong>Need Assistance or Have Questions?</strong> If this cancellation was unexpected or done in error, please reply directly to this email or call our front desk at <a href="tel:+61893752888" style="color: #0284c7; font-weight: 600;">(08) 9375 2888</a>. We will be more than happy to prioritize finding you an alternative slot.
        </div>
      </div>

      ${renderBrandFooterHtml()}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Dispatches status update email (confirmed, completed, cancelled) to customer via Resend
 */
export async function sendBookingStatusEmail(booking, status) {
  const resend = getResendClient();
  const lowerStatus = String(status || '').toLowerCase();

  if (!['confirmed', 'completed', 'cancelled'].includes(lowerStatus)) {
    return { sent: false, reason: `No email configured for status: ${status}` };
  }

  if (!booking?.email || !booking.email.includes('@')) {
    console.warn(`[Resend Email] Skipping status email (${lowerStatus}): No valid customer email for booking #${booking?.bookingId}`);
    return { sent: false, reason: 'No customer email address' };
  }

  if (!resend) {
    console.info(`[Resend Email] Skipping status email (${lowerStatus}): Resend API key not configured in .env.`);
    return { sent: false, reason: 'Missing RESEND API key' };
  }

  const logoBuf = getLogoBuffer();
  const attachments = logoBuf ? [
    {
      filename: 'fashion-nail-morley-logo.png',
      content: logoBuf,
      content_id: 'salon-logo',
      contentId: 'salon-logo',
      content_type: 'image/png',
      contentType: 'image/png'
    }
  ] : [];

  const senderEmail = config.emailFrom || 'Fashion Nail Morley <onboarding@resend.dev>';
  const ownerRecipient = (config.salonOwnerEmail || process.env.SALON_OWNER_EMAIL || process.env.OWNER_EMAIL || '').trim();

  let subject = '';
  let html = '';

  if (lowerStatus === 'confirmed') {
    subject = `✨ Booking Confirmed! Your Appointment is Locked In - Fashion Nails Morley [#${booking.bookingId || 'AURA'}]`;
    html = buildConfirmedEmailHtml(booking);
  } else if (lowerStatus === 'completed') {
    subject = `💖 Thank You for Visiting Fashion Nails Morley! How Was Your Experience? [#${booking.bookingId || 'AURA'}]`;
    html = buildCompletedEmailHtml(booking);
  } else if (lowerStatus === 'cancelled') {
    subject = `Notice: Appointment Cancellation [#${booking.bookingId || 'AURA'}] - Fashion Nails Morley`;
    html = buildCancelledEmailHtml(booking);
  }

  // Helper for Resend testing domain sandbox fallback
  async function attemptStatusSandboxFallback(rawErrorMsg) {
    const match = typeof rawErrorMsg === 'string' ? rawErrorMsg.match(/your own email address \(([^)]+)\)/i) : null;
    const targetEmail = match ? match[1] : (ownerRecipient || '2331540163@vaa.edu.vn');
    if (!targetEmail) return null;

    console.warn(`[Resend Sandbox] Customer status email (${booking.email}) intercepted by Resend sandbox policy.`);
    console.info(`[Resend Sandbox] Auto-redirecting test status email (${lowerStatus}) to: ${targetEmail}`);

    try {
      const fallbackRes = await resend.emails.send({
        from: senderEmail,
        to: targetEmail,
        subject: `[TEST SANDBOX: for ${booking.email}] ${subject}`,
        html: `
          <div style="background: #fef3c7; border: 1.5px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin-bottom: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #92400e; line-height: 1.5;">
            <strong>⚠️ Resend Sandbox Mode Notice:</strong><br>
            This status email (<strong>${escapeHtml(lowerStatus.toUpperCase())}</strong>) was intended for customer <strong>${escapeHtml(booking.email)}</strong>.<br>
            Because the sender domain is currently in testing mode (<code>${escapeHtml(senderEmail)}</code>), Resend forwarded this copy to your registered account email (<strong>${escapeHtml(targetEmail)}</strong>).
          </div>
        ` + html,
        attachments
      });

      if (!fallbackRes?.error) {
        console.info(`[Resend Email] Successfully delivered test status email (${lowerStatus}) to ${targetEmail}! ID: ${fallbackRes?.data?.id || fallbackRes?.id || 'OK'}`);
        return {
          sent: true,
          id: fallbackRes?.data?.id || fallbackRes?.id,
          sandboxRedirect: targetEmail
        };
      }
    } catch (e) {
      console.error('[Resend Sandbox] Status fallback error:', e.message);
    }
    return null;
  }

  try {
    const res = await resend.emails.send({
      from: senderEmail,
      to: booking.email,
      subject,
      html,
      attachments
    });

    const isSandboxError = res?.error && (
      res.error.statusCode === 403 ||
      res.error.name === 'validation_error' ||
      (typeof res.error.message === 'string' && (res.error.message.includes('only send testing emails') || res.error.message.includes('resend.com/domains')))
    );

    if (isSandboxError) {
      const fallbackResult = await attemptStatusSandboxFallback(res.error.message);
      if (fallbackResult) return fallbackResult;
    }

    if (res?.error) {
      console.error(`[Resend Email] Failed to send status email (${lowerStatus}) to ${booking.email}:`, res.error);
      return { sent: false, error: res.error.message || JSON.stringify(res.error) };
    }

    console.info(`[Resend Email] Status notification email (${lowerStatus}) successfully sent to ${booking.email} (ID: ${res?.data?.id || res?.id || 'OK'})`);
    return { sent: true, id: res?.data?.id || res?.id };
  } catch (err) {
    const isSandboxException = (err?.statusCode === 403 || err?.status === 403) ||
      (typeof err?.message === 'string' && (err.message.includes('only send testing emails') || err.message.includes('resend.com/domains')));

    if (isSandboxException) {
      const fallbackResult = await attemptStatusSandboxFallback(err.message);
      if (fallbackResult) return fallbackResult;
    }

    console.error(`[Resend Email] Exception sending status email (${lowerStatus}) to ${booking.email}:`, err.message);
    return { sent: false, error: err.message };
  }
}

