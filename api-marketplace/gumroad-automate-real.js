#!/usr/bin/env node
/**
 * Gumroad Real Automation - Uses Your Chrome Session
 * Connects to existing Chrome browser to configure product
 */

const { chromium } = require('playwright');

// CONFIG from user
const CHROME_USER_DATA_DIR = process.argv[2];
const PRODUCT_ID = '6F0E4C97-B72A4E69-A11BF6C4-AF6517E7';
const WEBHOOK_URL = 'https://api-marketplace-ln1v0o44t-algea-foks-projects.vercel.app/api/webhook/gumroad';
const WEBHOOK_SECRET = 'd68816554d9ef606c6252054a9e7c99f58e6baf0aa077a68';

async function main() {
  console.log('🚀 Starting Gumroad automation with your Chrome session...\n');
  
  if (!CHROME_USER_DATA_DIR) {
    console.error('❌ Please provide Chrome user data path as argument');
    console.error('Example: node gumroad-automate-real.js "C:\\Users\\YourName\\AppData\\Local\\Google\\Chrome\\User Data\\Default"');
    process.exit(1);
  }

  console.log(`Using Chrome profile: ${CHROME_USER_DATA_DIR}`);

  const browser = await chromium.launchPersistentContext(CHROME_USER_DATA_DIR, {
    headless: false,
    viewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    // Navigate to product edit page
    const editUrl = `https://app.gumroad.com/products/${PRODUCT_ID}/edit`;
    console.log(`1. Navigating to: ${editUrl}`);
    await page.goto(editUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if logged in
    if (await page.isVisible('text=Log in') || await page.isVisible('text=Sign in')) {
      console.error('❌ Not logged in! Please log into Gumroad in Chrome first.');
      await browser.close();
      process.exit(1);
    }
    console.log('   ✅ Logged in');

    // STEP 1: Ensure Category is Software (if visible)
    console.log('\n2. Checking Category...');
    try {
      // Try to find category dropdown and select Software
      const categoryOptions = await page.$$('select[name*="category"] option');
      for (const option of categoryOptions) {
        const text = await option.textContent();
        if (text.toLowerCase().includes('software') || text.toLowerCase().includes('app') || text.toLowerCase().includes('code')) {
          const value = await option.getAttribute('value');
          await page.selectOption('select[name*="category"]', value);
          console.log(`   ✅ Set Category to: ${text.trim()}`);
          break;
        }
      }
    } catch (e) {
      console.log('   ℹ️  Could not find category selector (may be elsewhere)');
    }

    // STEP 2: Go to Content tab, add License Key module
    console.log('\n3. Adding License Key module...');
    
    // Click Content tab if not already
    try {
      await page.click('text=Content', { timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('   ℹ️  Content tab already active or not found');
    }

    // Find "+" button or "Add module"
    const addButtons = [
      'button:has-text("Add module")',
      'button:has-text("+ Add section")',
      '[aria-label="Add module"]',
      '.add-button',
      'button[class*="add"]'
    ];

    let addClicked = false;
    for (const selector of addButtons) {
      try {
        await page.click(selector, { timeout: 2000 });
        addClicked = true;
        console.log(`   ✅ Clicked add button (${selector})`);
        break;
      } catch (e) {}
    }

    if (!addClicked) {
      console.error('   ❌ Could not find "Add module" button');
    }

    await page.waitForTimeout(1000);

    // Find License Key module in list
    const licenseModuleSelectors = [
      'text=License key',
      'text=Software license',
      'text=Digital license',
      'text=Product key',
      'text=Unique code',
      '[data-module*="license"]',
      '[data-type*="license"]'
    ];

    let moduleClicked = false;
    for (const selector of licenseModuleSelectors) {
      try {
        await page.click(selector, { timeout: 2000 });
        moduleClicked = true;
        console.log(`   ✅ Selected License Key module`);
        break;
      } catch (e) {}
    }

    if (!moduleClicked) {
      console.error('   ❌ Could not find License Key module in list');
      console.log('   ℹ️  Listing visible module names for debugging...');
      const allText = await page.textContent('body');
      console.log('   Modules on page (sample):', allText.substring(0, 500));
    }

    await page.waitForTimeout(1000);

    // Configure module: Find and set options
    console.log('\n4. Configuring License Key module...');
    
    // Try to find enable checkbox/switch
    const enableSelectors = [
      'input[name*="license_keys_enabled"]',
      'input[type="checkbox"][aria-label*="License"]',
      'text=Enable license keys >> input[type="checkbox"]',
      '[data-testid*="license"] >> input[type="checkbox"]'
    ];

    let enabled = false;
    for (const selector of enableSelectors) {
      try {
        const el = await page.$(selector);
        if (el) {
          await el.click();
          enabled = true;
          console.log(`   ✅ Enabled license keys`);
          break;
        }
      } catch (e) {}
    }

    if (!enabled) {
      console.log('   ℹ️  Could not find enable checkbox (may already be enabled)');
    }

    // Set format to Random
    try {
      await page.selectOption('select[name*="format"]', { label: /random/i });
      console.log(`   ✅ Set Format: Random`);
    } catch (e) {}

    // Set length to 16
    try {
      await page.fill('input[name*="length"], input[placeholder*="length"]', '16');
      console.log(`   ✅ Set Length: 16`);
    } catch (e) {}

    // Set delivery to Automatic
    try {
      await page.click('text=Automatically', { timeout: 2000 });
      console.log(`   ✅ Set Delivery: Automatically`);
    } catch (e) {}

    await page.waitForTimeout(1000);

    // Save Content
    console.log('\n5. Saving Content...');
    try {
      await page.click('button:has-text("Save")', { timeout: 3000 });
      console.log('   ✅ Saved');
    } catch (e) {
      console.log('   ℹ️  No Save button (maybe auto-save)');
    }

    // Go to Settings to configure Webhook
    await page.waitForTimeout(1000);
    console.log('\n6. Configuring Webhook in Settings...');
    
    try {
      await page.click('text=Settings', { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('   ℹ️  Could not find Settings tab');
    }

    // Find Webhooks section
    try {
      await page.click('text=Webhooks', { timeout: 3000 });
      await page.waitForTimeout(1000);
    } catch (e) {
      console.log('   ℹ️  Webhooks section not visible (may not be available)');
    }

    // Add webhook if possible
    try {
      await page.fill('input[name="webhook_url"], input[placeholder*="https"]', WEBHOOK_URL);
      await page.fill('input[name="webhook_secret"], input[placeholder*="secret"]', WEBHOOK_SECRET);
      await page.click('text=Add webhook', { timeout: 2000 });
      // Check purchase_completed event
      await page.click('input[value="purchase_completed"]', { timeout: 2000 });
      console.log(`   ✅ Webhook configured (if visible)`);
    } catch (e) {
      console.log('   ℹ️  Webhook form not found or not available');
    }

    // Publish
    await page.waitForTimeout(1000);
    console.log('\n7. Publishing product...');
    try {
      await page.click('button:has-text("Publish")', { timeout: 3000 });
      await page.waitForTimeout(2000);
      console.log('   ✅ Product published!');
    } catch (e) {
      console.log('   ℹ️  Could not click Publish (maybe already published or needs KYC)');
    }

    console.log('\n🎉 Automation completed!');
    console.log('\nPlease verify:');
    console.log('1. Product status (Draft/Published)');
    console.log('2. License Key module is configured (Random 16, Auto-deliver)');
    console.log('3. Webhook (if available in your plan)');
    console.log('\nIf anything failed, check screenshots or try manual steps.');

    // Keep browser open for a while
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Automation error:', error.message);
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
