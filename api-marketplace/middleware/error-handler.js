/**
 * Universal Error Handler Middleware
 * Standardizes error responses according to API design best practices
 */

/**
 * Error class with structured info
 */
class AppError extends Error {
  constructor(code, message, details = null, statusCode = 500) {
    super(message);
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Predefined error types
const Errors = {
  // 400 - Bad Request
  ValidationError: (details) => new AppError('VALIDATION_ERROR', 'Invalid request parameters', details, 400),
  
  // 401 - Unauthorized
  AuthenticationError: (message = 'Authentication required') => new AppError('UNAUTHENTICATED', message, null, 401),
  
  // 403 - Forbidden
  PermissionError: (message = 'Insufficient permissions') => new AppError('FORBIDDEN', message, null, 403),
  
  // 404 - Not Found
  NotFoundError: (message = 'Resource not found') => new AppError('NOT_FOUND', message, null, 404),
  
  // 409 - Conflict
  ConflictError: (message = 'Resource conflict') => new AppError('CONFLICT', message, null, 409),
  
  // 422 - Unprocessable Entity
  BusinessError: (message, details = null) => new AppError('BUSINESS_ERROR', message, details, 422),
  
  // 429 - Too Many Requests
  RateLimitError: (details) => new AppError('RATE_LIMIT_EXCEEDED', 'Too many requests', details, 429),
  
  // 500 - Internal Server Error
  ServerError: (details = null) => new AppError('INTERNAL_SERVER_ERROR', 'An unexpected error occurred', details, 500),
  
  // 503 - Service Unavailable
  ServiceUnavailable: (message = 'Service temporarily unavailable') => new AppError('SERVICE_UNAVAILABLE', message, null, 503)
};

/**
 * Express/Vercel error handler middleware
 */
async function errorHandler(req, res, next) {
  // Store original error handler
  if (!res._hasErrorHandler) {
    res._hasErrorHandler = true;
    res.on('error', (err) => {
      console.error('Response error:', err);
    });
  }
  
  next();
}

/**
 * Wrap async route handler to catch errors
 */
function asyncHandler(fn) {
  return function(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Final error middleware (should be last)
 */
function finalErrorHandler(err, req, res, next) {
  // Log error
  console.error(`[ERROR] ${req.method} ${req.url}`, {
    code: err.code || err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    userAgent: req.headers['user-agent'],
    email: req.body?.email // from API request
  });
  
  let statusCode = err.statusCode || 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = null;
  
  // Handle AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
    details = err.errors;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    code = 'FILE_TOO_LARGE';
    message = 'Uploaded file exceeds size limit';
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = 'Resource not found';
  } else if (err.code === 'PRECONDITION_FAILED') {
    statusCode = 412;
    code = 'PRECONDITION_FAILED';
    message = err.message || 'Precondition failed';
  } else if (err.message?.includes('timeout')) {
    statusCode = 504;
    code = 'GATEWAY_TIMEOUT';
    message = 'Upstream service timeout';
  }
  
  // In production, don't expose stack traces
  const response = {
    error: {
      code,
      message,
      timestamp: new Date().toISOString()
    }
  };
  
  if (details && process.env.NODE_ENV !== 'production') {
    response.error.details = details;
  }
  
  // Add request ID if available
  if (req.requestId) {
    response.error.requestId = req.requestId;
  }
  
  res.status(statusCode).json(response);
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError,
  Errors
};
