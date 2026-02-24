use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct ModelState {
    pub id: u8,
    pub hub: String,
    pub data: String,
    pub timestamp: f64,
    pub hash: String,
}

#[wasm_bindgen]
pub struct SyncHub {
    hub_name: String,
    models: Vec<ModelState>,
}

#[wasm_bindgen]
impl SyncHub {
    #[wasm_bindgen(constructor)]
    pub fn new(hub_name: String) -> Self {
        Self {
            hub_name: hub_name.clone(),
            models: (0..24).map(|id| ModelState {
                id,
                hub: hub_name.clone(),
                data: String::new(),
                timestamp: 0.0,
                hash: String::new(),
            }).collect(),
        }
    }
    
    pub fn update_model(&mut self, id: u8, data: String, timestamp: f64) -> String {
        if let Some(model) = self.models.get_mut(id as usize) {
            model.data = data;
            model.timestamp = timestamp;
            model.hash = format!("{:x}", id as u64 * timestamp as u64);
            serde_json::to_string(&model).unwrap()
        } else {
            "{}".to_string()
        }
    }
    
    pub fn get_models(&self) -> String {
        serde_json::to_string(&self.models).unwrap()
    }
    
    pub fn sync_from(&mut self, other_models: String) -> u8 {
        if let Ok(models) = serde_json::from_str::<Vec<ModelState>>(&other_models) {
            let mut synced = 0;
            for other in models {
                if let Some(local) = self.models.get_mut(other.id as usize) {
                    if other.timestamp > local.timestamp {
                        *local = other;
                        synced += 1;
                    }
                }
            }
            synced
        } else {
            0
        }
    }
}
