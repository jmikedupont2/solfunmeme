// Test P2P Solana KB Chain
const fs = require('fs');

async function testKBChain() {
    console.log('🔗 Testing Solana KB Chain with HME Shards...\n');
    
    const wasm = require('./pkg/solana_kb_chain.js');
    
    const chain = new wasm.SolanaKBChain();
    
    // Create wallet
    const pubkey = chain.create_wallet('genesis-seed-' + Date.now());
    console.log('✓ Wallet created');
    console.log('  Public Key:', pubkey.substring(0, 32) + '...');
    
    // Add KB shards (from knowledge graph)
    const genesisRDF = fs.readFileSync('../knowledge-graph/genesis-1769360974471.rdf', 'utf8');
    chain.add_kb_shard(
        'genesis-1769360974471.rdf',
        genesisRDF
    );
    console.log('✓ KB shard added from knowledge graph');
    
    // Create transaction validated by KB proof
    const tx = chain.create_transaction(
        'recipient-pubkey-xyz',
        BigInt(1000),
        'genesis-1769360974471.rdf'
    );
    console.log('✓ Transaction created');
    console.log('  TX:', JSON.parse(tx));
    
    // Validate transaction against KB
    const valid = chain.validate_transaction(tx);
    console.log('✓ Transaction validated:', valid);
    
    // Show shards
    const shards = JSON.parse(chain.get_shards());
    console.log('\n📦 HME Shards (replacing RocksDB):');
    console.log('  Count:', shards.length);
    console.log('  Commitment:', shards[0].commitment);
    
    console.log('\n✅ P2P Solana KB Chain operational!');
    console.log('   Storage: HME-encrypted RDFa shards');
    console.log('   Validation: Knowledge graph proofs');
}

testKBChain().catch(console.error);
