/**
 * Simple Build Script - Create release zip without pkg
 * Since pkg is having issues, we'll provide source + run.bat
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const DIST_DIR = path.join(ROOT, 'dist');
const RELEASE_ZIP = 'churnbuster-v1.0.0.zip';

console.log('🔨 Building ChurnBuster v1.0 (Simple Package)...\n');

try {
  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
    console.log('✓ Cleaned dist directory');
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy all necessary files to dist
  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  // Copy source directories
  copyDir(path.join(ROOT, 'src'), path.join(DIST_DIR, 'src'));
  copyDir(path.join(ROOT, 'data'), path.join(DIST_DIR, 'data'));
  copyDir(path.join(ROOT, 'templates'), path.join(DIST_DIR, 'templates'));

  // Copy important files
  const filesToCopy = [
    'package.json',
    'README.md',
    'README-ZH.md',
    'run.bat'
  ];

  for (const file of filesToCopy) {
    const src = path.join(ROOT, file);
    const dest = path.join(DIST_DIR, file);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`  Copied ${file}`);
    } else {
      console.warn(`  Missing: ${file}`);
    }
  }

  // Create zip using PowerShell
  console.log('\n📦 Creating release zip...');
  if (fs.existsSync(RELEASE_ZIP)) {
    fs.unlinkSync(RELEASE_ZIP);
  }

  // Use PowerShell Compress-Archive to zip the dist folder contents
  execSync(`powershell Compress-Archive -Path "${DIST_DIR}\\*" -DestinationPath "${RELEASE_ZIP}" -Force`);

  const stats = fs.statSync(RELEASE_ZIP);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`\n✅ Build successful!`);
  console.log(`   Release file: ${RELEASE_ZIP} (${sizeMB} MB)`);
  console.log(`   Executable runner: run.bat (requires Node.js 18+)`);
  console.log('\n📝 Notes:');
  console.log('   - This package requires Node.js to be installed');
  console.log('   - Users double-click run.bat to start');
  console.log('   - Alternatively: node src/index.js --scan');
  console.log('\n📤 Next steps:');
  console.log('   1. Upload the .zip file to cloud storage');
  console.log('   2. Get shareable download link');
  console.log('   3. Update SALES_PAGE.html with the link');

} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  if (err.stdout) console.error(err.stdout);
  if (err.stderr) console.error(err.stderr);
  process.exit(1);
}
