/**
 * Utility to format price strings or numbers cleanly without trailing decimal zeros (.00).
 * Examples:
 *   formatPrice(80) => "80"
 *   formatPrice("80.00") => "80"
 *   formatPrice("60.00") => "60"
 *   formatPrice("$80.00") => "80"
 *   formatPrice(80.5) => "80.5"
 *   formatPrice(null) => ""
 */
export function formatPrice(price) {
  if (price == null || price === '') return '';
  const clean = String(price).replace(/^\$/, '').trim();
  const num = Number(clean);
  if (isNaN(num)) {
    return clean.replace(/\.00$/, '');
  }
  // If whole integer (e.g. 80.00 -> 80)
  if (num % 1 === 0) {
    return String(Math.round(num));
  }
  // If has meaningful cents (e.g. 80.50 -> 80.5 or 80.75)
  return String(parseFloat(num.toFixed(2)));
}

export default formatPrice;
