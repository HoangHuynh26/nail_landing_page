/**
 * Global safe error handling middleware
 * Never exposes sensitive stack traces or internal secrets to the public client
 */
export function errorHandler(err, req, res, next) {
  console.error('[Internal Server Error]:', err);

  const statusCode = err.statusCode || 500;
  const userMessage = req.body?.language === 'vi'
    ? 'An error occurred while processing your request. Please try again or contact the salon directly.'
    : 'An unexpected error occurred. Please try again later or call the salon directly.';

  res.status(statusCode).json({
    success: false,
    message: err.message && statusCode < 500 ? err.message : userMessage
  });
}
