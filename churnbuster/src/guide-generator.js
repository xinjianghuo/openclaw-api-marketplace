/**
 * Guide Generator
 * 为每个检测到的服务生成取消指南
 */

const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

class GuideGenerator {
  constructor() {
    this.servicesData = this.loadServicesData();
    this.guides = this.loadGuides();
  }

  // 加载服务数据库 (services.json)
  loadServicesData() {
    try {
      const dataPath = path.join(__dirname, '..', 'data', 'services.json');
      const raw = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(raw);
    } catch (err) {
      console.warn('Services data not found, using minimal fallback');
      return { services: [] };
    }
  }

  // 加载取消指南
  loadGuides() {
    try {
      const guidesPath = path.join(__dirname, '..', 'data', 'cancellation-guides.json');
      const raw = fs.readFileSync(guidesPath, 'utf8');
      return JSON.parse(guides);
    } catch (err) {
      console.warn('Cancellation guides not found, using fallback');
      return {};
    }
  }

  // 为所有订阅生成报告
  async generateAll(subscriptions) {
    const reports = [];

    for (const sub of subscriptions) {
      const service = this.servicesData.services.find(s => s.id === sub.service_id);
      const guide = this.guides[sub.service_id] || this.getFallbackGuide(sub.service_id);

      const report = {
        subscription: sub,
        service: service || { name: sub.name, id: sub.service_id },
        guide: guide,
        generated_at: new Date().toISOString()
      };

      reports.push(report);
    }

    return reports;
  }

  // 生成单个服务的取消指南
  generateGuide(subscription) {
    const service = this.servicesData.services.find(s => s.id === subscription.service_id);
    const guide = this.guides[subscription.service_id] || this.getFallbackGuide(subscription.service_id);

    return {
      service: service || { name: subscription.name },
      guide: guide
    };
  }

  // 获取备用指南 (当数据库无详细指南时)
  getFallbackGuide(serviceId) {
    return {
      steps: [
        {
          title: 'Log into your account',
          description: 'Go to the service website and log in with your credentials.',
          url: `https://www.${serviceId}.com/account` // 简单猜测，实际需验证
        },
        {
          title: 'Find billing/subscription settings',
          description: 'Look for "Billing", "Subscription", or "Account Settings".'
        },
        {
          title: 'Cancel subscription',
          description: 'Click "Cancel subscription" and follow the prompts.',
          warning: 'Be careful not to accidentally upgrade or start a new trial.'
        },
        {
          title: 'Confirm cancellation',
          description: 'Check your email for cancellation confirmation.',
          tip: 'Take a screenshot as proof in case of future disputes.'
        }
      ],
      contact_info: {
        email: `support@${serviceId}.com`,
        phone: 'Check website for phone support',
        chat: 'Usually available on website'
      },
      general_tips: [
        'Cancel 24-48 hours before next billing date to avoid charges',
        'Contact support if auto-renew doesn\'t turn off',
        'Check your bank/credit card statement to confirm no further charges'
      ]
    };
  }
}

module.exports = GuideGenerator;
