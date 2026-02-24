#!/usr/bin/env python3
"""Test all RPC endpoints from live cluster"""

import json
import requests
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_endpoint(url):
    """Test single RPC endpoint"""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getHealth"
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=3)
        if resp.status_code == 200:
            result = resp.json()
            if "result" in result and result["result"] == "ok":
                return (url, "✓", resp.elapsed.total_seconds())
        return (url, f"✗ {resp.status_code}", None)
    except Exception as e:
        return (url, "✗", None)

def main():
    # Load endpoints
    with open("rpc-endpoints-live-array.json") as f:
        endpoints = json.load(f)
    
    print(f"Testing {len(endpoints)} endpoints...\n")
    
    working = []
    
    with ThreadPoolExecutor(max_workers=20) as executor:
        futures = {executor.submit(test_endpoint, ep): ep for ep in endpoints[:50]}  # Test first 50
        
        for future in as_completed(futures):
            url, status, info = future.result()
            if status == "✓":
                working.append((url, info))
                print(f"✓ {url} ({info:.2f}s)")
    
    print(f"\n{'='*60}")
    print(f"Working: {len(working)}/50")
    
    if working:
        print(f"\nFastest 10:")
        for url, time in sorted(working, key=lambda x: x[1])[:10]:
            print(f"  {url} ({time:.2f}s)")
        
        # Save working endpoints
        with open("rpc-endpoints-tested.json", "w") as f:
            json.dump([url for url, _ in working], f, indent=2)
        print(f"\n✓ Saved {len(working)} working endpoints")

if __name__ == "__main__":
    main()
