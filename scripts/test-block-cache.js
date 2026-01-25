// Demo: Block-cached API calls
const { BlockCache } = require('./block-cache.js');
const https = require('https');
const fs = require('fs');

const SOLANA_CA = 'BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump';

async function makeAPICall(url, method = 'POST', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: method,
            headers: data ? {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            } : {}
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function demo() {
    console.log('🔗 Block-Cached API Demo\n');
    
    // Load WASM observer
    const wasm = await import('../wasm-observer/pkg/wasm_observer.js');
    const wasmBuffer = fs.readFileSync('../wasm-observer/pkg/wasm_observer_bg.wasm');
    await wasm.default(wasmBuffer);
    
    const obs = new wasm.Observer();
    obs.genesis();
    
    // Create block cache
    const cache = new BlockCache(obs);
    
    // API Call 1: Get token supply
    console.log('📡 API Call 1: Token Supply');
    await cache.wrapAPICall(
        () => makeAPICall(
            'https://api.mainnet-beta.solana.com',
            'POST',
            JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTokenSupply',
                params: [SOLANA_CA]
            })
        ),
        {
            url: 'https://api.mainnet-beta.solana.com/getTokenSupply',
            method: 'POST',
            description: 'Fetch SOLFUNMEME token supply'
        }
    );
    
    // API Call 2: Get account info
    console.log('📡 API Call 2: Account Info');
    await cache.wrapAPICall(
        () => makeAPICall(
            'https://api.mainnet-beta.solana.com',
            'POST',
            JSON.stringify({
                jsonrpc: '2.0',
                id: 2,
                method: 'getAccountInfo',
                params: [SOLANA_CA, { encoding: 'jsonParsed' }]
            })
        ),
        {
            url: 'https://api.mainnet-beta.solana.com/getAccountInfo',
            method: 'POST',
            description: 'Fetch token account info'
        }
    );
    
    // Attest and finalize
    obs.attest('block-cache', 'api_calls_witnessed');
    obs.self_attest();
    
    // Share blocks
    await cache.shareAll();
    
    // Summary
    const summary = cache.getSummary();
    console.log('📊 Summary:');
    console.log(`  Total Blocks: ${summary.totalBlocks}`);
    console.log(`  Success: ${summary.successBlocks}`);
    console.log(`  Errors: ${summary.errorBlocks}`);
    console.log(`  Total Data: ${summary.totalSize} bytes`);
    console.log('\n🔐 Block Commitments:');
    summary.commitments.forEach((c, i) => {
        console.log(`  Block ${i + 1}: ${c.substring(0, 16)}...`);
    });
}

demo().catch(console.error);
