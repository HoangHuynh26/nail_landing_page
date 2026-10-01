/**
 * Utility to sanitize and format error messages for end users.
 * Prevents technical / developer errors (JSON parsing errors, 502 Bad Gateway,
 * stack traces, network timeouts, etc.) from leaking into the user interface.
 */

export const SYSTEM_ERROR_EN = 'System error; please try again.';
export const SYSTEM_ERROR_VI = 'Lỗi hệ thống; vui lòng thử lại sau.';

const TECHNICAL_PATTERNS = [
  /failed to execute 'json'/i,
  /unexpected end of json/i,
  /unexpected token/i,
  /is not valid json/i,
  /json\.parse/i,
  /bad gateway/i,
  /gateway timeout/i,
  /service unavailable/i,
  /internal server error/i,
  /failed to fetch/i,
  /networkerror/i,
  /network request failed/i,
  /net::err_/i,
  /load failed/i,
  /econnrefused/i,
  /econnreset/i,
  /etimedout/i,
  /syntaxerror/i,
  /typeerror/i,
  /referenceerror/i,
  /<!doctype/i,
  /<html/i,
  /502/i,
  /503/i,
  /504/i,
  /500/i,
  /proxy error/i,
  /cors/i,
  /abort/i
];

/**
 * Returns true if an error message contains technical developer jargon
 * or system/infrastructure failure signatures.
 */
export function isTechnicalError(msg) {
  if (!msg || typeof msg !== 'string') return true;
  const trimmed = msg.trim();
  if (!trimmed) return true;
  return TECHNICAL_PATTERNS.some(regex => regex.test(trimmed));
}

/**
 * Returns a user-friendly error message. If the given error or message
 * contains developer jargon, Bad Gateway, or is empty, returns "System error; please try again."
 * (or Vietnamese equivalent if language === 'vi').
 *
 * @param {Error|string|unknown} err - The error object or error string
 * @param {string} [language='en'] - 'en' or 'vi'
 * @returns {string} User-safe error message
 */
export function getFriendlyErrorMessage(err, language = 'en') {
  const fallback = language === 'vi' ? SYSTEM_ERROR_VI : SYSTEM_ERROR_EN;

  if (!err) return fallback;

  let rawMessage = '';
  if (typeof err === 'string') {
    rawMessage = err;
  } else if (err && typeof err === 'object') {
    rawMessage = err.message || (typeof err.error === 'string' ? err.error : '');
  }

  rawMessage = (rawMessage || '').trim();

  // If empty or matches any developer / server infrastructure failure, sanitize to user message
  if (!rawMessage || isTechnicalError(rawMessage)) {
    return fallback;
  }

  return rawMessage;
}
