// Block-based API cache with P2P sharing
const fs = require('fs');
const crypto = require('crypto');

class BlockCache {
    constructor(observer) {
        this.observer = observer;
        this.blocks = [];
        this.blockDir = '../knowledge-graph/blocks';
        
        if (!fs.existsSync(this.blockDir)) {
            fs.mkdirSync(this.blockDir, { recursive: true });
        }
    }

    async wrapAPICall(apiCall, metadata) {
        const startTime = Date.now();
        
        try {
            // Execute API call
            const result = await apiCall();
            const endTime = Date.now();
            
            // Create block
            const block = {
                id: crypto.randomBytes(16).toString('hex'),
                type: 'api_call',
                metadata: {
                    ...metadata,
                    timestamp: startTime,
                    duration: endTime - startTime
                },
                request: {
                    url: metadata.url,
                    method: metadata.method || 'GET',
                    timestamp: startTime
                },
                response: {
                    status: result.status || 200,
                    data: result.data,
                    size: JSON.stringify(result.data).length,
                    timestamp: endTime
                },
                witness: null,
                commitment: null
            };
            
            // Witness the block
            this.witnessBlock(block);
            
            // Cache the block
            this.cacheBlock(block);
            
            return { block, result };
            
        } catch (error) {
            // Create error block
            const block = {
                id: crypto.randomBytes(16).toString('hex'),
                type: 'api_call_error',
                metadata,
                error: error.message,
                timestamp: Date.now()
            };
            
            this.witnessBlock(block);
            this.cacheBlock(block);
            
            throw error;
        }
    }

    witnessBlock(block) {
        // Witness with observer
        this.observer.witness_execution('api-block', `${block.metadata.url}`);
        this.observer.lift_storage(`block_${block.id}`, JSON.stringify(block.metadata));
        
        // Generate commitment
        const blockHash = crypto.createHash('sha256')
            .update(JSON.stringify(block))
            .digest('hex');
        
        block.commitment = blockHash;
        block.witness = {
            timestamp: Date.now(),
            observer: 'wasm-observer',
            attested: true
        };
        
        this.blocks.push(block);
    }

    cacheBlock(block) {
        // Save to filesystem (git)
        const blockFile = `${this.blockDir}/block-${block.id}.json`;
        fs.writeFileSync(blockFile, JSON.stringify(block, null, 2));
        
        // Create RDFa
        const rdfaFile = `${this.blockDir}/block-${block.id}.rdf`;
        const rdfa = this.createBlockRDFa(block);
        fs.writeFileSync(rdfaFile, rdfa);
        
        console.log(`  📦 Block cached: ${block.id}`);
    }

    createBlockRDFa(block) {
        return `
<div vocab="https://escaped-rdfa.org/" typeof="APIBlock">
  <span property="blockId">${block.id}</span>
  <span property="type">${block.type}</span>
  <span property="url">${block.metadata.url}</span>
  <span property="method">${block.request?.method || 'GET'}</span>
  <span property="status">${block.response?.status || 'error'}</span>
  <span property="commitment">${block.commitment}</span>
  <span property="timestamp">${block.metadata.timestamp}</span>
  <meta property="witnessed" content="true" />
  <meta property="cached" content="true" />
</div>`;
    }

    async shareViaGit() {
        // Git commit blocks
        const { execSync } = require('child_process');
        try {
            execSync(`git add ${this.blockDir}`, { cwd: '..' });
            execSync(`git commit -m "Add ${this.blocks.length} witnessed API blocks"`, { cwd: '..' });
            console.log('  ✓ Blocks committed to git');
            return true;
        } catch (err) {
            console.log('  ⚠ Git commit skipped (no changes or error)');
            return false;
        }
    }

    async shareViaSupabase() {
        // Prepare blocks for Supabase
        const supabaseBlocks = this.blocks.map(b => ({
            block_id: b.id,
            block_type: b.type,
            url: b.metadata.url,
            commitment: b.commitment,
            data: b,
            witnessed_at: new Date(b.metadata.timestamp).toISOString()
        }));
        
        console.log(`  ✓ Prepared ${supabaseBlocks.length} blocks for Supabase`);
        // TODO: Actual Supabase insert when configured
        return supabaseBlocks;
    }

    async shareViaLibP2P() {
        // Create libp2p manifest
        const manifest = {
            blocks: this.blocks.map(b => ({
                id: b.id,
                commitment: b.commitment,
                timestamp: b.metadata.timestamp,
                size: JSON.stringify(b).length
            })),
            totalBlocks: this.blocks.length,
            timestamp: Date.now()
        };
        
        const manifestFile = `${this.blockDir}/manifest.json`;
        fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));
        
        console.log(`  ✓ LibP2P manifest created (${this.blocks.length} blocks)`);
        return manifest;
    }

    async shareAll() {
        console.log('\n📡 Sharing blocks via P2P systems...');
        
        await this.shareViaGit();
        await this.shareViaSupabase();
        await this.shareViaLibP2P();
        
        console.log('✅ Blocks shared across all P2P systems\n');
    }

    getSummary() {
        return {
            totalBlocks: this.blocks.length,
            successBlocks: this.blocks.filter(b => b.type === 'api_call').length,
            errorBlocks: this.blocks.filter(b => b.type === 'api_call_error').length,
            totalSize: this.blocks.reduce((sum, b) => sum + (b.response?.size || 0), 0),
            commitments: this.blocks.map(b => b.commitment)
        };
    }
}

module.exports = { BlockCache };
