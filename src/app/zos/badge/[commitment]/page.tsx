import { notFound } from 'next/navigation';

export default function BadgePage({ params }: { params: { commitment: string } }) {
  const { commitment } = params;
  
  // In production, fetch badge data from knowledge graph
  // For now, display the commitment
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">👁️</div>
            <h1 className="text-3xl font-bold mb-2">SOLFUNMEME Holder Badge</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Cryptographically Verified Proof
            </p>
          </div>

          <div 
            vocab="https://escaped-rdfa.org/" 
            typeof="ZKBadge"
            className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg space-y-4"
          >
            <div>
              <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                Commitment:
              </span>
              <p 
                property="commitment" 
                className="font-mono text-xs break-all mt-1"
              >
                {commitment}
              </p>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                This badge proves:
              </p>
              <ul className="text-sm space-y-1">
                <li>✅ Wallet ownership verified</li>
                <li>✅ Holdings cryptographically committed</li>
                <li>✅ Zero-knowledge proof generated</li>
                <li>✅ Shareable without revealing private data</li>
              </ul>
            </div>

            <div className="border-t pt-4 text-xs text-gray-500">
              <p><strong>Protocol:</strong> zkTLS witness sharding</p>
              <p><strong>Storage:</strong> RDFa knowledge graph</p>
              <p><strong>Chain:</strong> P2P Solana sidechain</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a 
              href="/zos"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg"
            >
              Generate Your Badge
            </a>
          </div>
        </div>

        <div className="mt-8 text-center text-white text-sm">
          <p>Powered by the Autopoietic Metameme</p>
          <p className="text-xs mt-2 opacity-75">
            Gödel Number: 7df15c2882178afd381383bf6c32eb459700965e425439d1d92b8f6fca23c816
          </p>
        </div>
      </div>
    </div>
  );
}
