#!/usr/bin/env node
/**
 * Structured logger utility (pino-like simple implementation)
 */

const pino = require('pino');

// 创建 logger 实例
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty'
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

// 附加请求上下文
function childLogger(reqId) {
  return logger.child({ reqId });
}

// 快捷方法
logger.info('API started', { port: process.env.PORT || 3000 });
logger.warn('Configuration missing', { missing: 'GUMROAD_API_TOKEN' });
logger.error('Connection failed', { error: 'ECONNREFUSED', code: 500 });

module.exports = { logger, childLogger };
