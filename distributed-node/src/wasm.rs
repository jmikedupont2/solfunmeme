use wasm_bindgen::prelude::*;
use web_sys::console;
use gloo_net::http::Request;
use serde_json::json;

const BOOTSTRAP_RPC: &str = "https://api.mainnet-beta.solana.com";
const FALLBACK_RPCS: &[&str] = &[
    "http://185.26.9.113:8899",
    "http://88.216.198.205:8899",
    "http://84.32.32.16:8899",
    "http://207.148.14.220:8899",
];

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
        
        let mut endpoints: Vec<String> = FALLBACK_RPCS.iter().map(|s| s.to_string()).collect();
        
        // Try to load from URL params
        if let Some(window) = web_sys::window() {
            if let Ok(location) = window.location().search() {
                if location.contains("rpcs=") {
                    console::log_1(&"📨 Invite code detected in URL".into());
                }
            }
        }
        
        Self {
            cache_hits: 0,
            cache_misses: 0,
            rpc_endpoints: endpoints,
            rpc_index: 0,
        }
    }
    
    pub async fn discover_nodes(&mut self) -> Result<String, JsValue> {
        console::log_1(&"🔍 Discovering RPC nodes...".into());
        
        // Load from localStorage first
        if let Some(window) = web_sys::window() {
            if let Ok(Some(storage)) = window.local_storage() {
                if let Ok(Some(cached)) = storage.get_item("rpc_endpoints") {
                    if let Ok(endpoints) = serde_json::from_str::<Vec<String>>(&cached) {
                        if !endpoints.is_empty() {
                            self.rpc_endpoints = endpoints;
                            console::log_1(&format!("✓ Loaded {} cached endpoints", self.rpc_endpoints.len()).into());
                            return Ok(format!("Loaded {} cached endpoints", self.rpc_endpoints.len()));
                        }
                    }
                }
            }
        }
        
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
            let mut new_endpoints = Vec::new();
            
            for node in nodes {
                if let Some(rpc) = node["rpc"].as_str() {
                    new_endpoints.push(format!("http://{}", rpc));
                }
            }
            
            if !new_endpoints.is_empty() {
                self.rpc_endpoints = new_endpoints;
                console::log_1(&format!("✓ Discovered {} RPC endpoints", self.rpc_endpoints.len()).into());
                
                // Save to localStorage
                if let Some(window) = web_sys::window() {
                    if let Ok(Some(storage)) = window.local_storage() {
                        let endpoints_json = serde_json::to_string(&self.rpc_endpoints).unwrap();
                        let _ = storage.set_item("rpc_endpoints", &endpoints_json);
                    }
                }
                
                Ok(format!("Discovered {} endpoints", self.rpc_endpoints.len()))
            } else {
                Err(JsValue::from_str("No RPC endpoints found"))
            }
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
