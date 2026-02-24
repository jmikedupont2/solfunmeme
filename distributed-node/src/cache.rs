use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CachedResponse {
    pub method: String,
    pub params: serde_json::Value,
    pub response: serde_json::Value,
    pub timestamp: i64,
}

pub struct RpcCache {
    cache_dir: PathBuf,
    memory_cache: HashMap<String, CachedResponse>,
}

impl RpcCache {
    pub fn new(cache_dir: impl AsRef<Path>) -> Self {
        let cache_dir = cache_dir.as_ref().to_path_buf();
        fs::create_dir_all(&cache_dir).unwrap();
        
        Self {
            cache_dir,
            memory_cache: HashMap::new(),
        }
    }
    
    fn cache_key(&self, method: &str, params: &serde_json::Value) -> String {
        let mut hasher = Sha256::new();
        hasher.update(method.as_bytes());
        hasher.update(params.to_string().as_bytes());
        hex::encode(hasher.finalize())
    }
    
    fn cache_path(&self, key: &str) -> PathBuf {
        // Organize by first 2 chars for directory sharding
        let prefix = &key[..2];
        self.cache_dir.join(prefix).join(format!("{}.json", key))
    }
    
    pub fn get(&mut self, method: &str, params: &serde_json::Value) -> Option<serde_json::Value> {
        let key = self.cache_key(method, params);
        
        // Check memory cache first
        if let Some(cached) = self.memory_cache.get(&key) {
            return Some(cached.response.clone());
        }
        
        // Check disk cache
        let path = self.cache_path(&key);
        if path.exists() {
            if let Ok(data) = fs::read_to_string(&path) {
                if let Ok(cached) = serde_json::from_str::<CachedResponse>(&data) {
                    let response = cached.response.clone();
                    self.memory_cache.insert(key, cached);
                    return Some(response);
                }
            }
        }
        
        None
    }
    
    pub fn set(&mut self, method: &str, params: &serde_json::Value, response: &serde_json::Value) {
        let key = self.cache_key(method, params);
        let cached = CachedResponse {
            method: method.to_string(),
            params: params.clone(),
            response: response.clone(),
            timestamp: js_sys::Date::now() as i64 / 1000,
        };
        
        // Save to memory
        self.memory_cache.insert(key.clone(), cached.clone());
        
        // Save to disk
        let path = self.cache_path(&key);
        fs::create_dir_all(path.parent().unwrap()).unwrap();
        fs::write(&path, serde_json::to_string_pretty(&cached).unwrap()).unwrap();
    }
    
    pub fn stats(&self) -> CacheStats {
        let mut total_files = 0;
        let mut total_size = 0u64;
        
        if let Ok(entries) = fs::read_dir(&self.cache_dir) {
            for entry in entries.flatten() {
                if entry.path().is_dir() {
                    if let Ok(subentries) = fs::read_dir(entry.path()) {
                        for subentry in subentries.flatten() {
                            if let Ok(metadata) = subentry.metadata() {
                                total_files += 1;
                                total_size += metadata.len();
                            }
                        }
                    }
                }
            }
        }
        
        CacheStats {
            memory_entries: self.memory_cache.len(),
            disk_entries: total_files,
            total_size_bytes: total_size,
        }
    }
}

#[derive(Debug)]
pub struct CacheStats {
    pub memory_entries: usize,
    pub disk_entries: usize,
    pub total_size_bytes: u64,
}
