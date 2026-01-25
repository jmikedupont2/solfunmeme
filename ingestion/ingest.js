// Contribution Ingestion Pipeline
const fs = require('fs');

class ContributionIngester {
    constructor() {
        this.queue = [];
        this.valuations = new Map();
    }

    // Ingest contribution
    async ingest(contribution) {
        const { type, source, author, content, timestamp } = contribution;
        
        // Create KB entry
        const kbEntry = {
            id: `contrib-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            source,
            author,
            content_hash: this.hash(content),
            timestamp,
            valuation: this.calculateValue(type, content)
        };
        
        this.queue.push(kbEntry);
        this.valuations.set(author, (this.valuations.get(author) || 0) + kbEntry.valuation);
        
        return kbEntry;
    }

    // Calculate contribution value
    calculateValue(type, content) {
        const baseValues = {
            'commit': 10,
            'pr': 50,
            'issue': 20,
            'review': 15,
            'doc': 25,
            'dataset': 100
        };
        
        const base = baseValues[type] || 10;
        const sizeMultiplier = Math.min(content.length / 1000, 5);
        
        return Math.floor(base * (1 + sizeMultiplier));
    }

    hash(data) {
        // Simple hash for demo
        return Buffer.from(data).toString('base64').substring(0, 32);
    }

    // Create rollup batch
    createRollup() {
        const rollup = {
            id: `rollup-${Date.now()}`,
            contributions: this.queue.length,
            payments: Array.from(this.valuations.entries()).map(([author, value]) => ({
                to: author,
                amount: value,
                kb_proofs: this.queue.filter(c => c.author === author).map(c => c.id)
            })),
            total_value: Array.from(this.valuations.values()).reduce((a, b) => a + b, 0),
            timestamp: Date.now()
        };
        
        return rollup;
    }

    // Generate RDFa for rollup
    generateRollupRDFa(rollup) {
        const payments = rollup.payments.map(p => `
    <div typeof="Payment">
      <span property="recipient">${p.to}</span>
      <span property="amount">${p.amount}</span>
      <span property="proofs">${p.kb_proofs.join(',')}</span>
    </div>`).join('');

        return `
<div vocab="https://escaped-rdfa.org/" typeof="ContributionRollup">
  <span property="rollupId">${rollup.id}</span>
  <span property="contributions">${rollup.contributions}</span>
  <span property="totalValue">${rollup.total_value}</span>
  <span property="timestamp">${rollup.timestamp}</span>
  <div property="payments">${payments}
  </div>
</div>`;
    }

    // Save rollup to KB
    saveRollup(rollup) {
        const rdfa = this.generateRollupRDFa(rollup);
        const filename = `../knowledge-graph/rollup-${rollup.id}.rdf`;
        fs.writeFileSync(filename, rdfa);
        
        // Clear queue
        this.queue = [];
        this.valuations.clear();
        
        return filename;
    }
}

// Demo ingestion
async function demo() {
    console.log('📥 Contribution Ingestion Pipeline Demo\n');
    
    const ingester = new ContributionIngester();
    
    // Simulate contributions
    await ingester.ingest({
        type: 'commit',
        source: 'https://github.com/meta-introspector/solfunmeme/commit/abc123',
        author: 'contributor1',
        content: 'Added WASM observer with genesis proof',
        timestamp: Date.now()
    });
    
    await ingester.ingest({
        type: 'pr',
        source: 'https://github.com/meta-introspector/meta-meme/pull/42',
        author: 'contributor2',
        content: 'Implemented P2P Solana chain with HME shards',
        timestamp: Date.now()
    });
    
    await ingester.ingest({
        type: 'dataset',
        source: 'https://huggingface.co/datasets/introspector/solfunmeme-index',
        author: 'contributor1',
        content: '1.2M+ semantic analysis records',
        timestamp: Date.now()
    });
    
    console.log('✓ Ingested 3 contributions');
    console.log('\n💰 Valuations:');
    ingester.valuations.forEach((value, author) => {
        console.log(`  ${author}: ${value} tokens`);
    });
    
    // Create rollup
    const rollup = ingester.createRollup();
    console.log('\n📦 Rollup Created:');
    console.log(`  ID: ${rollup.id}`);
    console.log(`  Contributions: ${rollup.contributions}`);
    console.log(`  Total Value: ${rollup.total_value} tokens`);
    console.log(`  Payments: ${rollup.payments.length}`);
    
    // Save to KB
    const filename = ingester.saveRollup(rollup);
    console.log(`\n✅ Rollup saved to: ${filename}`);
    console.log('\n🔗 Next: Submit rollup to P2P Solana chain');
    console.log('   Each payment validated by KB proofs');
}

demo().catch(console.error);

module.exports = { ContributionIngester };
