/**
 * Main API Handler for Vercel Functions - Email-based verification
 * Enhanced with: structured logging, error handling, rate limiting
 */

const { runDiagnosis } = require('../lib/skills/node-doctor');
const { rateLimiter, MAX_REQUESTS_PER_WINDOW } = require('../middleware/rate-limiter');
const { asyncHandler, Errors } = require('../middleware/error-handler');
const pino = require('pino');

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
  timestamp: pino.stdTimeFunctions.isoTime
});

// Gumroad API 配置
const GUMROAD_PRODUCT_ID = '6F0E4C97-B72A4E69-A11BF6C4-AF6517E7';
const GUMROAD_API_TOKEN = 'xZ17v1PyQpQDBwkIm3OmPA==';
const CALLS_PER_PURCHASE = 100;

/**
 * Main handler (wrapped with asyncHandler for consistent error handling)
 */
async function handler(req, res) {
  const { method, url, body } = req;
  const requestId = req.headers['x-request-id'] || generateRequestId();
  
  // Add requestId to response
  res.setHeader('X-Request-Id', requestId);
  
  // Log request
  logger.info({ method: method, url: url, requestId }, 'incoming request');
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Request-Id');
  
  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check: GET /api/health
  if (method === 'GET' && url === '/api/health') {
    // Include rate limit stats in health response
    const { getStats } = require('../middleware/rate-limiter');
    const stats = getStats();
    return res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      rateLimitStats: stats
    });
  }

  // Usage check: GET /api/usage?email=test@example.com
  if (method === 'GET' && url === '/api/usage') {
    const email = req.query.email || (typeof body === 'string' ? JSON.parse(body).email : body?.email);
    
    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required parameter: email',
          timestamp: new Date().toISOString()
        }
      });
    }

    // Verify purchase (same logic as run)
    const verification = await verifyPurchase(email);
    
    if (!verification.valid) {
      return res.status(403).json({
        error: {
          code: 'BUSINESS_ERROR',
          message: verification.reason || 'Invalid license',
          timestamp: new Date().toISOString()
        }
      });
    }

    return res.json({
      email: email,
      remainingCalls: verification.remaining,
      licenseType: 'calls',
      purchaser: verification.purchaser
    });
  }

  // Metrics endpoint (optional)
  if (method === 'GET' && url === '/api/metrics') {
    const { getStats } = require('../middleware/rate-limiter');
    const stats = getStats();
    return res.json({
      timestamp: new Date().toISOString(),
      requests: stats.totalRequests,
      activeWindows: stats.activeWindows,
      uniqueUsers: stats.totalKeys
    });
  }

  // Run skill: POST /api/run
  if (method === 'POST' && url === '/api/run') {
    // Apply rate limit first
    const rateLimitResult = rateLimiter(req, res, () => {});
    if (rateLimitResult) {
      // rateLimiter already sent response
      return;
    }
    
    try {
      const { skill, input, email, test } = typeof body === 'string' ? JSON.parse(body) : body;

      if (!skill) {
        throw new Errors.ValidationError('Missing required field: skill');
      }

      // Test mode: bypass verification
      if (test === true) {
        logger.info({ email, test: true, requestId }, 'Test mode request');
        if (skill === 'node-connection-doctor') {
          const result = await runDiagnosis(input || {});
          return res.json({
            success: true,
            result,
            remainingCalls: CALLS_PER_PURCHASE - 1,
            licenseType: 'calls',
            test: true,
            requestId
          });
        } else {
          throw new Errors.NotFoundError(`Skill not found: ${skill}`);
        }
      }

      // Require email for verification
      if (!email) {
        throw new Errors.ValidationError('Missing required field: email');
      }

      // 1. 验证购买 (通过 Gumroad API)
      logger.debug({ email, requestId }, 'Verifying purchase');
      const verification = await verifyPurchase(email);
      
      if (!verification.valid) {
        logger.warn({ email, reason: verification.reason, requestId }, 'Purchase verification failed');
        throw new Errors.BusinessError(
          verification.reason || 'Purchase verification failed',
          { email }
        );
      }

      // 2. 检查剩余次数
      if (verification.remaining <= 0) {
        throw new Errors.BusinessError('Quota exceeded. Please purchase again.', {
          remaining: verification.remaining
        });
      }

      // 3. 执行技能
      let result;
      if (skill === 'node-connection-doctor') {
        result = await runDiagnosis(input || {});
      } else {
        throw new Errors.NotFoundError(`Skill not found: ${skill}`);
      }

      // 4. 返回结果
      logger.info({ 
        email, 
        remaining: verification.remaining - 1, 
        requestId,
        healthScore: result.healthScore 
      }, 'Request completed successfully');
      
      return res.json({
        success: true,
        result,
        remainingCalls: verification.remaining - 1,
        licenseType: 'calls',
        purchaser: verification.purchaser,
        requestId
      });

    } catch (error) {
      // Errors will be caught by final error handler (if using Express)
      // In Vercel functions, we handle here
      return handleError(req, res, error);
    }
  }

  // Not found
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${method} ${url}`,
      timestamp: new Date().toISOString()
    }
  });
}

/**
 * Error handling for Vercel functions
 */
function handleError(req, res, error) {
  let statusCode = error.statusCode || 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let details = null;
  
  if (error instanceof Errors.AppError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error.message) {
    message = error.message;
    details = error.details || null;
  }
  
  // Log error
  logger.error({ 
    code, 
    message, 
    details, 
    requestId: req.headers['x-request-id'],
    url: req.url,
    method: req.method,
    email: req.body?.email
  }, 'Request failed');
  
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
  
  if (req.headers['x-request-id']) {
    response.error.requestId = req.headers['x-request-id'];
  }
  
  return res.status(statusCode).json(response);
}

/**
 * Verify purchase via Gumroad API
 */
async function verifyPurchase(email) {
  const url = `https://api.gumroad.com/v2/purchases?email=${encodeURIComponent(email)}&product_id=${GUMROAD_PRODUCT_ID}`;
  
  try {
    logger.debug({ email, url }, 'Calling Gumroad API');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${GUMROAD_API_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        valid: false, 
        reason: `Gumroad API error: ${response.status}`,
        debug: data 
      };
    }
    
    if (!data.purchases || data.purchases.length === 0) {
      return { valid: false, reason: 'No purchases found for this email and product' };
    }
    
    // 找到有效的购买 (未退款、未争议)
    const validPurchase = data.purchases.find(p => !p.refunded && !p.disputed);
    if (!validPurchase) {
      return { valid: false, reason: 'All purchases refunded or disputed' };
    }
    
    // 计算剩余次数
    const uses = validPurchase.license_key_uses_left !== undefined 
      ? validPurchase.license_key_uses_left 
      : CALLS_PER_PURCHASE;
    
    return {
      valid: true,
      remaining: uses,
      purchaser: {
        email: validPurchase.email,
        name: validPurchase.name,
        orderNumber: validPurchase.order_number,
        saleId: validPurchase.sale_id
      }
    };
    
  } catch (error) {
    logger.error({ email, error: error.message }, 'Gumroad API verification failed');
    return { valid: false, reason: 'Verification service error', debug: error.message };
  }
}

/**
 * Generate simple request ID
 */
function generateRequestId() {
  return 'req_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Vercel 默认导出
module.exports = handler;

// 本地 Express 兼容 (可选)
if (require.main === module) {
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // Use async wrapper for all routes
  app.use((req, res, next) => {
    // Simplified middleware chain for local dev
    if (req.method === 'POST' && req.url === '/api/run') {
      // Rate limit check
      const rateLimitResult = rateLimiter(req, res, () => {});
      if (rateLimitResult) return;
    }
    next();
  });
  
  app.post('/api/run', asyncHandler(async (req, res) => {
    return handler(req, res);
  }));
  
  app.get('/api/health', asyncHandler(async (req, res) => {
    return handler(req, res);
  }));
  
  app.get('/api/metrics', asyncHandler(async (req, res) => {
    return handler(req, res);
  }));
  
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    logger.info(`API Marketplace running on http://localhost:${port}`);
  });
}
