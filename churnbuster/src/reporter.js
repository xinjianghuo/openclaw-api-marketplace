/**
 * HTML Report Generator
 * 生成美观的取消指南HTML报告
 */

const path = require('path');
const fs = require('fs');

class Reporter {
  constructor() {
    this.templatePath = path.join(__dirname, '..', 'templates', 'report.html');
  }

  generate(subscriptions, reports) {
    const timestamp = new Date().toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai'
    });

    const html = this.renderTemplate({
      generated_at: timestamp,
      total_count: subscriptions.length,
      subscriptions: reports.map(r => ({
        name: r.service.name,
        service_id: r.service_id,
        confidence: r.subscription.confidence,
        source: r.subscription.source_type,
        guide: r.guide.steps.map(s => ({
          title: s.title,
          description: s.description,
          url: s.url || '',
          warning: s.warning || '',
          tip: s.tip || ''
        })),
        contact: r.guide.contact_info || {},
        tips: r.guide.general_tips || []
      }))
    });

    const outputDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const filename = `churnbuster-report-${Date.now()}.html`;
    const outputPath = path.join(outputDir, filename);

    fs.writeFileSync(outputPath, html, 'utf8');

    return outputPath;
  }

  renderTemplate(data) {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ChurnBuster - Subscription Cancellation Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
      background: #f8f9fa;
      color: #333;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 2.2em;
    }
    .meta {
      opacity: 0.9;
      font-size: 0.9em;
    }
    .summary {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2196f3;
    }
    .subscription {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 25px;
      overflow: hidden;
    }
    .sub-header {
      background: #f1f3f4;
      padding: 15px 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .sub-header h2 {
      margin: 0;
      font-size: 1.4em;
      color: #1976d2;
    }
    .sub-meta {
      font-size: 0.85em;
      color: #666;
      margin-top: 5px;
    }
    .sub-body {
      padding: 20px;
    }
    .steps {
      margin: 20px 0;
    }
    .step {
      display: flex;
      margin-bottom: 15px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 6px;
      border-left: 3px solid #4caf50;
    }
    .step-number {
      background: #4caf50;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 15px;
      flex-shrink: 0;
    }
    .step-content {
      flex: 1;
    }
    .step-title {
      font-weight: 600;
      margin-bottom: 8px;
      color: #2e7d32;
    }
    .step-desc {
      margin-bottom: 10px;
      color: #555;
    }
    .step-url {
      display: inline-block;
      background: #e8f5e9;
      color: #2e7d32;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 0.9em;
      text-decoration: none;
      margin-bottom: 8px;
    }
    .step-warning {
      background: #fff3e0;
      color: #e65100;
      padding: 10px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-top: 8px;
    }
    .step-tip {
      background: #e3f2fd;
      color: #1565c0;
      padding: 10px;
      border-radius: 4px;
      font-size: 0.9em;
      margin-top: 8px;
    }
    .contact {
      background: #fff8e1;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .contact h3 {
      margin-top: 0;
      color: #f57c00;
    }
    .contact p {
      margin: 5px 0;
    }
    .general-tips {
      background: #e8eaf6;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
    }
    .general-tips ul {
      margin: 0;
      padding-left: 20px;
    }
    .general-tips li {
      margin-bottom: 8px;
    }
    .confidence {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.8em;
      font-weight: 600;
    }
    .confidence.high { background: #c8e6c9; color: #2e7d32; }
    .confidence.medium { background: #fff9c4; color: #f57f17; }
    .confidence.low { background: #ffcdd2; color: #c62828; }
    .footer {
      text-align: center;
      margin-top: 40px;
      color: #999;
      font-size: 0.9em;
    }
    @media print {
      body { background: white; }
      .subscription { box-shadow: none; border: 1px solid #ddd; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚀 ChurnBuster Report</h1>
    <p class="meta">Generated on <%= generated_at %> | Total Subscriptions: <%= total_count %></p>
  </div>

  <% if (total_count === 0) { %>
    <div class="summary">
      <h3>🎉 Great news!</h3>
      <p>No recurring subscriptions were detected on your system. You're already optimized!</p>
    </div>
  <% } else { %>
    <div class="summary">
      <h3>📊 Summary</h3>
      <p>We found <strong><%= total_count %></strong> subscription(s) that you may want to review or cancel.</p>
      <p>Follow the steps below to avoid unwanted charges. Pay special attention to next billing dates.</p>
    </div>

    <% subscriptions.forEach(function(sub) { %>
      <div class="subscription">
        <div class="sub-header">
          <h2><%= sub.name %></h2>
          <div class="sub-meta">
            Service ID: <%= sub.service_id %> |
            Confidence: <span class="confidence <%= getConfidenceClass(sub.confidence) %>"><%= sub.confidence %>%</span> |
            Detected from: <%= sub.source %>
          </div>
        </div>
        <div class="sub-body">
          <div class="steps">
            <h3>Cancellation Steps</h3>
            <% sub.guide.forEach(function(step, idx) { %>
              <div class="step">
                <div class="step-number"><%= idx + 1 %></div>
                <div class="step-content">
                  <div class="step-title"><%= step.title %></div>
                  <% if (step.description) { %>
                    <div class="step-desc"><%= step.description %></div>
                  <% } %>
                  <% if (step.url) { %>
                    <a href="<%= step.url %>" target="_blank" class="step-url">🔗 Visit Service Site</a>
                  <% } %>
                  <% if (step.warning) { %>
                    <div class="step-warning">⚠️ <%= step.warning %></div>
                  <% } %>
                  <% if (step.tip) { %>
                    <div class="step-tip">💡 <%= step.tip %></div>
                  <% } %>
                </div>
              </div>
            <% }); %>
          </div>

          <% if (sub.contact && Object.keys(sub.contact).length > 0) { %>
            <div class="contact">
              <h3>📞 Need Help? Contact Support</h3>
              <% if (sub.contact.email) { %>
                <p>📧 Email: <%= sub.contact.email %></p>
              <% } %>
              <% if (sub.contact.phone) { %>
                <p>📞 Phone: <%= sub.contact.phone %></p>
              <% } %>
              <% if (sub.contact.chat) { %>
                <p>💬 Chat: <%= sub.contact.chat %></p>
              <% } %>
            </div>
          <% } %>

          <% if (sub.tips && sub.tips.length > 0) { %>
            <div class="general-tips">
              <h3>💡 General Tips</h3>
              <ul>
                <% sub.tips.forEach(function(tip) { %>
                  <li><%= tip %></li>
                <% }); %>
              </ul>
            </div>
          <% } %>
        </div>
      </div>
    <% }); %>
  <% } %>

  <div class="footer">
    <p>Generated by ChurnBuster v1.0 | By JARVIS for 无水乙醇</p>
    <p>This report is for informational purposes. Always verify cancellation status on the service website.</p>
  </div>

  <script>
    // Helpers (injected server-side in real version)
    function getConfidenceClass(score) {
      if (score >= 80) return 'high';
      if (score >= 50) return 'medium';
      return 'low';
    }
  </script>
</body>
</html>`;
  }
}

module.exports = Reporter;
