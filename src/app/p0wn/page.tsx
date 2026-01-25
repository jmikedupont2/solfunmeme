'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { WalletContextProvider } from '@/components/WalletProvider';
import bs58 from 'bs58';

function P0wnContent() {
  const { publicKey, signMessage } = useWallet();
  const [status, setStatus] = useState('');
  const [badge, setBadge] = useState<any>(null);

  const proveOwnership = async () => {
    if (!publicKey || !signMessage) {
      setStatus('❌ Connect wallet first');
      return;
    }

    try {
      setStatus('📝 Sign message to prove ownership...');
      
      // Create ownership message
      const message = `SOLFUNMEME P0WN\nWallet: ${publicKey.toBase58()}\nTimestamp: ${Date.now()}\nRole: Developer`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Sign message
      const signature = await signMessage(encodedMessage);
      const signatureBase58 = bs58.encode(signature);
      
      setStatus('🔐 Signature created, storing proof...');
      
      // Store in Supabase
      const response = await fetch('/api/p0wn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          message,
          signature: signatureBase58,
          role: 'developer',
          timestamp: Date.now()
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('✅ Ownership proven!');
        setBadge(data.badge);
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">🔐 P0WN - Prove Ownership</h1>
        <p className="text-gray-400 mb-8">
          Sign a message with your developer wallet to prove ownership and receive a badge.
        </p>

        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
          <WalletMultiButton />
          
          {publicKey && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">Connected:</p>
              <p className="font-mono text-sm">{publicKey.toBase58()}</p>
            </div>
          )}
        </div>

        {publicKey && (
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Prove Ownership</h2>
            <button
              onClick={proveOwnership}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold"
            >
              Sign & Prove
            </button>
            
            {status && (
              <p className="mt-4 text-sm">{status}</p>
            )}
          </div>
        )}

        {badge && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">✅ Developer Badge</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-400">Badge ID:</span> {badge.id}</p>
              <p><span className="text-gray-400">Wallet:</span> <span className="font-mono">{badge.wallet}</span></p>
              <p><span className="text-gray-400">Role:</span> {badge.role}</p>
              <p><span className="text-gray-400">Commitment:</span> <span className="font-mono">{badge.commitment}</span></p>
              <p><span className="text-gray-400">Verified:</span> {new Date(badge.timestamp).toLocaleString()}</p>
            </div>
            
            <a
              href={`/zos/badge/${badge.commitment}`}
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              View Badge
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function P0wnPage() {
  return (
    <WalletContextProvider>
      <P0wnContent />
    </WalletContextProvider>
  );
}
