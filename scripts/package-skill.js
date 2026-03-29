#!/usr/bin/env node
/**
 * 打包 Node Connection Doctor 为 ClawHub 发布格式
 */
const fs = require('fs');
const path = require('path');
const tar = require('tar'); // 需要 npm install tar

const skillDir = path.join(__dirname, 'skills', 'node-connection-doctor');
const outputPath = path.join(__dirname, 'skills', 'node-connection-doctor.tar.gz');

// 确保输出目录存在
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

tar.c(
  {
    gzip: true,
    cwd: path.join(__dirname, 'skills'),
    file: outputPath
  },
  ['node-connection-doctor']
).then(() => {
  console.log(`✅ 打包完成: ${outputPath}`);
  console.log(`   大小: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
}).catch(err => {
  console.error('❌ 打包失败:', err);
  process.exit(1);
});