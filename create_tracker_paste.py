#!/usr/bin/env python3
"""Pastebin-based P2P tracker for SOLFUNMEME nodes"""

import json
import time
import hashlib
from datetime import datetime

# Pastebin services (no API key needed for read)
TRACKERS = [
    "https://pastebin.com/raw/",
    "https://paste.ubuntu.com/p/",
    "https://dpaste.com/",
    "https://gist.githubusercontent.com/",
]

def create_peer_announcement(emoji_code, rpc_endpoints):
    """Create peer announcement for pastebin"""
    peer_id = f"{emoji_code}_{int(time.time()) % 10000}"
    
    announcement = {
        "peer_id": peer_id,
        "emoji": emoji_code,
        "rpcs": rpc_endpoints,
        "timestamp": int(time.time()),
        "version": "0.1.0",
        "network": "solfunmeme-mainnet",
    }
    
    return announcement

def create_tracker_paste(peers):
    """Create tracker paste content"""
    tracker = {
        "network": "solfunmeme-mainnet",
        "updated": int(time.time()),
        "peers": peers,
        "monster_group": "71x59x47",
    }
    
    return json.dumps(tracker, indent=2)

def generate_tracker_urls(peers):
    """Generate URLs for manual pasting"""
    content = create_tracker_paste(peers)
    
    print("PASTEBIN TRACKER CONTENT")
    print("=" * 60)
    print(content)
    print("\n" + "=" * 60)
    print("\nManual steps:")
    print("1. Copy content above")
    print("2. Paste to one of these services:")
    print("   - https://pastebin.com/")
    print("   - https://paste.ubuntu.com/")
    print("   - https://dpaste.com/")
    print("   - https://gist.github.com/")
    print("3. Get raw URL")
    print("4. Share URL in:")
    print("   - Discord/Telegram")
    print("   - QR code")
    print("   - Email")
    print("   - USB stick (sneakernet)")
    
    return content

def main():
    # Load tested endpoints
    with open('rpc-endpoints-tested.json') as f:
        rpcs = json.load(f)[:5]
    
    # Create peer announcement
    peer = create_peer_announcement("🎮🌙🎨", rpcs)
    
    # Create tracker with this peer
    content = generate_tracker_urls([peer])
    
    # Save locally
    with open('tracker-paste.json', 'w') as f:
        f.write(content)
    
    print(f"\n✓ Saved to tracker-paste.json")
    print(f"\nExample tracker URLs:")
    print(f"  pastebin.com/XXXXXXXX")
    print(f"  paste.ubuntu.com/p/XXXXXXXXX/")
    print(f"  dpaste.com/XXXXXXXXX")
    
    # Generate HTML snippet
    html = f"""
<!-- Add to distributed-node.html -->
<script>
const TRACKER_URLS = [
    'https://pastebin.com/raw/XXXXXXXX',
    'https://paste.ubuntu.com/p/XXXXXXXXX/plain/',
    'https://dpaste.com/XXXXXXXXX.txt',
];

async function loadTrackers() {{
    for (const url of TRACKER_URLS) {{
        try {{
            const resp = await fetch(url);
            const data = await resp.json();
            console.log(`✓ Loaded ${{data.peers.length}} peers from tracker`);
            
            // Merge peers
            for (const peer of data.peers) {{
                console.log(`  Peer: ${{peer.emoji}} (${{peer.rpcs.length}} RPCs)`);
            }}
        }} catch (e) {{
            console.log(`✗ Failed to load tracker: ${{url}}`);
        }}
    }}
}}
</script>
"""
    
    with open('tracker-snippet.html', 'w') as f:
        f.write(html)
    
    print(f"\n✓ Saved HTML snippet to tracker-snippet.html")

if __name__ == "__main__":
    main()
