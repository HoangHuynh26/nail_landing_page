/**
 * Global safe error handling middleware
 * Never exposes sensitive stack traces or internal secrets to the public client
 */
export function errorHandler(err, req, res, next) {
  console.error('[Internal Server Error]:', err);

  const statusCode = err.statusCode || 500;
  const isEn = req.body?.language === 'en';

  const userMessage = isEn
    ? 'An unexpected error occurred. Please try again later or call the salon directly.'
    : 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau hoặc liên hệ trực tiếp hotline salon.';

  res.status(statusCode).json({
    success: false,
    message: err.message && statusCode < 500 ? err.message : userMessage
  });
}
