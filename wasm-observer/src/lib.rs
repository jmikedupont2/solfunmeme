use wasm_bindgen::prelude::*;
use web_sys::console;
use serde::{Serialize, Deserialize};
use sha2::{Sha256, Digest};

#[derive(Serialize, Deserialize, Clone)]
struct Witness {
    events: Vec<UserAction>,
    data_inputs: Vec<DataInput>,
    timestamp: f64,
    session_id: String,
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
    input_type: String, // "url", "storage", "file"
    key: String,
    value: String,
    hash: String,
}

#[derive(Serialize, Deserialize)]
struct WitnessShard {
    shard_id: u8,
    total_shards: u8,
    data: String,
    commitment: String,
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
                events: Vec::new(),
                data_inputs: Vec::new(),
                timestamp: js_sys::Date::now(),
                session_id,
            },
        }
    }

    pub fn observe_move(&mut self, x: i32, y: i32) {
        self.witness.events.push(UserAction {
            x, y,
            t: js_sys::Date::now(),
            action: 0,
        });
    }

    pub fn observe_click(&mut self, x: i32, y: i32) {
        self.witness.events.push(UserAction {
            x, y,
            t: js_sys::Date::now(),
            action: 1,
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
            key,
            value,
            hash,
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

    fn hash_data(&self, data: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        base64::encode(hasher.finalize())
    }

    pub fn certify(&self) -> String {
        let data = serde_json::to_string(&self.witness).unwrap_or_default();
        self.hash_data(&data)
    }

    pub fn create_shards(&self, n: u8) -> String {
        let data = serde_json::to_string(&self.witness).unwrap_or_default();
        let commitment = self.certify();
        let chunk_size = (data.len() + n as usize - 1) / n as usize;
        
        let shards: Vec<WitnessShard> = (0..n)
            .map(|i| {
                let start = (i as usize) * chunk_size;
                let end = ((i + 1) as usize * chunk_size).min(data.len());
                WitnessShard {
                    shard_id: i,
                    total_shards: n,
                    data: data[start..end].to_string(),
                    commitment: commitment.clone(),
                }
            })
            .collect();
        
        serde_json::to_string(&shards).unwrap_or_default()
    }

    pub fn export_witness(&self) -> String {
        serde_json::to_string(&self.witness).unwrap_or_default()
    }
}
