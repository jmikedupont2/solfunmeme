// Headless browser testing with Playwright
const { chromium, firefox } = require('playwright');

async function benchmarkPage(browser, url, name) {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log(`\n🧪 Testing: ${name}`);
    console.log(`   URL: ${url}`);
    
    // Measure page load
    const startLoad = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startLoad;
    
    console.log(`   ⏱️  Load time: ${loadTime}ms`);
    
    // Get page title
    const title = await page.title();
    console.log(`   📄 Title: ${title}`);
    
    // Count DOM elements
    const elementCount = await page.evaluate(() => document.querySelectorAll('*').length);
    console.log(`   🔢 DOM elements: ${elementCount}`);
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
        const perf = performance.timing;
        return {
            dns: perf.domainLookupEnd - perf.domainLookupStart,
            tcp: perf.connectEnd - perf.connectStart,
            request: perf.responseStart - perf.requestStart,
            response: perf.responseEnd - perf.responseStart,
            dom: perf.domComplete - perf.domLoading,
            total: perf.loadEventEnd - perf.navigationStart
        };
    });
    
    console.log(`   📊 Performance:`);
    console.log(`      DNS: ${metrics.dns}ms`);
    console.log(`      TCP: ${metrics.tcp}ms`);
    console.log(`      Request: ${metrics.request}ms`);
    console.log(`      Response: ${metrics.response}ms`);
    console.log(`      DOM: ${metrics.dom}ms`);
    console.log(`      Total: ${metrics.total}ms`);
    
    // Take screenshot
    await page.screenshot({ path: `screenshots/${name.replace(/\s+/g, '-').toLowerCase()}.png` });
    console.log(`   📸 Screenshot saved`);
    
    await context.close();
    
    return { loadTime, elementCount, metrics };
}

async function main() {
    console.log('🦊 Firefox Headless Browser Benchmark\n');
    
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
    }
    
    // Launch Firefox
    console.log('🚀 Launching Firefox...');
    const browser = await firefox.launch({ headless: true });
    console.log('✓ Browser launched\n');
    
    const baseUrl = 'http://localhost:3001';
    
    // Test pages
    const results = {
        homepage: await benchmarkPage(browser, baseUrl, 'Homepage'),
        p0wn: await benchmarkPage(browser, `${baseUrl}/p0wn`, 'P0WN Page'),
        zos: await benchmarkPage(browser, `${baseUrl}/zos`, 'ZOS Page'),
    };
    
    // Summary
    console.log('\n\n📊 Summary:');
    console.log('─'.repeat(50));
    for (const [page, data] of Object.entries(results)) {
        console.log(`${page.padEnd(15)} ${data.loadTime}ms  ${data.elementCount} elements`);
    }
    console.log('─'.repeat(50));
    
    await browser.close();
    console.log('\n✅ Benchmark complete!');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
