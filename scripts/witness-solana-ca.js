// Fetch and witness Solana CA data
const fs = require('fs');
const https = require('https');

const SOLANA_CA = 'BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump';
const HELIUS_RPC = 'https://api.mainnet-beta.solana.com';

async function fetchTokenData() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenSupply',
            params: [SOLANA_CA]
        });

        const options = {
            hostname: 'api.mainnet-beta.solana.com',
            port: 443,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function fetchTopHolders() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getTokenLargestAccounts',
            params: [SOLANA_CA]
        });

        const options = {
            hostname: 'api.mainnet-beta.solana.com',
            port: 443,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve(JSON.parse(body)));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function witnessAndStore() {
    console.log('🔍 Fetching SOLFUNMEME token data...\n');
    console.log('CA:', SOLANA_CA);
    
    // Load WASM observer
    const wasm = await import('../wasm-observer/pkg/wasm_observer.js');
    const wasmBuffer = fs.readFileSync('../wasm-observer/pkg/wasm_observer_bg.wasm');
    await wasm.default(wasmBuffer);
    
    const obs = new wasm.Observer();
    const genesis = obs.genesis();
    const genesisData = JSON.parse(genesis);
    
    // Fetch token data
    const supplyData = await fetchTokenData();
    const holdersData = await fetchTopHolders();
    
    const supply = supplyData.result?.value?.uiAmount || 0;
    const holders = holdersData.result?.value?.length || 0;
    
    console.log('✓ Token Supply:', supply.toLocaleString());
    console.log('✓ Top Holders:', holders);
    
    // Witness the data
    obs.lift_url(`https://solscan.io/token/${SOLANA_CA}`);
    obs.lift_storage('token_ca', SOLANA_CA);
    obs.lift_storage('token_supply', supply.toString());
    obs.lift_storage('top_holders_count', holders.toString());
    obs.lift_storage('fetch_timestamp', Date.now().toString());
    
    obs.attest('solana', 'token_data_witnessed');
    obs.witness_execution('data-collection', 'Fetched and witnessed Solana CA data');
    obs.self_attest();
    
    // Generate ZK badge
    const badge = obs.generate_badge(5);
    const parsed = JSON.parse(badge);
    
    // Create RDFa entry
    const rdfaEntry = `
<div vocab="https://escaped-rdfa.org/" typeof="TokenDataWitness">
  <span property="tokenCA">${SOLANA_CA}</span>
  <span property="tokenSupply">${supply}</span>
  <span property="topHolders">${holders}</span>
  <span property="commitment">${parsed.commitment}</span>
  <span property="timestamp">${Date.now()}</span>
  <span property="attestation">token_data_witnessed</span>
  <meta property="verified" content="true" />
</div>
`;
    
    // Save to knowledge graph
    const filename = `../knowledge-graph/solana-ca-${Date.now()}.rdf`;
    fs.writeFileSync(filename, rdfaEntry);
    
    // Save to ZK store (JSON for now, will integrate with Supabase)
    const zkStore = {
        ca: SOLANA_CA,
        supply,
        holders,
        commitment: parsed.commitment,
        shards: parsed.shards,
        rdfa: rdfaEntry,
        timestamp: Date.now()
    };
    
    const zkFilename = `../knowledge-graph/zk-store-${Date.now()}.json`;
    fs.writeFileSync(zkFilename, JSON.stringify(zkStore, null, 2));
    
    console.log('\n✅ Data witnessed and stored');
    console.log('📍 RDFa:', filename);
    console.log('📍 ZK Store:', zkFilename);
    console.log('🔐 Commitment:', parsed.commitment);
    console.log('\n🔗 Badge URL:', `https://solfunmeme.com/zos/badge/${parsed.commitment}`);
}

witnessAndStore().catch(console.error);
