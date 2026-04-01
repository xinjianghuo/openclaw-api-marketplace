#!/usr/bin/env node
// ClawHub Publisher v2 - follows redirects

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const token = 'clh_2iRFN2GxdihpjcLUd6Ig6iwStzDa8Bi6PH69Ee9Hr1E';
const args = process.argv.slice(2);

if (args.length < 6) {
  console.log('Usage: node publish.js <zipPath> <name> <description> <category> <tags> <price>');
  process.exit(1);
}

const [zipPath, name, description, category, tags, price] = args;

function uploadSkill() {
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  const fileData = fs.readFileSync(path.resolve(zipPath));
  const fileName = path.basename(zipPath);

  let body = '';
  body += `--${boundary}\r\nContent-Disposition: form-data; name="name"\r\n\r\n${name}\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="description"\r\n\r\n${description}\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="category"\r\n\r\n${category}\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="tags"\r\n\r\n${tags}\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="price"\r\n\r\n${price}\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="trial_days"\r\n\r\n7\r\n`;
  body += `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${fileName}"\r\nContent-Type: application/zip\r\n\r\n`;
  const preBody = Buffer.from(body, 'utf8');
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
      console.log(`\nStatus: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response:', data);
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const json = JSON.parse(data);
          console.log('\n✅ Success! Skill URL:', json.url || json.skill_url || 'Check ClawHub dashboard');
        } catch (e) {
          console.log('\n✅ Uploaded successfully (non-JSON response)');
        }
      } else {
        console.error('\n❌ Upload failed');
      }
    });
  });

  req.on('error', (e) => console.error('Request error:', e.message));
  req.write(payload);
  req.end();
}

uploadSkill();
