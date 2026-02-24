#!/usr/bin/env python3
"""Test Solana RPC endpoints from CSV"""

import csv
import json
import requests
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

def test_endpoint(endpoint):
    """Test single RPC endpoint"""
    url = f"http://{endpoint}"
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getHealth"
    }
    
    try:
        resp = requests.post(url, json=payload, timeout=5)
        if resp.status_code == 200:
            result = resp.json()
            if "result" in result and result["result"] == "ok":
                return (endpoint, "✓", resp.elapsed.total_seconds())
        return (endpoint, "✗", None)
    except Exception as e:
        return (endpoint, "✗", str(e)[:50])

def main():
    csv_path = "rpc-endpoints/rpc_list.csv"
    
    print("Loading endpoints...")
    endpoints = []
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            endpoints.append(row['endpoint'])
    
    print(f"Testing {len(endpoints)} endpoints...\n")
    
    working = []
    failed = []
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(test_endpoint, ep): ep for ep in endpoints}
        
        for future in as_completed(futures):
            endpoint, status, info = future.result()
            if status == "✓":
                working.append((endpoint, info))
                print(f"✓ {endpoint} ({info:.2f}s)")
            else:
                failed.append((endpoint, info))
    
    print(f"\n{'='*60}")
    print(f"Working: {len(working)}/{len(endpoints)}")
    print(f"Failed:  {len(failed)}/{len(endpoints)}")
    
    if working:
        print(f"\nFastest 5:")
        for ep, time in sorted(working, key=lambda x: x[1])[:5]:
            print(f"  {ep} ({time:.2f}s)")
        
        # Save working endpoints
        with open("rpc-endpoints-working.json", "w") as f:
            json.dump([ep for ep, _ in working], f, indent=2)
        print(f"\n✓ Saved {len(working)} working endpoints to rpc-endpoints-working.json")

if __name__ == "__main__":
    main()
