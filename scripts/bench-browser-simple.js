// Simple headless browser test using native fetch and JSDOM
const https = require('https');

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname,
            method: 'GET'
        };
        
        const req = (urlObj.protocol === 'https:' ? https : require('http')).request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
        });
        
        req.on('error', reject);
        req.end();
    });
}

async function benchmarkPage(url, name) {
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    const start = Date.now();
    const result = await fetchPage(url);
    const loadTime = Date.now() - start;
    
    console.log(`   ⏱️  Load time: ${loadTime}ms`);
    console.log(`   📊 Status: ${result.status}`);
    console.log(`   📦 Size: ${result.data.length} bytes`);
    console.log(`   📄 Content-Type: ${result.headers['content-type']}`);
    
    // Check for key content
    const checks = {
        'Has DOCTYPE': result.data.includes('<!DOCTYPE'),
        'Has HTML': result.data.includes('<html'),
        'Has Body': result.data.includes('<body'),
        'Has Scripts': result.data.includes('<script'),
    };
    
    console.log(`   ✓ Checks:`);
    for (const [check, passed] of Object.entries(checks)) {
        console.log(`      ${passed ? '✓' : '✗'} ${check}`);
    }
    
    return { loadTime, status: result.status, size: result.data.length };
}

async function main() {
    console.log('🚀 Simple Browser Benchmark (No Headless Browser)\n');
    
    const baseUrl = 'http://localhost:3001';
    
    const results = {
        homepage: await benchmarkPage(baseUrl, 'Homepage'),
        p0wn: await benchmarkPage(`${baseUrl}/p0wn`, 'P0WN Page'),
        zos: await benchmarkPage(`${baseUrl}/zos`, 'ZOS Page'),
        api: await benchmarkPage(`${baseUrl}/api/p0wn`, 'API Endpoint'),
    };
    
    console.log('\n\n📊 Summary:');
    console.log('─'.repeat(60));
    console.log('Page'.padEnd(20) + 'Load Time'.padEnd(15) + 'Status'.padEnd(10) + 'Size');
    console.log('─'.repeat(60));
    for (const [page, data] of Object.entries(results)) {
        console.log(
            page.padEnd(20) + 
            `${data.loadTime}ms`.padEnd(15) + 
            data.status.toString().padEnd(10) + 
            `${(data.size / 1024).toFixed(2)} KB`
        );
    }
    console.log('─'.repeat(60));
    console.log('\n✅ Benchmark complete!');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
