use crate::cache::RpcCache;
#[cfg(not(target_arch = "wasm32"))]
use reqwest::Client;
use serde_json::json;
use std::sync::{Arc, Mutex};
#[cfg(not(target_arch = "wasm32"))]
use std::time::Duration;

#[cfg(not(target_arch = "wasm32"))]
#[cfg(not(target_arch = "wasm32"))]
#[derive(Clone)]
pub struct CachedFetcher {
    cache: Arc<Mutex<RpcCache>>,
    client: Client,
    rpc_url: String,
    stats: Arc<Mutex<FetchStats>>,
}

#[cfg(not(target_arch = "wasm32"))]
#[derive(Debug, Default)]
pub struct FetchStats {
    pub cache_hits: usize,
    pub cache_misses: usize,
    pub rpc_calls: usize,
    pub errors: usize,
}

#[cfg(not(target_arch = "wasm32"))]
impl CachedFetcher {
    pub fn new(cache_dir: &str, rpc_url: &str) -> Self {
        Self {
            cache: Arc::new(Mutex::new(RpcCache::new(cache_dir))),
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap(),
            rpc_url: rpc_url.to_string(),
            stats: Arc::new(Mutex::new(FetchStats::default())),
        }
    }
    
    pub async fn fetch(
        &self,
        method: &str,
        params: serde_json::Value,
    ) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        // Check cache first
        {
            let mut cache = self.cache.lock().unwrap();
            if let Some(cached) = cache.get(method, &params) {
                self.stats.lock().unwrap().cache_hits += 1;
                return Ok(cached);
            }
        }
        
        // Cache miss - fetch from RPC
        self.stats.lock().unwrap().cache_misses += 1;
        self.stats.lock().unwrap().rpc_calls += 1;
        
        let request = json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params
        });
        
        let response = self.client
            .post(&self.rpc_url)
            .json(&request)
            .send()
            .await?;
        
        let result: serde_json::Value = response.json().await?;
        
        // Cache the response
        {
            let mut cache = self.cache.lock().unwrap();
            cache.set(method, &params, &result);
        }
        
        Ok(result)
    }
    
    pub fn get_stats(&self) -> FetchStats {
        let stats = self.stats.lock().unwrap();
        FetchStats {
            cache_hits: stats.cache_hits,
            cache_misses: stats.cache_misses,
            rpc_calls: stats.rpc_calls,
            errors: stats.errors,
        }
    }
    
    pub fn cache_stats(&self) -> crate::cache::CacheStats {
        self.cache.lock().unwrap().stats()
    }
}
