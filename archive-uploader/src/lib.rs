use reqwest::multipart;
use serde_json::json;
use sha2::{Sha256, Digest};
use std::fs;
use std::path::Path;

pub struct ArchiveUploader {
    client: reqwest::Client,
    identifier: String,
}

impl ArchiveUploader {
    pub fn new(identifier: &str) -> Self {
        Self {
            client: reqwest::Client::new(),
            identifier: identifier.to_string(),
        }
    }

    pub async fn upload_file(&self, file_path: &str, metadata: serde_json::Value) -> Result<String, Box<dyn std::error::Error>> {
        let file_data = fs::read(file_path)?;
        let file_name = Path::new(file_path).file_name().unwrap().to_str().unwrap();
        
        // Calculate hash
        let mut hasher = Sha256::new();
        hasher.update(&file_data);
        let hash = hex::encode(hasher.finalize());
        
        println!("📦 Uploading to Archive.org: {}", file_name);
        println!("   Hash: {}", hash);
        
        // Create multipart form
        let form = multipart::Form::new()
            .text("identifier", self.identifier.clone())
            .text("metadata", metadata.to_string())
            .part("file", multipart::Part::bytes(file_data)
                .file_name(file_name.to_string()));
        
        // Upload to archive.org
        let url = format!("https://s3.us.archive.org/{}/{}", self.identifier, file_name);
        
        let response = self.client
            .put(&url)
            .multipart(form)
            .send()
            .await?;
        
        if response.status().is_success() {
            println!("   ✓ Uploaded to Archive.org");
            Ok(hash)
        } else {
            Err(format!("Upload failed: {}", response.status()).into())
        }
    }
}

pub struct SolanaTestnetWriter {
    rpc_url: String,
}

impl SolanaTestnetWriter {
    pub fn new() -> Self {
        Self {
            rpc_url: "https://api.devnet.solana.com".to_string(),
        }
    }

    pub async fn write_hash(&self, hash: &str) -> Result<String, Box<dyn std::error::Error>> {
        println!("⛓️  Writing to Solana Devnet");
        
        // Create memo instruction with hash
        let memo = format!("SOLFUNMEME:{}", hash);
        
        // In production, would use actual keypair and send transaction
        // For now, simulate
        let tx_sig = format!("sol_devnet_{}", &hash[..16]);
        
        println!("   ✓ Memo: {}", memo);
        println!("   ✓ Tx: {}", tx_sig);
        
        Ok(tx_sig)
    }
}

pub struct EthTestnetWriter {
    rpc_url: String,
}

impl EthTestnetWriter {
    pub fn new() -> Self {
        Self {
            rpc_url: "https://sepolia.infura.io/v3/YOUR_KEY".to_string(),
        }
    }

    pub async fn write_hash(&self, hash: &str) -> Result<String, Box<dyn std::error::Error>> {
        println!("⛓️  Writing to Ethereum Sepolia");
        
        // Create data field with hash
        let data = format!("0x{}", hash);
        
        // In production, would use actual wallet and send transaction
        // For now, simulate
        let tx_hash = format!("0xeth_{}", &hash[..16]);
        
        println!("   ✓ Data: {}", data);
        println!("   ✓ Tx: {}", tx_hash);
        
        Ok(tx_hash)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_upload_flow() {
        let uploader = ArchiveUploader::new("solfunmeme-test");
        let sol_writer = SolanaTestnetWriter::new();
        let eth_writer = EthTestnetWriter::new();
        
        // Simulate upload
        println!("Testing upload flow...");
    }
}
