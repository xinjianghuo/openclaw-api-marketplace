# API Design 学习笔记

## 📚 学习目标

- 掌握 RESTful API 设计原则
- 学会认证与安全最佳实践
- 实现速率限制和监控
- 生成 OpenAPI 文档
- 优化现有 API (API Marketplace)

---

## 1. RESTful 设计原则

### 1.1 资源导向

- 使用名词表示资源 (不要用动词)
- 复数形式 (一致性)

```
✅ GET /api/v1/products
✅ GET /api/v1/products/{id}
❌ GET /api/v1/getProducts
❌ GET /api/v1/product/list
```

### 1.2 HTTP 方法语义

| 方法 | 用途 | 幂等性 | 安全性 |
|------|------|--------|--------|
| GET | 查询 | ✅ 是 | ✅ 安全 (不修改数据) |
| POST | 创建 | ❌ 否 | ❌ 不安全 |
| PUT | 全量更新 | ✅ 是 | ❌ 不安全 |
| PATCH | 部分更新 | ✅ 是 | ❌ 不安全 |
| DELETE | 删除 | ✅ 是 | ❌ 不安全 |

### 1.3 状态码使用

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 成功 | GET/PUT/PATCH 成功 |
| 201 Created | 已创建 | POST 成功创建资源 |
| 204 No Content | 无内容 | DELETE 成功 |
| 400 Bad Request | 请求错误 | 参数验证失败 |
| 401 Unauthorized | 未认证 | 缺少/无效 token |
| 403 Forbidden | 无权限 | 认证成功但权限不足 |
| 404 Not Found | 不存在 | 资源不存在 |
| 409 Conflict | 冲突 | 资源已存在 (创建时) |
| 422 Unprocessable Entity | 语义错误 | 业务逻辑验证失败 |
| 429 Too Many Requests | 请求过多 | 速率限制 |
| 500 Internal Server Error | 服务器错误 | 未处理的异常 |
| 503 Service Unavailable | 服务不可用 | 维护/重载 |

### 1.4 版本管理

- URL 路径: `/api/v1/products`
- Header: `Accept: application/vnd.api.v1+json`
- Query: `/api/products?version=1`

**推荐**: URL 路径 (`/api/v1/`) - 简单明确

### 1.5 过滤、排序、分页

```
GET /api/v1/products?page=2&limit=50
GET /api/v1/products?sort=-created_at,name
GET /api/v1/products?status=active&category=software
GET /api/v1/products?q=keyword  # 搜索
```

---

## 2. 认证与授权

### 2.1 API Key

- 简单: 每个请求带 `X-API-Key: xxx`
- 适用: 机器对机器，内部服务
- 缺点: 无法撤销，无过期时间

示例:
```javascript
// 客户端
headers: { 'X-API-Key': 'your-api-key' }

// 服务器端
const apiKey = req.headers['x-api-key'];
if (!validApiKeys[apiKey]) return 401;
```

### 2.2 JWT (JSON Web Token)

- 自包含: payload 包含用户信息、过期时间
- 无状态: 服务器不存储 session
- 可签名: 防篡改

结构: `header.payload.signature`

示例:
```javascript
// 生成 token
const token = jwt.sign(
  { userId: 123, role: 'user' },
  secret,
  { expiresIn: '7d' }
);

// 验证 token
const decoded = jwt.verify(token, secret);
```

### 2.3 OAuth 2.0

- 授权码模式 (Authorization Code)
- 客户端凭证 (Client Credentials)
- 隐式模式 (Implicit) - 已废弃
- 刷新令牌 (Refresh Token)

---

## 3. 速率限制 (Rate Limiting)

### 3.1 为什么需要

- 防止滥用 (DDoS、暴力破解)
- 保证服务质量 (公平使用)
- 计费基础 (按使用收费)

### 3.2 常见算法

#### 固定窗口 (Fixed Window)

```javascript
// 每小时内最多 100 次
const key = `rate:${userId}:${hour}`;
const current = await redis.get(key) || 0;
if (current >= 100) return 429;
await redis.incr(key);
await redis.expire(key, 3600);
```

#### 滑动日志 (Sliding Log)

- 记录请求时间戳列表
- 统计最近 N 分钟内的请求数
- 精确但内存消耗大

#### 令牌桶 (Token Bucket)

- 以恒定速率填充令牌
- 每次请求消耗令牌
- 允许突发流量

```javascript
// 令牌桶算法简化版
const capacity = 100; // 桶容量
const refillRate = 10; // 每秒补充 10 个令牌
let tokens = capacity;
let lastRefill = Date.now();

function consume() {
  const now = Date.now();
  const delta = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + delta * refillRate);
  lastRefill = now;
  
  if (tokens >= 1) {
    tokens--;
    return true;
  }
  return false;
}
```

### 3.3 返回头部

```
X-RateLimit-Limit: 100      # 总配额
X-RateLimit-Remaining: 87   # 剩余次数
X-RateLimit-Reset: 1703896200  # 重置时间 (Unix timestamp)
Retry-After: 60             # 重试等待秒数 (429 时)
```

---

## 4. 错误处理

### 4.1 统一错误格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be a valid email address" }
    ],
    "requestId": "req_123456",
    "timestamp": "2026-03-28T05:30:00Z"
  }
}
```

### 4.2 不要暴露内部细节

❌ 错误:
```json
{ "error": "Connection refused: connect ECONNREFUSED 127.0.0.1:5432" }
```

✅ 正确:
```json
{ "error": { "code": "SERVICE_UNAVAILABLE", "message": "Database temporarily unavailable" } }
```

---

## 5. 请求与响应格式

### 5.1 通用响应结构

```json
{
  "success": true,
  "data": { ... },           // 成功时的数据
  "error": null,             // 失败时的错误对象
  "meta": {                  // 元数据 (分页、速率限制等)
    "page": 1,
    "limit": 50,
    "total": 123,
    "rateLimit": { "remaining": 87, "reset": 1703896200 }
  }
}
```

### 5.2 列表响应

```json
{
  "success": true,
  "data": [ { "id": 1, ... }, { "id": 2, ... } ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 6. OpenAPI (Swagger) 文档

### 6.1 什么是 OpenAPI

- API 规范标准 (YAML/JSON)
- 自动生成文档
- 生成客户端 SDK
- 自动化测试

### 6.2 基本结构

```yaml
openapi: 3.0.0
info:
  title: Node Doctor API
  version: 1.0.0
  description: OpenClaw node connection diagnosis API
servers:
  - url: https://api.example.com/v1
paths:
  /products:
    get:
      summary: List products
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'
components:
  schemas:
    Product:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        price:
          type: number
```

### 6.3 工具

- **Swagger UI**: 交互式文档界面
- **Swagger Editor**: 在线编辑与预览
- **ReDoc**: 另一个文档渲染器
- **openapi-generator**: 生成 SDK

---

## 7. 现有 API 改进 (API Marketplace)

### 7.1 当前架构问题

1. **无结构化日志** - 难以调试
2. **错误处理不统一** - 有时返回 {error}, 有时直接 text
3. **无速率限制** - 可能被滥用
4. **无监控指标** - 不知道调用量、延迟、错误率
5. **无 OpenAPI 文档** - 用户不知道怎么用

### 7.2 改进计划

**优先级 1 (本周)**:
- ✅ 添加结构化日志 (使用 `pino` 或 `winston`)
- ✅ 统一错误处理中间件
- ✅ 添加速率限制 (基于邮箱/IP)
- ✅ 添加健康检查端点 (`/api/health` 已有)

**优先级 2 (下周)**:
- ⏳ 生成 OpenAPI 文档
- ⏳ 添加请求 ID 追踪
- ⏳ 实现监控 (Prometheus metrics)
- ⏳ 添加缓存层 (Redis)

**优先级 3 (下月)**:
- 🔄 API 版本管理 (`/api/v2/`)
- 🔄 GraphQL 端点 (可选)
- 🔄 批量操作端点

---

## 8. 安全最佳实践

1. **HTTPS 强制** - 拒绝 HTTP 请求
2. **CORS 配置** - 明确允许的源
3. **SQL 注入防护** - 使用参数化查询
4. **XSS 防护** - 输出编码
5. **CSRF 保护** (如果支持 cookie)
6. **输入验证** - 使用 `zod` 或 `joi`
7. **敏感数据脱敏** - 日志中不记录 password/token
8. **定期依赖更新** - 安全漏洞修复

---

## 9. 性能优化

1. **数据库索引** - 查询字段加索引
2. **连接池** - 复用数据库连接
3. **缓存**:
   - Redis 缓存热点数据
   - CDN 缓存静态资源
   - HTTP 缓存头 (`Cache-Control`, `ETag`)
4. **分页** - 大列表必须分页
5. **压缩** - 启用 gzip/brotli
6. **异步处理** - 耗时任务放入队列 (Bull, RabbitMQ)
7. **数据库读写分离** - 主从复制

---

## 10. 测试策略

1. **单元测试** - 测试核心函数
2. **集成测试** - 测试 API 端点
3. **E2E 测试** - 模拟真实用户流程
4. **负载测试** - 压力测试 (k6, artillery)
5. **契约测试** - 确保前后端接口一致 (Pact)

---

## 11. API 演进与废弃

- **版本化**: `/api/v1/`, `/api/v2/`
- **废弃通知**: 返回 `Deprecation: true` 头部
- **迁移期**: 至少保留旧版本 6 个月
- **文档更新**: 及时更新文档，标记废弃端点

---

## 🎯 下一步行动

1. ✅ 完成本笔记阅读
2. 🔧 为现有 API 添加:
   - 结构化日志
   - 统一错误处理
   - 速率限制 (按邮箱)
3. 📄 生成 OpenAPI 文档
4. 🧪 编写集成测试
5. 📊 添加监控指标

---

*Last Updated: 2026-03-28 13:27 by JARVIS*
