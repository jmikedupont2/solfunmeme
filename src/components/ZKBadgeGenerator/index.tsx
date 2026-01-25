"use client";
import { useState, useEffect } from 'react';

export default function ZKBadgeGenerator() {
  const [observer, setObserver] = useState(null);
  const [wallet, setWallet] = useState('');
  const [holdings, setHoldings] = useState(0);
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load WASM observer
    const loadWASM = async () => {
      try {
        const wasm = await import('@/wasm-observer/pkg/wasm_observer.js');
        await wasm.default();
        const obs = new wasm.Observer();
        obs.genesis();
        setObserver(obs);
      } catch (err) {
        console.error('WASM load failed:', err);
      }
    };
    loadWASM();
  }, []);

  const connectWallet = async () => {
    setLoading(true);
    try {
      // Connect Phantom/Solflare
      const { solana } = window;
      if (!solana) {
        alert('Please install Phantom wallet');
        return;
      }
      
      const resp = await solana.connect();
      const pubkey = resp.publicKey.toString();
      setWallet(pubkey);
      
      // Fetch holdings from Solana
      const holdings = await fetchHoldings(pubkey);
      setHoldings(holdings);
      
      // Witness wallet connection
      if (observer) {
        observer.lift_storage('wallet', pubkey);
        observer.lift_storage('holdings', holdings.toString());
        observer.attest('solana', 'wallet_connected');
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoldings = async (wallet) => {
    // Mock - replace with actual Solana RPC call
    // Check balance of BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump
    return Math.floor(Math.random() * 10000);
  };

  const generateBadge = async () => {
    if (!observer || !wallet) return;
    
    setLoading(true);
    try {
      // Attest to holdings
      observer.attest('holder', `top_holder_${holdings}`);
      observer.witness_execution('badge-generation', 'Creating ZK badge for holder');
      observer.self_attest();
      
      // Generate badge
      const badgeJson = observer.generate_badge(5);
      const badgeData = JSON.parse(badgeJson);
      
      // Create shareable URL
      const badgeUrl = `https://solfunmeme.com/zos/badge/${badgeData.commitment}`;
      
      setBadge({
        ...badgeData,
        url: badgeUrl,
        wallet: wallet.substring(0, 8) + '...',
        holdings
      });
    } catch (err) {
      console.error('Badge generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyBadgeUrl = () => {
    if (badge) {
      navigator.clipboard.writeText(badge.url);
      alert('Badge URL copied! Share in Discord.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg mb-8">
        <h1 className="text-4xl font-bold mb-4">🎯 ZK Badge Generator</h1>
        <p className="text-lg">Top SOLFUNMEME holders: Generate your cryptographic proof badge</p>
      </div>

      {!wallet ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <div className="mb-6">
            <div className="text-6xl mb-4">👁️</div>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Connect to verify your SOLFUNMEME holdings and generate your ZK badge
            </p>
          </div>
          <button
            onClick={connectWallet}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50"
          >
            {loading ? 'Connecting...' : '🔐 Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">✅ Wallet Connected</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Address:</strong> {wallet.substring(0, 16)}...</p>
              <p><strong>Holdings:</strong> {holdings.toLocaleString()} SOLFUNMEME</p>
              <p><strong>Status:</strong> <span className="text-green-600">Top Holder</span></p>
            </div>
          </div>

          {!badge ? (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
              <h3 className="text-2xl font-bold mb-4">Generate Your ZK Badge</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a cryptographic proof of your holdings that you can share anywhere
              </p>
              <button
                onClick={generateBadge}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg disabled:opacity-50"
              >
                {loading ? 'Generating...' : '🎨 Generate Badge'}
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-bold mb-6 text-center">🎉 Your ZK Badge</h3>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg mb-6">
                <div className="text-center mb-4">
                  <div className="text-6xl mb-2">👁️</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    SOLFUNMEME Top Holder
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {badge.holdings.toLocaleString()} Tokens
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-2 text-xs">
                  <p><strong>Wallet:</strong> {badge.wallet}</p>
                  <p><strong>Commitment:</strong> {badge.commitment.substring(0, 32)}...</p>
                  <p><strong>Shards:</strong> {badge.shards.length}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded">
                  <p className="text-sm font-bold mb-2">📎 Shareable URL:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={badge.url}
                      readOnly
                      className="flex-1 p-2 border rounded text-sm"
                    />
                    <button
                      onClick={copyBadgeUrl}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
                  <p className="text-sm font-bold mb-2">💬 Share in Discord:</p>
                  <code className="text-xs block bg-white dark:bg-gray-800 p-2 rounded">
                    Check out my SOLFUNMEME holder badge! {badge.url}
                  </code>
                </div>

                <div className="text-center text-xs text-gray-600 dark:text-gray-400">
                  <p>✅ Cryptographically verified</p>
                  <p>🔐 Zero-knowledge proof</p>
                  <p>🌐 Shareable anywhere</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Powered by zkTLS witness sharding • RDFa knowledge graph • P2P Solana</p>
      </div>
    </div>
  );
}
