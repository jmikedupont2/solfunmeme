#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

async function testP0wnWithWallet() {
  console.log('🚀 Starting P0WN test with mock Solana wallet...\n');
  
  // Generate a test keypair
  const keypair = Keypair.generate();
  const publicKey = keypair.publicKey.toBase58();
  const secretKey = Buffer.from(keypair.secretKey).toString('base64');
  
  console.log('🔑 Generated test wallet:');
  console.log(`   Public: ${publicKey}`);
  console.log(`   Secret: ${secretKey.substring(0, 20)}...\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/nix/store/2f63p6zalawj13narwk031894fg5i6v7-chromium-144.0.7559.59/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Inject mock Solana wallet before page loads
  await page.evaluateOnNewDocument((pubKey, privKeyB64, keypairBytes) => {
    const secretKeyArray = Uint8Array.from(atob(privKeyB64), c => c.charCodeAt(0));
    
    // Create proper PublicKey mock
    class MockPublicKey {
      constructor(value) {
        this._bn = value;
      }
      toBase58() { return pubKey; }
      toBuffer() { return new Uint8Array(32); }
      toBytes() { return new Uint8Array(32); }
      toString() { return pubKey; }
    }
    
    // Mock Phantom wallet with proper adapter interface
    window.solana = {
      isPhantom: true,
      publicKey: new MockPublicKey(pubKey),
      isConnected: false,
      connect: async () => {
        console.log('Mock wallet connecting...');
        window.solana.isConnected = true;
        window.solana.publicKey = new MockPublicKey(pubKey);
        return { publicKey: window.solana.publicKey };
      },
      disconnect: async () => {
        console.log('Mock wallet disconnected');
        window.solana.isConnected = false;
      },
      signMessage: async (message) => {
        console.log('Mock signing message, length:', message.length);
        // Return valid signature (64 bytes)
        const sig = new Uint8Array(64);
        for (let i = 0; i < 64; i++) sig[i] = i;
        return sig;
      },
      signTransaction: async (tx) => {
        console.log('Mock signing transaction');
        return tx;
      },
      signAllTransactions: async (txs) => {
        console.log('Mock signing all transactions');
        return txs;
      },
      on: (event, callback) => {
        console.log('Mock wallet event listener:', event);
        if (event === 'connect') {
          setTimeout(() => callback(new MockPublicKey(pubKey)), 100);
        }
      },
      off: (event, callback) => {},
      request: async (args) => {
        console.log('Mock wallet request:', args.method);
        if (args.method === 'connect') {
          window.solana.isConnected = true;
          return { publicKey: pubKey };
        }
        return {};
      }
    };
    
    window.phantom = { solana: window.solana };
    console.log('Mock Phantom wallet injected, publicKey:', pubKey);
  }, publicKey, secretKey, Array.from(keypair.secretKey));
  
  // Capture console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log(`🔴 BROWSER ERROR: ${text}`);
    } else if (type === 'log' && text.includes('Mock')) {
      console.log(`📝 ${text}`);
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
    
    await new Promise(r => setTimeout(r, 3000));
    console.log('✅ Page loaded\n');
    
    // Find and click wallet button
    console.log('🔘 Looking for wallet button...');
    await new Promise(r => setTimeout(r, 1000));
    
    const walletButton = await page.$$('button');
    if (walletButton.length > 0) {
      const buttonText = await page.evaluate(el => el.textContent, walletButton[0]);
      console.log(`   Found: "${buttonText}"`);
      
      console.log('👆 Clicking wallet button...');
      await walletButton[0].click();
      await new Promise(r => setTimeout(r, 2000));
      
      // Look for Phantom option in modal
      const phantomOption = await page.$('button[data-testid="wallet-adapter-phantom"]');
      if (phantomOption) {
        console.log('   Selecting Phantom wallet...');
        await phantomOption.click();
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    
    // Check if wallet connected
    const walletInfo = await page.evaluate(() => {
      const walletDiv = document.querySelector('[class*="Connected"]');
      return walletDiv ? walletDiv.textContent : null;
    });
    
    if (walletInfo) {
      console.log(`✅ Wallet connected: ${walletInfo}\n`);
    }
    
    // Find and click "Sign & Prove" button
    console.log('🔘 Looking for Sign & Prove button...');
    const signButton = await page.$('button:not([class*="wallet"])');
    if (signButton) {
      const buttonText = await page.evaluate(el => el.textContent, signButton);
      console.log(`   Found: "${buttonText}"`);
      
      console.log('👆 Clicking Sign & Prove...');
      await signButton.click();
      await new Promise(r => setTimeout(r, 3000));
    }
    
    // Check for success message
    const status = await page.evaluate(() => {
      const statusEl = document.querySelector('p[class*="text-sm"]');
      return statusEl ? statusEl.textContent : null;
    });
    
    if (status) {
      console.log(`\n📊 Status: ${status}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/p0wn-wallet-test.png', fullPage: true });
    console.log('\n📸 Screenshot saved to /tmp/p0wn-wallet-test.png');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testP0wnWithWallet().catch(console.error);
