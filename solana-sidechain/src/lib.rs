use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};
use ed25519_dalek::{SigningKey, Signature, Signer};

#[derive(Serialize, Deserialize, Clone)]
pub struct Wallet {
    pub public_key: String,
    encrypted_private_key: Vec<u8>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Transaction {
    pub from: String,
    pub to: String,
    pub amount: u64,
    pub kb_proof: String, // RDFa KB item reference
    pub signature: String,
    pub timestamp: f64,
}

#[derive(Serialize, Deserialize)]
pub struct KBShard {
    pub rdfa_ref: String,
    pub data: String,
    pub commitment: String,
}

#[wasm_bindgen]
pub struct SolanaKBChain {
    wallet: Option<Wallet>,
    shards: Vec<KBShard>,
}

#[wasm_bindgen]
impl SolanaKBChain {
    #[wasm_bindgen(constructor)]
    pub fn new() -> SolanaKBChain {
        SolanaKBChain {
            wallet: None,
            shards: Vec::new(),
        }
    }

    pub fn create_wallet(&mut self, seed: String) -> String {
        use base64::{Engine as _, engine::general_purpose};
        
        let mut hasher = Sha256::new();
        hasher.update(seed.as_bytes());
        let seed_hash = hasher.finalize();
        let mut seed_bytes = [0u8; 32];
        seed_bytes.copy_from_slice(&seed_hash[..32]);
        
        let signing_key = SigningKey::from_bytes(&seed_bytes);
        let verifying_key = signing_key.verifying_key();
        
        // XOR encrypt private key
        let encrypted = signing_key.to_bytes()
            .iter()
            .enumerate()
            .map(|(i, &b)| b ^ seed_hash[i % 32])
            .collect();
        
        let wallet = Wallet {
            public_key: general_purpose::STANDARD.encode(verifying_key.as_bytes()),
            encrypted_private_key: encrypted,
        };
        
        let pubkey = wallet.public_key.clone();
        self.wallet = Some(wallet);
        pubkey
    }

    pub fn add_kb_shard(&mut self, rdfa_ref: String, data: String) {
        use base64::{Engine as _, engine::general_purpose};
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        let commitment = general_purpose::STANDARD.encode(hasher.finalize());
        
        self.shards.push(KBShard {
            rdfa_ref,
            data,
            commitment,
        });
    }

    pub fn create_transaction(&self, to: String, amount: u64, kb_proof: String) -> String {
        let wallet = self.wallet.as_ref().expect("No wallet");
        
        let tx = Transaction {
            from: wallet.public_key.clone(),
            to,
            amount,
            kb_proof,
            signature: "pending".to_string(),
            timestamp: js_sys::Date::now(),
        };
        
        serde_json::to_string(&tx).unwrap_or_default()
    }

    pub fn validate_transaction(&self, tx_json: String) -> bool {
        let tx: Transaction = match serde_json::from_str(&tx_json) {
            Ok(t) => t,
            Err(_) => return false,
        };
        
        // Validate against KB shards
        self.shards.iter().any(|shard| shard.rdfa_ref == tx.kb_proof)
    }

    pub fn get_shards(&self) -> String {
        serde_json::to_string(&self.shards).unwrap_or_default()
    }
}
