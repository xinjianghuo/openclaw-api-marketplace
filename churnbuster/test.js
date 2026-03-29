/**
 * ChurnBuster - Simple Test Suite
 * 基础功能验证
 */

const path = require('path');
const fs = require('fs');
const assert = require('assert');

console.log('🧪 Running ChurnBuster tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name}: ${err.message}`);
    failed++;
  }
}

// Test 1: All required files exist
test('All core files exist', () => {
  const requiredPaths = [
    'src/index.js',
    'src/detector.js',
    'src/guide-generator.js',
    'src/reporter.js',
    'src/config.js',
    'data/services.json',
    'data/cancellation-guides.json',
    'templates/report.html',
    'package.json',
    'README.md'
  ];

  for (const p of requiredPaths) {
    const fullPath = path.join(__dirname, p);
    assert(fs.existsSync(fullPath), `Missing file: ${p}`);
  }
});

// Test 2: services.json is valid JSON
test('services.json is valid JSON', () => {
  const servicesPath = path.join(__dirname, 'data', 'services.json');
  const content = fs.readFileSync(servicesPath, 'utf8');
  const parsed = JSON.parse(content);
  assert(Array.isArray(parsed.services), 'services should be an array');
  assert(parsed.services.length > 0, 'services array is empty');
});

// Test 3: cancellation-guides.json is valid JSON
test('cancellation-guides.json is valid JSON', () => {
  const guidesPath = path.join(__dirname, 'data', 'cancellation-guides.json');
  if (!fs.existsSync(guidesPath)) {
    console.log('⚠️  Guide file not yet created, skipping validation');
    return;
  }
  const content = fs.readFileSync(guidesPath, 'utf8');
  const parsed = JSON.parse(content);
  assert(parsed.guides, 'guides object missing');
});

// Test 4: package.json has required fields
test('package.json has required fields', () => {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert(pkg.name === 'churnbuster', 'name mismatch');
  assert(pkg.version, 'version missing');
  assert(pkg.main, 'main entry missing');
  assert(pkg.dependencies && pkg.dependencies.commander, 'commander dependency missing');
  assert(pkg.dependencies && pkg.dependencies.ejs, 'ejs dependency missing');
});

// Test 5: index.js file exists and has content
test('index.js exists and has content', () => {
  const indexPath = path.join(__dirname, 'src', 'index.js');
  const content = fs.readFileSync(indexPath, 'utf8');
  assert(content.length > 1000, 'index.js seems too small');
  assert(content.includes('commander'), 'missing commander import');
  assert(content.includes('main'), 'missing main function');
});

// Test 6: reporter template exists and is valid HTML
test('report.html template exists and contains required sections', () => {
  const tplPath = path.join(__dirname, 'templates', 'report.html');
  const content = fs.readFileSync(tplPath, 'utf8');

  assert(content.includes('<!DOCTYPE html>'), 'Missing DOCTYPE');
  assert(content.includes('<html'), 'Missing html tag');
  assert(content.includes('subscriptions'), 'Missing subscriptions reference');
  assert(content.includes('guide'), 'Missing guide reference');
});

// Test 7: ConfigManager can be instantiated
test('ConfigManager imports correctly', () => {
  const ConfigManager = require('./src/config');
  const instance = new ConfigManager();
  assert(instance.store, 'store not created');
});

// Test 8: Detector can be instantiated
test('Detector imports correctly', () => {
  const Detector = require('./src/detector');
  const instance = new Detector({ dryRun: true, verbose: false });
  assert(instance.options.dryRun === true, 'dryRun not set');
  assert(typeof instance.scan === 'function', 'scan method missing');
});

// Test 9: GuideGenerator can be instantiated
test('GuideGenerator imports correctly', () => {
  const GuideGenerator = require('./src/guide-generator');
  const instance = new GuideGenerator();
  assert(typeof instance.generateGuide === 'function', 'generateGuide method missing');
  assert(typeof instance.generateAll === 'function', 'generateAll method missing');
});

// Test 10: Reporter can be instantiated and generates output
test('Reporter generates HTML file', () => {
  const Reporter = require('./src/reporter');
  const instance = new Reporter();

  const mockSubscriptions = [{
    id: 'test-1',
    service_id: 'github',
    name: 'GitHub',
    confidence: 90,
    source_type: 'test',
    detected_at: new Date().toISOString()
  }];

  const mockReports = [{
    subscription: mockSubscriptions[0],
    service: { name: 'GitHub', id: 'github' },
    guide: {
      steps: [{ title: 'Step 1', description: 'Do something', url: 'https://github.com' }],
      contact_info: { email: 'support@github.com' },
      general_tips: ['Tip 1']
    }
  }];

  const outputPath = instance.generate(mockSubscriptions, mockReports);
  assert(fs.existsSync(outputPath), 'Output file not created');
  assert(outputPath.endsWith('.html'), 'Output is not HTML');

  // Cleanup
  fs.unlinkSync(outputPath);
});

// Summary
console.log('\n' + '─'.repeat(40));
console.log(`📊 Tests: ${passed} passed, ${failed} failed`);
console.log('─'.repeat(40));

process.exit(failed > 0 ? 1 : 0);
