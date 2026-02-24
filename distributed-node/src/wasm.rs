use wasm_bindgen::prelude::*;
use web_sys::console;
use gloo_net::http::Request;
use serde_json::json;

#[wasm_bindgen]
pub struct WasmNode {
    cache_hits: u32,
    cache_misses: u32,
}

#[wasm_bindgen]
impl WasmNode {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console::log_1(&"🕳️ SOLFUNMEME Node initialized".into());
        Self {
            cache_hits: 0,
            cache_misses: 0,
        }
    }
    
    pub async fn fetch_rpc(&mut self, method: String, params: String) -> Result<String, JsValue> {
        let cache_key = format!("rpc_{}_{}", method, params);
        
        // Check localStorage cache
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(cached)) = storage.get_item(&cache_key) {
                    self.cache_hits += 1;
                    console::log_1(&format!("✓ Cache hit: {}", method).into());
                    return Ok(cached);
                }
            }
        }
        
        self.cache_misses += 1;
        console::log_1(&format!("→ RPC call: {}", method).into());
        
        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": serde_json::from_str::<serde_json::Value>(&params).unwrap_or(json!([]))
        });
        
        let response = Request::post("https://api.mainnet-beta.solana.com")
            .json(&request)?
            .send()
            .await
            .map_err(|e| JsValue::from_str(&e.to_string()))?
            .text()
            .await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        // Cache response
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                let _ = storage.set_item(&cache_key, &response);
            }
        }
        
        Ok(response)
    }
    
    pub fn get_stats(&self) -> String {
        format!("Hits: {} | Misses: {} | Rate: {:.1}%",
            self.cache_hits,
            self.cache_misses,
            if self.cache_hits + self.cache_misses > 0 {
                100.0 * self.cache_hits as f64 / (self.cache_hits + self.cache_misses) as f64
            } else { 0.0 }
        )
    }
}
