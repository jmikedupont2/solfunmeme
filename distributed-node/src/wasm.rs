use wasm_bindgen::prelude::*;
use web_sys::console;
use gloo_net::http::Request;
use serde_json::json;

const BOOTSTRAP_RPC: &str = "https://api.mainnet-beta.solana.com";

#[wasm_bindgen]
pub struct WasmNode {
    cache_hits: u32,
    cache_misses: u32,
    rpc_endpoints: Vec<String>,
    rpc_index: usize,
}

#[wasm_bindgen]
impl WasmNode {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        console::log_1(&"🕳️ SOLFUNMEME Node initialized".into());
        Self {
            cache_hits: 0,
            cache_misses: 0,
            rpc_endpoints: vec![BOOTSTRAP_RPC.to_string()],
            rpc_index: 0,
        }
    }
    
    pub async fn discover_nodes(&mut self) -> Result<String, JsValue> {
        console::log_1(&"🔍 Discovering RPC nodes...".into());
        
        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getClusterNodes"
        });
        
        let response = Request::post(BOOTSTRAP_RPC)
            .json(&request)
            .map_err(|e| JsValue::from_str(&e.to_string()))?
            .send()
            .await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        let data: serde_json::Value = response.json().await
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        
        if let Some(nodes) = data["result"].as_array() {
            self.rpc_endpoints.clear();
            
            for node in nodes {
                if let Some(rpc) = node["rpc"].as_str() {
                    self.rpc_endpoints.push(format!("http://{}", rpc));
                }
            }
            
            console::log_1(&format!("✓ Discovered {} RPC endpoints", self.rpc_endpoints.len()).into());
            
            // Save to localStorage for sharing
            if let Some(window) = web_sys::window() {
                if let Ok(Some(storage)) = window.local_storage() {
                    let endpoints_json = serde_json::to_string(&self.rpc_endpoints).unwrap();
                    let _ = storage.set_item("rpc_endpoints", &endpoints_json);
                }
            }
            
            Ok(format!("Discovered {} endpoints", self.rpc_endpoints.len()))
        } else {
            Err(JsValue::from_str("Failed to get cluster nodes"))
        }
    }
    
    fn next_rpc(&mut self) -> String {
        if self.rpc_endpoints.is_empty() {
            return BOOTSTRAP_RPC.to_string();
        }
        let endpoint = self.rpc_endpoints[self.rpc_index].clone();
        self.rpc_index = (self.rpc_index + 1) % self.rpc_endpoints.len();
        endpoint
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
        
        let rpc_url = self.next_rpc();
        console::log_1(&format!("→ RPC call: {} via {}", method, rpc_url).into());
        
        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": serde_json::from_str::<serde_json::Value>(&params).unwrap_or(json!([]))
        });
        
        let response = Request::post(&rpc_url)
            .json(&request)
            .map_err(|e| JsValue::from_str(&e.to_string()))?
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
