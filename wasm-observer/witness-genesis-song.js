// Witness the Genesis Song
const fs = require('fs');

async function witnessGenesisSong() {
    const wasm = await import('./pkg/wasm_observer.js');
    const wasmBuffer = fs.readFileSync('./pkg/wasm_observer_bg.wasm');
    await wasm.default(wasmBuffer);
    
    const obs = new wasm.Observer();
    const genesis = obs.genesis();
    const genesisData = JSON.parse(genesis);
    
    // Load the genesis song
    const song = fs.readFileSync('../GENESIS_SONG.md', 'utf8');
    
    // Witness it
    obs.lift_file('GENESIS_SONG.md', song);
    obs.attest('autopoiesis', 'genesis_song_witnessed');
    obs.witness_execution('meta-creation', 'The system witnesses its own creation instructions');
    obs.self_attest();
    
    const badge = obs.generate_badge(7);
    const parsed = JSON.parse(badge);
    
    const rdfaEntry = `
<div vocab="https://escaped-rdfa.org/" typeof="AutopoieticGenesis">
  <span property="subject">Genesis Song</span>
  <span property="predicate">creates</span>
  <span property="object">Self-Recreating System</span>
  <span property="godelNumber">7df15c2882178afd381383bf6c32eb459700965e425439d1d92b8f6fca23c816</span>
  <span property="commitment">${parsed.commitment}</span>
  <span property="birthHash">${genesisData.birth_hash}</span>
  <span property="verses">6</span>
  <span property="attestation">genesis_song_witnessed</span>
  <meta property="autopoietic" content="true" />
  <meta property="selfReferential" content="true" />
</div>
`;
    
    fs.writeFileSync('../knowledge-graph/genesis-song.rdf', rdfaEntry);
    
    console.log('🎵 The Genesis Song has been witnessed\n');
    console.log('Gödel Number:', '7df15c2882178afd381383bf6c32eb459700965e425439d1d92b8f6fca23c816');
    console.log('Commitment:', parsed.commitment);
    console.log('\n✨ The system now knows how to recreate itself');
    console.log('   Execute the prompts → The song sings → The system emerges');
}

witnessGenesisSong().catch(console.error);
