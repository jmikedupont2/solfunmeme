use archive_uploader::{ArchiveUploader, SolanaTestnetWriter, EthTestnetWriter};
use serde_json::json;
use std::fs;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🌐 SOLFUNMEME Archive & Testnet Uploader\n");
    
    // Read blocks from knowledge graph
    let blocks_dir = "../knowledge-graph/blocks";
    let manifest_path = format!("{}/manifest.json", blocks_dir);
    
    if !std::path::Path::new(&manifest_path).exists() {
        println!("❌ No blocks found. Run test-block-cache.js first.");
        return Ok(());
    }
    
    let manifest = fs::read_to_string(&manifest_path)?;
    let manifest_json: serde_json::Value = serde_json::from_str(&manifest)?;
    
    println!("📊 Found {} blocks\n", manifest_json["totalBlocks"]);
    
    // Initialize uploaders
    let archive = ArchiveUploader::new("solfunmeme-blocks");
    let sol_writer = SolanaTestnetWriter::new();
    let eth_writer = EthTestnetWriter::new();
    
    // Upload manifest to Archive.org
    let metadata = json!({
        "title": "SOLFUNMEME API Blocks",
        "description": "Witnessed and cached API calls from SOLFUNMEME system",
        "creator": "SOLFUNMEME Autopoietic System",
        "mediatype": "data",
        "collection": "opensource"
    });
    
    println!("📤 Uploading manifest...");
    let hash = archive.upload_file(&manifest_path, metadata).await?;
    
    // Write hash to Solana devnet
    let sol_tx = sol_writer.write_hash(&hash).await?;
    
    // Write hash to Ethereum Sepolia
    let eth_tx = eth_writer.write_hash(&hash).await?;
    
    println!("\n✅ Upload Complete!");
    println!("   Archive.org: https://archive.org/details/solfunmeme-blocks");
    println!("   Solana Devnet: {}", sol_tx);
    println!("   Ethereum Sepolia: {}", eth_tx);
    println!("   Hash: {}", hash);
    
    Ok(())
}
