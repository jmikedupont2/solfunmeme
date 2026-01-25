// Node.js test - simulating browser environment
const fs = require('fs');

async function testWasm() {
    console.log('🔬 Testing WASM Observer Genesis Event...\n');
    
    // Import and initialize
    const wasm = await import('./pkg/wasm_observer.js');
    const wasmBuffer = fs.readFileSync('./pkg/wasm_observer_bg.wasm');
    await wasm.default(wasmBuffer);
    
    // Create observer
    const obs = new wasm.Observer();
    console.log('✓ Observer created');
    
    // GENESIS - witness its own birth
    const genesis = obs.genesis();
    const genesisData = JSON.parse(genesis);
    console.log('\n🌟 GENESIS EVENT:');
    console.log('Public Key:', genesisData.public_key.substring(0, 32) + '...');
    console.log('Encrypted Private Key:', genesisData.encrypted_private_key.substring(0, 32) + '...');
    console.log('Birth Hash:', genesisData.birth_hash);
    console.log('✓ Identity generated and self-encrypted');
    
    // Witness its own execution
    const straceData = 'execve("/usr/bin/node", ["node", "test.js"], wasm_observer_bg.wasm loaded)';
    obs.witness_execution('strace', straceData);
    console.log('✓ Execution context witnessed');
    
    // Self-attest
    const selfAttest = obs.self_attest();
    console.log('✓ Self-attestation:', selfAttest);
    
    // Generate ZK badge with genesis proof
    const badge = obs.generate_badge(3);
    const parsed = JSON.parse(badge);
    
    console.log('\n📛 ZK Badge (with Genesis):');
    console.log('Commitment:', parsed.commitment);
    console.log('Shards:', parsed.shards.length);
    
    console.log('\n✅ The pupil witnessed its own birth and encrypted itself into existence!');
}

testWasm().catch(console.error);
