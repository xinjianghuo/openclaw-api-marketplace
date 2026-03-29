/**
 * Subscription Detector
 * 扫描本地文件和环境变量以检测订阅服务
 */

const path = require('path');
const fs = require('fs');
const { homedir } = require('os');
const glob = require('glob');
const crypto = require('crypto');
const ConfigManager = require('./config');

class Detector {
  constructor(options = {}) {
    this.options = {
      exclude: options.exclude || [],
      dryRun: options.dryRun || false,
      verbose: options.verbose || false
    };
    this.config = ConfigManager.load();
    this.found = new Map(); // 去重存储
  }

  // 主扫描入口
  async scan() {
    this.log('Starting multi-source detection...');

    // 并行扫描不同数据源
    await Promise.all([
      this.scanConfigFiles(),
      this.scanBrowserHistory(),
      this.scanEnvironment(),
      this.scanCommonAppData()
    ]);

    // 记录结果到历史
    ConfigManager.addScanResult(Array.from(this.found.values()));

    return Array.from(this.found.values());
  }

  // 扫描配置文件 (JSON, YAML, .env)
  async scanConfigFiles() {
    this.log('Scanning config files...');

    const scanPaths = [
      path.join(homedir(), '.config'),
      process.env.APPDATA || path.join(homedir(), 'AppData', 'Roaming'),
      process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local'),
      homedir()
    ];

    const patterns = [
      '**/*.json',
      '**/*.config.json',
      '**/.env*',
      '**/config/**/*.yml',
      '**/config/**/*.yaml'
    ];

    for (const basePath of scanPaths) {
      if (!fs.existsSync(basePath)) continue;

      for (const pattern of patterns) {
        const fullPattern = path.join(basePath, pattern);
        try {
          const files = glob.sync(fullPattern, {
            ignore: this.options.exclude,
            nodir: true
          });

          for (const file of files) {
            await this.analyzeFile(file);
          }
        } catch (err) {
          this.log(`Glob error on ${fullPattern}: ${err.message}`, 'warn');
        }
      }
    }
  }

  // 分析单个文件
  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      // 检查是否包含已知服务的关键词
      const detectedServices = this.detectServiceKeywords(content);

      for (const service of detectedServices) {
        const key = this.generateKey(service, filePath, stats.mtime);
        if (!this.found.has(key)) {
          this.found.set(key, {
            id: crypto.randomUUID(),
            service_id: service.id,
            name: service.name,
            confidence: service.confidence,
            source_type: 'config_file',
            source_path: filePath,
            detected_at: new Date().toISOString(),
            last_modified: stats.mtime.toISOString()
          });
          this.log(`Detected ${service.name} in ${filePath}`, 'info');
        }
      }
    } catch (err) {
      // 忽略无法读取的文件 (加密、权限等)
      this.log(`Cannot read ${filePath}: ${err.message}`, 'warn');
    }
  }

  // 扫描浏览器历史 (Chrome/Edge)
  async scanBrowserHistory() {
    this.log('Scanning browser history...');

    const browserPaths = [
      // Chrome
      path.join(homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', 'Default', 'History'),
      // Edge
      path.join(homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', 'Default', 'History')
    ];

    for (const dbPath of browserPaths) {
      if (!fs.existsSync(dbPath)) continue;

      this.log(`Found browser history at ${dbPath}`, 'info');
      // TODO: 解析SQLite数据库，提取billing相关URLs
      // 这里只做基础URL检测，不读取完整历史（隐私考虑）
    }
  }

  // 扫描环境变量
  async scanEnvironment() {
    this.log('Scanning environment variables...');

    const env = process.env;
    const sensitivePatterns = /^(STRIPE_|PAYPAL_|AWS_|DIGITALOCEAN_|SHOPIFY_|TWILIO_|SENDGRID_|MAILGUN_|OPENAI_|ANTHROPIC_)/i;

    for (const [key, value] of Object.entries(env)) {
      if (sensitivePatterns.test(key) && value) {
        // 根据env var推测服务
        const service = this.inferServiceFromEnv(key, value);
        if (service) {
          const serviceKey = this.generateKey(service, 'env:' + key);
          if (!this.found.has(serviceKey)) {
            this.found.set(serviceKey, {
              id: crypto.randomUUID(),
              service_id: service.id,
              name: service.name,
              confidence: 80,
              source_type: 'environment',
              source_path: key,
              detected_at: new Date().toISOString()
            });
            this.log(`Detected ${service.name} via env var ${key}`, 'info');
          }
        }
      }
    }
  }

  // 扫描常见应用数据目录
  async scanCommonAppData() {
    this.log('Scanning common app data directories...');

    const commonPaths = [
      path.join(process.env.APPDATA || '', 'Spotify'),
      path.join(process.env.APPDATA || '', 'Netflix'),
      path.join(process.env.APPDATA || '', 'Adobe'),
      path.join(process.env.LOCALAPPDATA || '', 'Discord'),
      path.join(process.env.APPDATA || '', 'Slack')
    ];

    // TODO: 实现具体应用的订阅检测
    // 暂时留作扩展点
  }

  // 基于关键词检测服务
  detectServiceKeywords(content) {
    const matches = [];
    const lowerContent = content.toLowerCase();

    // 已知服务数据库 (简化版，完整版在services.json)
    const servicePatterns = [
      { id: 'netflix', name: 'Netflix', pattern: /netflix\.com|netflix/i, confidence: 90 },
      { id: 'spotify', name: 'Spotify', pattern: /spotify\.com|spotify/i, confidence: 90 },
      { id: 'hulu', name: 'Hulu', pattern: /hulu\.com|hulu/i, confidence: 90 },
      { id: 'aws', name: 'Amazon Web Services', pattern: /amazonaws\.com|\.amazonaws\.com|aws\.com/i, confidence: 85 },
      { id: 'stripe', name: 'Stripe', pattern: /stripe\.com|stripe_api_key|sk_live_/i, confidence: 95 },
      { id: 'paypal', name: 'PayPal', pattern: /paypal\.com|paypal/i, confidence: 85 },
      { id: 'dropbox', name: 'Dropbox', pattern: /dropbox\.com|dropbox/i, confidence: 90 },
      { id: 'google_workspace', name: 'Google Workspace', pattern: /googleapis\.com|google\.com/i, confidence: 70 },
      { id: 'github', name: 'GitHub', pattern: /github\.com|github\.io/i, confidence: 80 },
      { id: 'digitalocean', name: 'DigitalOcean', pattern: /digitalocean\.com|digitalocean/i, confidence: 85 },
      { id: 'linode', name: 'Linode', pattern: /linode\.com|linode/i, confidence: 85 },
      { id: 'vultr', name: 'Vultr', pattern: /vultr\.com|vultr/i, confidence: 85 },
      { id: 'cloudflare', name: 'Cloudflare', pattern: /cloudflare\.com|cloudflare/i, confidence: 80 },
      { id: 'slack', name: 'Slack', pattern: /slack\.com|slack/i, confidence: 80 },
      { id: 'zoom', name: 'Zoom', pattern: /zoom\.us|zoom/i, confidence: 85 },
      { id: 'notion', name: 'Notion', pattern: /notion\.so|notion/i, confidence: 90 },
      { id: 'airtable', name: 'Airtable', pattern: /airtable\.com|airtable/i, confidence: 90 },
      { id: 'calendly', name: 'Calendly', pattern: /calendly\.com|calendly/i, confidence: 90 },
      { id: 'zapier', name: 'Zapier', pattern: /zapier\.com|zapier/i, confidence: 90 },
      { id: 'make', name: 'Make (Integromat)', pattern: /make\.com|integromat/i, confidence: 85 },
      { id: 'grammarly', name: 'Grammarly', pattern: /grammarly\.com|grammarly/i, confidence: 90 },
      { id: 'adobe', name: 'Adobe Creative Cloud', pattern: /adobe\.com|adobe/i, confidence: 80 },
      { id: 'microsoft365', name: 'Microsoft 365', pattern: /microsoft\.com|office365|microsoft365/i, confidence: 85 }
    ];

    for (const service of servicePatterns) {
      if (service.pattern.test(content)) {
        matches.push({
          id: service.id,
          name: service.name,
          confidence: service.confidence,
          matched_content: lowerContent.substring(0, 100) // preview
        });
      }
    }

    return matches;
  }

  // 从环境变量推断服务
  inferServiceFromEnv(key, value) {
    const keyUpper = key.toUpperCase();
    const services = {
      'STRIPE': { id: 'stripe', name: 'Stripe', confidence: 95 },
      'PAYPAL': { id: 'paypal', name: 'PayPal', confidence: 95 },
      'AWS': { id: 'aws', name: 'Amazon Web Services', confidence: 90 },
      'DIGITALOCEAN': { id: 'digitalocean', name: 'DigitalOcean', confidence: 90 },
      'SHOPIFY': { id: 'shopify', name: 'Shopify', confidence: 90 },
      'TWILIO': { id: 'twilio', name: 'Twilio', confidence: 90 },
      'SENDGRID': { id: 'sendgrid', name: 'SendGrid', confidence: 90 },
      'MAILGUN': { id: 'mailgun', name: 'Mailgun', confidence: 90 },
      'OPENAI': { id: 'openai', name: 'OpenAI API', confidence: 95 },
      'ANTHROPIC': { id: 'anthropic', name: 'Anthropic API', confidence: 95 }
    };

    for (const [prefix, service] of Object.entries(services)) {
      if (keyUpper.startsWith(prefix)) {
        return service;
      }
    }

    return null;
  }

  // 生成唯一key用于去重
  generateKey(service, source, mtime = null) {
    const hash = crypto.createHash('md5');
    hash.update(service.id + '|' + source);
    if (mtime) hash.update('|' + mtime);
    return hash.digest('hex');
  }

  log(message, level = 'info') {
    if (this.options.verbose || level === 'warn' || level === 'error') {
      const prefix = {
        info: chalk.blue('ℹ'),
        warn: chalk.yellow('⚠'),
        error: chalk.red('✖')
      }[level] || '';
      console.log(`${prefix} ${message}`);
    }
  }
}

module.exports = Detector;
