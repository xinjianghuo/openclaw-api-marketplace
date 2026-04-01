/**
 * Build Script
 * 使用 pkg 将 ChurnBuster 打包成单文件可执行程序
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');

console.log('🔨 Building ChurnBuster v1.0...\n');

try {
  // 清理dist目录
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
    console.log('✓ Cleaned dist directory');
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 安装依赖 (如果未安装)
  console.log('Installing dependencies...');
  execSync('npm install', { cwd: ROOT, stdio: 'inherit' });
  console.log('✓ Dependencies installed');

  // 运行测试
  console.log('\nRunning tests...');
  try {
    execSync('npm test', { cwd: ROOT, stdio: 'inherit' });
    console.log('✓ Tests passed');
  } catch (err) {
    console.warn('⚠ Tests failed or not implemented, continuing build...');
  }

  // 使用 pkg 打包
  console.log('\nPackaging with pkg...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });
  console.log('✓ Packaging complete');

  // 输出文件信息
  const files = fs.readdirSync(DIST_DIR);
  console.log('\n📦 Output files:');
  files.forEach(f => {
    const filepath = path.join(DIST_DIR, f);
    const stats = fs.statSync(filepath);
    console.log(`  ${f} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  });

  console.log('\n✅ Build successful!');
  console.log(`Executable located at: ${DIST_DIR}`);
  console.log('\nTo distribute:');
  console.log('  - Zip the entire dist/ folder');
  console.log('  - Users just need to run churnbuster.exe (Windows)');
  console.log('  - No Node.js installation required');

} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  if (err.stdout) console.error(err.stdout);
  if (err.stderr) console.error(err.stderr);
  process.exit(1);
}
