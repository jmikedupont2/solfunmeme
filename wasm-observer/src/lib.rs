use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};
use ed25519_dalek::{SigningKey, VerifyingKey};

#[derive(Serialize, Deserialize, Clone)]
struct Genesis {
    public_key: String,
    encrypted_private_key: String,
    birth_hash: String,
    timestamp: f64,
}

#[derive(Serialize, Deserialize, Clone)]
struct Witness {
    genesis: Option<Genesis>,
    events: Vec<UserAction>,
    data_inputs: Vec<DataInput>,
    attestations: Vec<Attestation>,
    execution_context: Vec<ExecutionTrace>,
    timestamp: f64,
    session_id: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct ExecutionTrace {
    trace_type: String, // "strace", "perf", "io"
    data: String,
    hash: String,
    self_verified: bool,
}

#[derive(Serialize, Deserialize, Clone)]
struct UserAction {
    x: i32,
    y: i32,
    t: f64,
    action: u8,
}

#[derive(Serialize, Deserialize, Clone)]
struct DataInput {
    input_type: String,
    key: String,
    value: String,
    hash: String,
}

#[derive(Serialize, Deserialize, Clone)]
struct Attestation {
    plugin: String,
    claim: String,
    proof_hash: String,
}

#[derive(Serialize, Deserialize)]
struct ZKBadge {
    commitment: String,
    shards: Vec<String>,
    rdfa: String,
}

#[wasm_bindgen]
pub struct Observer {
    witness: Witness,
}

#[wasm_bindgen]
impl Observer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Observer {
        let session_id = format!("{}", js_sys::Date::now() as u64);
        Observer {
            witness: Witness {
                genesis: None,
                events: Vec::new(),
                data_inputs: Vec::new(),
                attestations: Vec::new(),
                execution_context: Vec::new(),
                timestamp: js_sys::Date::now(),
                session_id,
            },
        }
    }

    pub fn genesis(&mut self) -> String {
        use base64::{Engine as _, engine::general_purpose};
        
        // Generate keypair from timestamp seed
        let seed_data = format!("{}:{}", self.witness.session_id, js_sys::Date::now());
        let mut hasher = Sha256::new();
        hasher.update(seed_data.as_bytes());
        let seed_hash = hasher.finalize();
        let mut seed = [0u8; 32];
        seed.copy_from_slice(&seed_hash[..32]);
        
        let signing_key = SigningKey::from_bytes(&seed);
        let verifying_key = signing_key.verifying_key();
        
        // Birth hash
        let birth_hash = self.hash_data(&seed_data);
        
        // Simple XOR encryption with birth hash
        let private_bytes = signing_key.to_bytes();
        let key_bytes = birth_hash.as_bytes();
        let encrypted: Vec<u8> = private_bytes.iter()
            .enumerate()
            .map(|(i, &b)| b ^ key_bytes[i % key_bytes.len()])
            .collect();
        
        let genesis = Genesis {
            public_key: general_purpose::STANDARD.encode(verifying_key.as_bytes()),
            encrypted_private_key: general_purpose::STANDARD.encode(&encrypted),
            birth_hash: birth_hash.clone(),
            timestamp: js_sys::Date::now(),
        };
        
        self.witness.genesis = Some(genesis.clone());
        self.attest("self".to_string(), "genesis_witnessed".to_string());
        
        serde_json::to_string(&genesis).unwrap_or_default()
    }

    pub fn observe_move(&mut self, x: i32, y: i32) {
        self.witness.events.push(UserAction {
            x, y, t: js_sys::Date::now(), action: 0,
        });
    }

    pub fn observe_click(&mut self, x: i32, y: i32) {
        self.witness.events.push(UserAction {
            x, y, t: js_sys::Date::now(), action: 1,
        });
    }

    pub fn lift_url(&mut self, url: String) {
        let hash = self.hash_data(&url);
        self.witness.data_inputs.push(DataInput {
            input_type: "url".to_string(),
            key: "url".to_string(),
            value: url,
            hash,
        });
    }

    pub fn lift_storage(&mut self, key: String, value: String) {
        let hash = self.hash_data(&value);
        self.witness.data_inputs.push(DataInput {
            input_type: "storage".to_string(),
            key, value, hash,
        });
    }

    pub fn lift_file(&mut self, filename: String, content: String) {
        let hash = self.hash_data(&content);
        self.witness.data_inputs.push(DataInput {
            input_type: "file".to_string(),
            key: filename,
            value: content,
            hash,
        });
    }

    pub fn attest(&mut self, plugin: String, claim: String) {
        let proof_hash = self.hash_data(&format!("{}:{}", plugin, claim));
        self.witness.attestations.push(Attestation {
            plugin, claim, proof_hash,
        });
    }

    pub fn witness_execution(&mut self, trace_type: String, trace_data: String) -> bool {
        let hash = self.hash_data(&trace_data);
        let self_verified = self.verify_execution(&trace_type, &trace_data);
        
        self.witness.execution_context.push(ExecutionTrace {
            trace_type,
            data: trace_data,
            hash,
            self_verified,
        });
        
        self_verified
    }

    fn verify_execution(&self, trace_type: &str, trace_data: &str) -> bool {
        match trace_type {
            "strace" => trace_data.contains("wasm") || trace_data.contains("observer"),
            "perf" => trace_data.len() > 0,
            "io" => trace_data.contains("input") || trace_data.contains("output"),
            _ => false,
        }
    }

    pub fn self_attest(&mut self) -> String {
        let context_summary = format!(
            "Execution verified: {} traces, {} inputs, {} attestations",
            self.witness.execution_context.len(),
            self.witness.data_inputs.len(),
            self.witness.attestations.len()
        );
        
        let all_verified = self.witness.execution_context.iter()
            .all(|t| t.self_verified);
        
        if all_verified {
            self.attest("self".to_string(), "execution_verified".to_string());
        }
        
        context_summary
    }

    fn hash_data(&self, data: &str) -> String {
        use base64::{Engine as _, engine::general_purpose};
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        general_purpose::STANDARD.encode(hasher.finalize())
    }

    pub fn certify(&self) -> String {
        let data = serde_json::to_string(&self.witness).unwrap_or_default();
        self.hash_data(&data)
    }

    pub fn generate_badge(&self, n_shards: u8) -> String {
        let data = serde_json::to_string(&self.witness).unwrap_or_default();
        let commitment = self.certify();
        let chunk_size = (data.len() + n_shards as usize - 1) / n_shards as usize;
        
        let shards: Vec<String> = (0..n_shards)
            .map(|i| {
                use base64::{Engine as _, engine::general_purpose};
                let start = (i as usize) * chunk_size;
                let end = ((i + 1) as usize * chunk_size).min(data.len());
                general_purpose::STANDARD.encode(&data[start..end])
            })
            .collect();

        let rdfa = format!(
            r#"<div vocab="https://escaped-rdfa.org/" typeof="ZKBadge">
  <span property="commitment">{}</span>
  <span property="shards">{}</span>
  <span property="session">{}</span>
</div>"#,
            commitment,
            shards.join(","),
            self.witness.session_id
        );

        let badge = ZKBadge { commitment, shards, rdfa };
        serde_json::to_string(&badge).unwrap_or_default()
    }

    pub fn export_witness(&self) -> String {
        serde_json::to_string(&self.witness).unwrap_or_default()
    }
}
