#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testP0wn() {
  console.log('🚀 Starting headless browser test for P0WN page...\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/nix/store/2f63p6zalawj13narwk031894fg5i6v7-chromium-144.0.7559.59/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`🔴 BROWSER ERROR: ${text}`);
    } else if (type === 'warning') {
      console.log(`⚠️  BROWSER WARN: ${text}`);
    }
  });
  
  // Capture page errors
  page.on('pageerror', error => {
    console.log(`🔴 PAGE ERROR: ${error.message}`);
  });
  
  try {
    console.log('📍 Navigating to http://localhost:3001/p0wn');
    await page.goto('http://localhost:3001/p0wn', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log('✅ Page loaded\n');
    
    // Check for wallet button
    const walletButton = await page.$('button');
    if (walletButton) {
      const buttonText = await page.evaluate(el => el.textContent, walletButton);
      console.log(`🔘 Found wallet button: "${buttonText}"`);
    }
    
    // Check for phantom references
    const content = await page.content();
    const hasPhantom = content.toLowerCase().includes('phantom');
    console.log(`🔍 Contains "phantom": ${hasPhantom}`);
    
    if (hasPhantom) {
      // Find where phantom is mentioned
      const matches = content.match(/phantom/gi);
      console.log(`   Found ${matches?.length || 0} occurrences`);
    }
    
    // Check wallet adapter state
    const walletState = await page.evaluate(() => {
      return {
        hasWindow: typeof window !== 'undefined',
        hasSolana: typeof window.solana !== 'undefined',
        hasPhantom: typeof window.phantom !== 'undefined'
      };
    });
    
    console.log('\n💼 Wallet state:');
    console.log(`   window.solana: ${walletState.hasSolana}`);
    console.log(`   window.phantom: ${walletState.hasPhantom}`);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/p0wn-test.png' });
    console.log('\n📸 Screenshot saved to /tmp/p0wn-test.png');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  } finally {
    await browser.close();
  }
}

testP0wn().catch(console.error);
