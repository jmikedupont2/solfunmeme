use solfunmeme_distributed::{CachedFetcher, DistributedNode, WorkMessage};
use serde_json::json;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🕳️💎 SOLFUNMEME DISTRIBUTED FETCHER NODE\n");
    
    let args: Vec<String> = std::env::args().collect();
    let port: u16 = args.get(1)
        .and_then(|s| s.parse().ok())
        .unwrap_or(4001);
    
    let cache_dir = format!("./cache_node_{}", port);
    let rpc_url = "https://api.mainnet-beta.solana.com";
    
    // Initialize cached fetcher
    let fetcher = CachedFetcher::new(&cache_dir, rpc_url);
    
    // Initialize P2P node
    let mut node = DistributedNode::new().await?;
    node.listen(port).await?;
    
    println!("✓ Node started on port {}", port);
    println!("✓ Cache directory: {}", cache_dir);
    println!("✓ RPC endpoint: {}\n", rpc_url);
    
    // Spawn stats reporter
    let fetcher_clone = fetcher.clone();
    tokio::spawn(async move {
        loop {
            sleep(Duration::from_secs(30)).await;
            let stats = fetcher_clone.get_stats();
            let cache_stats = fetcher_clone.cache_stats();
            
            println!("\n📊 STATS:");
            println!("  Cache hits: {}", stats.cache_hits);
            println!("  Cache misses: {}", stats.cache_misses);
            println!("  RPC calls: {}", stats.rpc_calls);
            println!("  Hit rate: {:.1}%", 
                if stats.cache_hits + stats.cache_misses > 0 {
                    100.0 * stats.cache_hits as f64 / (stats.cache_hits + stats.cache_misses) as f64
                } else {
                    0.0
                });
            println!("  Disk cache: {} entries ({:.2} MB)", 
                cache_stats.disk_entries,
                cache_stats.total_size_bytes as f64 / 1_000_000.0);
        }
    });
    
    // Example: Fetch some data
    println!("🔍 Testing fetch with cache...\n");
    
    let contract = "BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump";
    
    // First fetch - will hit RPC
    let result1 = fetcher.fetch(
        "getSignaturesForAddress",
        json!([contract, {"limit": 10}])
    ).await?;
    
    println!("✓ First fetch complete (RPC call)");
    
    // Second fetch - will hit cache
    let result2 = fetcher.fetch(
        "getSignaturesForAddress",
        json!([contract, {"limit": 10}])
    ).await?;
    
    println!("✓ Second fetch complete (cached)");
    
    // Broadcast availability to network
    node.broadcast(&WorkMessage::CacheShare {
        cache_keys: vec![contract.to_string()],
    })?;
    
    println!("\n📡 Broadcasting cache availability to peers...");
    println!("🌐 Waiting for peer connections...\n");
    
    // Run P2P event loop
    node.run().await?;
    
    Ok(())
}
