#!/usr/bin/env node

const { Keypair } = require('@solana/web3.js');
const nacl = require('tweetnacl');
const bs58 = require('bs58');

// Generate test wallet
const keypair = Keypair.generate();
const publicKey = keypair.publicKey.toBase58();

console.log('🔑 Test Wallet:', publicKey);

// Create message
const message = `SOLFUNMEME P0WN\nWallet: ${publicKey}\nTimestamp: ${Date.now()}\nRole: Developer`;
const encodedMessage = new TextEncoder().encode(message);

// Sign message
const signature = nacl.sign.detached(encodedMessage, keypair.secretKey);
const signatureBase58 = bs58.default.encode(signature);

console.log('\n📝 Message:', message);
console.log('\n✍️  Signature:', signatureBase58.substring(0, 40) + '...');

// Submit to API
async function submit() {
  try {
    const response = await fetch('http://localhost:3001/api/p0wn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet: publicKey,
        message,
        signature: signatureBase58,
        role: 'developer',
        timestamp: Date.now()
      })
    });
    
    const data = await response.json();
    console.log('\n📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Badge created:', data.badge.id);
      console.log('   Commitment:', data.badge.commitment);
    } else {
      console.log('\n❌ FAILED:', data.error);
    }
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
}

submit();
