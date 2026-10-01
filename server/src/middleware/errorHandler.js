/**
 * Global safe error handling middleware
 * Never exposes sensitive stack traces or internal secrets to the public client
 */
export function errorHandler(err, req, res, next) {
  console.error('[Internal Server Error]:', err);

  const statusCode = err.statusCode || 500;
  const userMessage = req.body?.language === 'vi'
    ? 'Lỗi hệ thống; vui lòng thử lại sau.'
    : 'System error; please try again.';

  res.status(statusCode).json({
    success: false,
    message: err.message && statusCode < 500 ? err.message : userMessage
  });
}
