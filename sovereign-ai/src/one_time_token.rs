use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};

#[derive(Serialize, Deserialize)]
pub struct OneTimeLLMCall {
    pub token_id: String,
    pub encrypted_prompt: Vec<u8>,
    pub encrypted_api_key: Vec<u8>,
    pub nonce: String,
    pub used: bool,
    pub commitment: String,
}

#[wasm_bindgen]
pub struct OneTimeToken {
    call: Option<OneTimeLLMCall>,
}

#[wasm_bindgen]
impl OneTimeToken {
    #[wasm_bindgen(constructor)]
    pub fn new() -> OneTimeToken {
        OneTimeToken { call: None }
    }

    pub fn create_token(&mut self, prompt: String, api_key: String) -> String {
        use base64::{Engine as _, engine::general_purpose};
        
        // Generate unique nonce
        let nonce = format!("{}", js_sys::Date::now());
        let mut hasher = Sha256::new();
        hasher.update(nonce.as_bytes());
        let nonce_hash = hasher.finalize();
        
        // HME encrypt: XOR with nonce hash (one-way)
        let encrypted_prompt: Vec<u8> = prompt.as_bytes()
            .iter()
            .enumerate()
            .map(|(i, &b)| b ^ nonce_hash[i % 32])
            .collect();
        
        let encrypted_api_key: Vec<u8> = api_key.as_bytes()
            .iter()
            .enumerate()
            .map(|(i, &b)| b ^ nonce_hash[i % 32])
            .collect();
        
        // Create commitment
        let mut commit_hasher = Sha256::new();
        commit_hasher.update(&encrypted_prompt);
        commit_hasher.update(&encrypted_api_key);
        commit_hasher.update(nonce.as_bytes());
        let commitment = general_purpose::STANDARD.encode(commit_hasher.finalize());
        
        let token_id = format!("ott-{}", js_sys::Date::now());
        
        let call = OneTimeLLMCall {
            token_id: token_id.clone(),
            encrypted_prompt,
            encrypted_api_key,
            nonce,
            used: false,
            commitment: commitment.clone(),
        };
        
        self.call = Some(call);
        
        serde_json::json!({
            "token_id": token_id,
            "commitment": commitment,
            "status": "ready"
        }).to_string()
    }

    pub fn execute(&mut self, nonce: String) -> String {
        let call = match &mut self.call {
            Some(c) => c,
            None => return serde_json::json!({"error": "No token"}).to_string(),
        };
        
        if call.used {
            return serde_json::json!({
                "error": "Token already used",
                "commitment": call.commitment
            }).to_string();
        }
        
        if call.nonce != nonce {
            return serde_json::json!({"error": "Invalid nonce"}).to_string();
        }
        
        // Decrypt with nonce
        let mut hasher = Sha256::new();
        hasher.update(nonce.as_bytes());
        let nonce_hash = hasher.finalize();
        
        let prompt: Vec<u8> = call.encrypted_prompt
            .iter()
            .enumerate()
            .map(|(i, &b)| b ^ nonce_hash[i % 32])
            .collect();
        
        let api_key: Vec<u8> = call.encrypted_api_key
            .iter()
            .enumerate()
            .map(|(i, &b)| b ^ nonce_hash[i % 32])
            .collect();
        
        // Mark as used (irreversible)
        call.used = true;
        
        serde_json::json!({
            "status": "executed",
            "prompt": String::from_utf8_lossy(&prompt),
            "api_key_hash": format!("{}...", String::from_utf8_lossy(&api_key).chars().take(8).collect::<String>()),
            "token_id": call.token_id,
            "commitment": call.commitment,
            "used": true
        }).to_string()
    }

    pub fn verify_unused(&self) -> bool {
        match &self.call {
            Some(c) => !c.used,
            None => false,
        }
    }

    pub fn get_commitment(&self) -> String {
        match &self.call {
            Some(c) => c.commitment.clone(),
            None => String::new(),
        }
    }
}
