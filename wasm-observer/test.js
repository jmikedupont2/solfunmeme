// Node.js test - simulating browser environment
const fs = require('fs');

async function testWasm() {
    console.log('🔬 Testing WASM Observer in simulated environment...\n');
    
    // Import and initialize
    const wasm = await import('./pkg/wasm_observer.js');
    const wasmBuffer = fs.readFileSync('./pkg/wasm_observer_bg.wasm');
    await wasm.default(wasmBuffer);
    
    // Create observer
    const obs = new wasm.Observer();
    console.log('✓ Observer created');
    
    // Simulate user actions
    obs.observe_move(100, 200);
    obs.observe_move(150, 250);
    obs.observe_click(200, 300);
    console.log('✓ User actions observed');
    
    // Lift data into proof space
    obs.lift_url('https://solfunmeme.com');
    obs.lift_storage('wallet', '0x123...');
    obs.lift_file('proof.txt', 'This is proof data');
    console.log('✓ Data lifted into proof space');
    
    // Attest
    obs.attest('github', 'verified_contributor');
    obs.attest('wallet', 'token_holder');
    console.log('✓ Attestations added');
    
    // Generate ZK badge
    const badge = obs.generate_badge(3);
    const parsed = JSON.parse(badge);
    
    console.log('\n📛 ZK Badge Generated:');
    console.log('Commitment:', parsed.commitment);
    console.log('Shards:', parsed.shards.length);
    console.log('\n🔗 RDFa URL-safe encoding:');
    console.log(parsed.rdfa);
    
    console.log('\n✅ Test complete - The pupil witnesses and certifies!');
}

testWasm().catch(console.error);
