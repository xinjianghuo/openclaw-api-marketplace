/**
 * Rate Limiter Middleware
 * Fixed window algorithm: per email, 100 requests per hour
 * Uses in-memory storage (suitable for Vercel serverless)
 */

// In-memory store (volatile, but fine for serverless instances)
const rateLimitStore = new Map(); // key: email, value: { count, resetAt }

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 100;

/**
 * Generate rate limit key from email (lowercase, trimmed)
 */
function getRateLimitKey(email) {
  return email ? email.toLowerCase().trim() : 'anonymous';
}

/**
 * Check if request is within limit
 * Returns { allowed: boolean, remaining: number, resetAt: timestamp }
 */
function checkRateLimit(email) {
  const key = getRateLimitKey(email);
  const now = Date.now();
  
  if (!rateLimitStore.has(key)) {
    // First request in new window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
  
  const record = rateLimitStore.get(key);
  
  // Window expired? Reset
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitStore.set(key, record);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: record.resetAt };
  }
  
  // Within window
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }
  
  record.count++;
  rateLimitStore.set(key, record);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetAt: record.resetAt };
}

/**
 * Express/Vercel middleware handler
 */
async function rateLimiter(req, res, next) {
  // Only apply to /api/run endpoint
  if (req.url !== '/api/run' || req.method !== 'POST') {
    return next();
  }
  
  // Get email from request body
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch (e) {
    body = req.body;
  }
  
  const email = body.email || 'anonymous';
  const result = checkRateLimit(email);
  
  // Add rate limit headers to response
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.floor(result.resetAt / 1000)); // Unix timestamp
  
  if (!result.allowed) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        details: {
          resetAt: new Date(result.resetAt).toISOString(),
          retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
        }
      }
    });
  }
  
  next();
}

/**
 * Get stats for monitoring
 */
function getStats() {
  const now = Date.now();
  const stats = {
    totalKeys: rateLimitStore.size,
    activeWindows: 0,
    totalRequests: 0
  };
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now <= record.resetAt) {
      stats.activeWindows++;
      stats.totalRequests += record.count;
    }
  }
  
  return stats;
}

/**
 * Clear expired entries (call periodically if needed)
 */
function cleanup() {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

module.exports = {
  rateLimiter,
  getStats,
  cleanup,
  MAX_REQUESTS_PER_WINDOW,
  RATE_LIMIT_WINDOW_MS
};
