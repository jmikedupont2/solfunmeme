use fantoccini::{ClientBuilder, Locator};
use std::time::Instant;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🦊 Firefox Headless Browser Test\n");
    
    // Connect to geckodriver (must be running)
    println!("📡 Connecting to geckodriver...");
    let client = ClientBuilder::native()
        .connect("http://localhost:4444")
        .await?;
    
    println!("✓ Connected\n");
    
    // Test 1: Homepage load
    println!("🏠 Test 1: Homepage Load");
    let start = Instant::now();
    client.goto("http://localhost:3001").await?;
    let load_time = start.elapsed();
    println!("   Load time: {:?}", load_time);
    
    let title = client.title().await?;
    println!("   Title: {}", title);
    println!("   ✓ Passed\n");
    
    // Test 2: P0WN page load
    println!("🔐 Test 2: P0WN Page Load");
    let start = Instant::now();
    client.goto("http://localhost:3001/p0wn").await?;
    let load_time = start.elapsed();
    println!("   Load time: {:?}", load_time);
    
    // Check for key elements
    let heading = client.find(Locator::Css("h1")).await?;
    let text = heading.text().await?;
    println!("   Heading: {}", text);
    
    if text.contains("P0WN") {
        println!("   ✓ Passed\n");
    } else {
        println!("   ✗ Failed: Expected 'P0WN' in heading\n");
    }
    
    // Test 3: Check wallet button exists
    println!("💰 Test 3: Wallet Button");
    match client.find(Locator::Css("button")).await {
        Ok(button) => {
            let btn_text = button.text().await?;
            println!("   Button text: {}", btn_text);
            println!("   ✓ Passed\n");
        }
        Err(_) => {
            println!("   ✗ Failed: No button found\n");
        }
    }
    
    // Test 4: JavaScript execution
    println!("⚡ Test 4: JavaScript Execution");
    let start = Instant::now();
    let result = client.execute(
        "return document.querySelectorAll('*').length",
        vec![]
    ).await?;
    let exec_time = start.elapsed();
    println!("   DOM elements: {}", result);
    println!("   Execution time: {:?}", exec_time);
    println!("   ✓ Passed\n");
    
    // Test 5: Performance metrics
    println!("📊 Test 5: Performance Metrics");
    let perf: serde_json::Value = client.execute(
        "return JSON.stringify(performance.timing)",
        vec![]
    ).await?;
    println!("   Performance data: {}", perf);
    println!("   ✓ Passed\n");
    
    // Cleanup
    client.close().await?;
    
    println!("✅ All tests completed!");
    
    Ok(())
}
