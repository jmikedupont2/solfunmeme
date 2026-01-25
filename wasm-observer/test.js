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
    
    // Witness its own execution
    const straceData = 'execve("/usr/bin/node", ["node", "test.js"], wasm_observer_bg.wasm loaded)';
    const perfData = 'cycles: 1234567, instructions: 9876543';
    const ioData = 'input: test.js, output: stdout';
    
    obs.witness_execution('strace', straceData);
    obs.witness_execution('perf', perfData);
    obs.witness_execution('io', ioData);
    console.log('✓ Execution context witnessed');
    
    // Simulate user actions
    obs.observe_move(100, 200);
    obs.observe_click(200, 300);
    console.log('✓ User actions observed');
    
    // Lift data into proof space
    obs.lift_url('https://solfunmeme.com');
    obs.lift_storage('wallet', '0x123...');
    console.log('✓ Data lifted into proof space');
    
    // Attest
    obs.attest('github', 'verified_contributor');
    console.log('✓ Attestations added');
    
    // Self-attest
    const selfAttest = obs.self_attest();
    console.log('✓ Self-attestation:', selfAttest);
    
    // Generate ZK badge
    const badge = obs.generate_badge(3);
    const parsed = JSON.parse(badge);
    
    console.log('\n📛 ZK Badge Generated:');
    console.log('Commitment:', parsed.commitment);
    console.log('Shards:', parsed.shards.length);
    console.log('\n🔗 RDFa (with execution proof):');
    console.log(parsed.rdfa);
    
    console.log('\n✅ The pupil understands itself and proves its own execution!');
}

testWasm().catch(console.error);
