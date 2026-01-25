# Testing Guide for Beginners

## 🎯 How We Test SOLFUNMEME

This guide shows you exactly how to test the system, even if you're new to development.

---

## 📋 Prerequisites

You need:
- **Nix** (for reproducible builds)
- **Git** (for version control)
- **A Solana wallet** (Phantom or Solflare browser extension)

---

## 🚀 Quick Start: Run the Dev Server

### 1. Start the Development Server

```bash
cd /path/to/solfunmeme
nix-shell -p nodejs pnpm --run "pnpm dev"
```

**What this does:**
- Loads Node.js and pnpm in a clean environment
- Starts Next.js dev server with hot reload
- Listens on `http://0.0.0.0:3001` (accessible from network)

### 2. Check If It's Running

```bash
curl http://localhost:3001
```

**Expected:** HTML response with page content

---

## 🔍 How to Debug Errors

### Method 1: Watch Logs in Real-Time

```bash
# Start server with logs
pnpm dev 2>&1 | tee /tmp/dev.log

# In another terminal, watch for errors
tail -f /tmp/dev.log | grep -E "(Error|Warning|✓)"
```

### Method 2: Check Specific Routes

```bash
# Test homepage
curl -s http://localhost:3001 | head -20

# Test P0WN page
curl -s http://localhost:3001/p0wn | grep "P0WN"

# Test API endpoint
curl -X POST http://localhost:3001/api/p0wn \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### Method 3: Check Build Errors

```bash
# Lint check (finds code issues)
nix-shell -p nodejs pnpm --run "pnpm lint"

# Build check (finds compilation errors)
nix-shell -p nodejs pnpm --run "pnpm build"
```

---

## 🧪 Testing Specific Features

### Test 1: Block Cache System

**What it does:** Wraps API calls, witnesses them, caches as blocks

```bash
cd scripts
node test-block-cache.js
```

**Expected output:**
```
🔗 Block-Cached API Demo
📡 API Call 1: Token Supply
  📦 Block cached: d27e6e1d...
📡 API Call 2: Account Info
  📦 Block cached: 88d98c64...
✅ Blocks shared across all P2P systems
```

**Check results:**
```bash
ls -la knowledge-graph/blocks/
cat knowledge-graph/blocks/manifest.json
```

### Test 2: Archive Uploader

**What it does:** Uploads blocks to Archive.org, writes to testnets

```bash
cd scripts
node upload-to-archive.js
```

**Expected output:**
```
🌐 SOLFUNMEME Archive & Testnet Uploader
📊 Found 2 blocks
📦 Archive.org: manifest.json
   Hash: d657f238b13490a6...
⛓️  Solana Devnet
   Tx: sol_devnet_d657f238b13490a6
⛓️  Ethereum Sepolia
   Tx: 0xeth_d657f238b13490a6
✅ Upload Complete!
```

### Test 3: WASM Observer

**What it does:** Self-witnessing pupil with genesis and attestation

```bash
cd wasm-observer
nix-shell -p rustc cargo wasm-pack lld --run "wasm-pack build --target web"
node test.js
```

**Expected output:**
```
🔬 Testing WASM Observer
Genesis event: {...}
Witnessed execution: {...}
Self-attestation: {...}
```

### Test 4: P0WN Wallet Signature

**What it does:** Prove ownership with wallet signature

**Manual test (requires browser):**

1. Open browser to `http://localhost:3001/p0wn`
2. Click "Connect Wallet"
3. Select Phantom or Solflare
4. Approve connection
5. Click "Sign & Prove"
6. Sign the message in wallet popup
7. See developer badge appear

**Check backend logs:**
```bash
tail -f /tmp/dev.log | grep -A 5 "POST /api/p0wn"
```

---

## 🐛 Common Errors and Fixes

### Error: "Module not found"

**Symptom:**
```
Module not found: Can't resolve '@solana/web3.js'
```

**Fix:**
```bash
nix-shell -p nodejs pnpm --run "pnpm install"
```

### Error: "WalletContext without providing one"

**Symptom:**
```
Error: You have tried to read "publicKey" on a WalletContext without providing one
```

**Fix:** Wrap component with `WalletContextProvider`

```tsx
import { WalletContextProvider } from '@/components/WalletProvider';

export default function Page() {
  return (
    <WalletContextProvider>
      <YourComponent />
    </WalletContextProvider>
  );
}
```

### Error: "Port 3000 is in use"

**Symptom:**
```
⚠ Port 3000 is in use, using port 3001 instead
```

**Fix:** Either:
- Use the new port (3001)
- Kill the process: `pkill -f "next dev"`

### Error: "supabaseKey is required"

**Symptom:**
```
Error: supabaseKey is required.
```

**Fix:** Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

---

## 📊 How We Found and Fixed the WalletProvider Bug

### Step 1: Observed the Error

```bash
tail -f /tmp/solfunmeme-dev.log
```

**Saw:**
```
Error: You have tried to read "publicKey" on a WalletContext without providing one.
Make sure to render a WalletProvider as an ancestor of the component that uses WalletContext.
```

### Step 2: Understood the Problem

- `useWallet()` hook requires a provider
- P0WN page was using `useWallet()` directly
- No `WalletProvider` wrapper existed

### Step 3: Created the Solution

**Created:** `src/components/WalletProvider/index.tsx`
```tsx
export function WalletContextProvider({ children }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### Step 4: Wrapped the Page

**Modified:** `src/app/p0wn/page.tsx`
```tsx
export default function P0wnPage() {
  return (
    <WalletContextProvider>
      <P0wnContent />
    </WalletContextProvider>
  );
}
```

### Step 5: Verified the Fix

```bash
# Check logs
tail -20 /tmp/solfunmeme-dev.log | grep -E "(Error|✓|GET)"

# Test the page
curl -s http://localhost:3001/p0wn | grep "P0WN"
```

**Result:** ✅ No more errors, page loads successfully

---

## 🎓 Testing Best Practices

### 1. Always Check Logs First

```bash
# Start with logging
pnpm dev 2>&1 | tee /tmp/dev.log

# Watch in real-time
tail -f /tmp/dev.log
```

### 2. Test Incrementally

- ✅ Lint → Build → Run → Test feature
- ❌ Don't skip steps

### 3. Use Curl for Quick Tests

```bash
# Homepage
curl -s http://localhost:3001 | head -10

# API endpoint
curl -X POST http://localhost:3001/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 4. Check File Changes

```bash
# What changed?
git status

# What's in the file?
cat src/app/p0wn/page.tsx

# What's the diff?
git diff src/app/p0wn/page.tsx
```

### 5. Commit Often

```bash
git add .
git commit -m "Fix: describe what you fixed"
git push origin your-branch
```

---

## 🌐 Network Testing

### Test from Another Device

1. **Find your IP:**
```bash
hostname -I | awk '{print $1}'
# Example: 192.168.68.62
```

2. **Access from phone/tablet:**
```
http://192.168.68.62:3001/p0wn
```

3. **Test wallet connection:**
- Install Phantom mobile app
- Open browser in app
- Navigate to your IP
- Connect wallet

---

## 📝 Writing Your Own Tests

### Template for Node.js Script Test

```javascript
// test-my-feature.js
async function test() {
  console.log('🧪 Testing My Feature\n');
  
  try {
    // Your test code here
    const result = await myFunction();
    
    console.log('✅ Test passed!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

test();
```

**Run it:**
```bash
node test-my-feature.js
```

### Template for Browser Test

```typescript
// src/app/test/page.tsx
'use client';

export default function TestPage() {
  const runTest = async () => {
    console.log('🧪 Running test...');
    
    try {
      const response = await fetch('/api/my-endpoint');
      const data = await response.json();
      console.log('✅ Success:', data);
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };
  
  return (
    <div className="p-8">
      <h1>Test Page</h1>
      <button onClick={runTest}>Run Test</button>
    </div>
  );
}
```

**Access:** `http://localhost:3001/test`

---

## 🎯 Quick Reference

### Start Dev Server
```bash
pnpm dev
```

### Check for Errors
```bash
tail -f /tmp/dev.log | grep Error
```

### Test a Route
```bash
curl http://localhost:3001/your-route
```

### Rebuild Everything
```bash
pnpm build
```

### Kill Dev Server
```bash
pkill -f "next dev"
```

### Check What's Running
```bash
ps aux | grep -E "next|pnpm" | grep -v grep
```

### Check Network Port
```bash
netstat -tlnp | grep 3001
```

---

## 🚨 When to Ask for Help

Ask if you see:
- ❌ Errors that persist after `pnpm install`
- ❌ Build fails with cryptic messages
- ❌ Server won't start
- ❌ Tests pass but feature doesn't work in browser

**Include in your question:**
1. What command you ran
2. Full error message
3. Last 20 lines of logs: `tail -20 /tmp/dev.log`
4. What you already tried

---

## 🎉 You're Ready!

You now know how to:
- ✅ Start the dev server
- ✅ Read and debug logs
- ✅ Test features incrementally
- ✅ Fix common errors
- ✅ Test from other devices
- ✅ Write your own tests

**Happy testing!** 🚀
