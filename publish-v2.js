#!/usr/bin/env node
// ClawHub Publisher using native https with proper multipart

const https = require('https');
const fs = require('fs');
const path = require('path');

const token = 'clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E';

async function upload(zipPath, name, description, category, tags, price) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileData = fs.readFileSync(path.resolve(zipPath));
    const fileName = path.basename(zipPath);

    const fields = [
      `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\n${name}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\n${description}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\n${category}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="tags"\r\n\r\n${tags}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="price"\r\n\r\n${price}\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="trial_days"\r\n\r\n7\r\n`,
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/zip\r\n\r\n`
    ];

    const preBody = Buffer.concat(fields.map(f => Buffer.from(f, 'utf8')));
    const postBody = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8');
    const payload = Buffer.concat([preBody, fileData, postBody]);

    const options = {
      hostname: 'clawhub.ai',
      port: 443,
      path: '/api/v1/skills',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': payload.length,
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body: data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Usage: node publish.js <zipPath> <name> <description> <category> <tags> <price>
const args = process.argv.slice(2);
if (args.length < 6) {
  console.error('Usage: node publish.js <zipPath> <name> <description> <category> <tags> <price>');
  process.exit(1);
}

const [zipPath, name, description, category, tags, price] = args;

// Truncate description if too long (ClawHub limit ~500 chars)
if (description.length > 500) {
  description = description.substring(0, 450) + '...';
}

upload(zipPath, name, description, category, tags, price)
  .then(result => {
    console.log('✅ Success:', result.body);
    try {
      const json = JSON.parse(result.body);
      console.log('Skill URL:', json.url || json.skill_url);
    } catch (e) {}
  })
  .catch(err => console.error('❌ Failed:', err.message));
