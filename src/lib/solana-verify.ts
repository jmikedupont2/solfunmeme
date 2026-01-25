// Minimal, auditable Solana wallet signature verification
// Uses ONLY standard browser APIs and official @solana/web3.js
// No custom crypto, no hidden code, fully transparent

import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

/**
 * Verify a Solana wallet signature
 * @param message - The message that was signed
 * @param signature - The signature bytes (Uint8Array)
 * @param publicKey - The wallet's public key (base58 string)
 * @returns boolean - true if signature is valid
 */
export function verifySignature(
  message: string,
  signature: Uint8Array,
  publicKey: string
): boolean {
  try {
    // Convert message to bytes using standard TextEncoder
    const messageBytes = new TextEncoder().encode(message);
    
    // Parse public key using official Solana library
    const pubKey = new PublicKey(publicKey);
    
    // Verify using TweetNaCl (industry standard, audited library)
    return nacl.sign.detached.verify(
      messageBytes,
      signature,
      pubKey.toBytes()
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

/**
 * Request signature from browser wallet (Phantom, Solflare, etc.)
 * Uses standard Solana wallet adapter protocol
 */
export async function requestSignature(message: string): Promise<{
  signature: Uint8Array;
  publicKey: string;
} | null> {
  // Check for Solana wallet in browser (standard injection)
  const solana = (window as any).solana;
  
  if (!solana?.isPhantom && !solana?.isSolflare) {
    throw new Error('No Solana wallet detected. Install Phantom or Solflare.');
  }
  
  // Connect wallet (standard method)
  await solana.connect();
  
  // Get public key
  const publicKey = solana.publicKey.toString();
  
  // Encode message
  const encodedMessage = new TextEncoder().encode(message);
  
  // Request signature (standard wallet API)
  const { signature } = await solana.signMessage(encodedMessage);
  
  return {
    signature,
    publicKey
  };
}
