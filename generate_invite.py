#!/usr/bin/env python3
"""Generate NFT invite codes with RDFa namespace encoding"""

import json
import base64
import hashlib
from urllib.parse import urlencode

# Monster Group dimensions: 71 × 59 × 47 = 196,883
MONSTER_BASE = 24  # 24 models per hub
MONSTER_DIMS = (24, 24, 24)  # 24^3 = 13,824 combinations

# Emoji alphabet (24 symbols for base-24 encoding)
EMOJI_ALPHABET = "🕳️💎👑✓☀️🕉️🔥💧🌊🌍🌙⭐🌈🎯🎲🎨🎭🎪🎬🎮🎯🎲🎨🎭"[:24]

def encode_rpc_to_emoji(rpc_list):
    """Encode RPC endpoints as 24^3 emoji sequence"""
    # Hash RPC list to 3 indices
    data = json.dumps(rpc_list).encode()
    hash_bytes = hashlib.sha256(data).digest()
    
    # Extract 3 indices (0-23 each)
    idx1 = hash_bytes[0] % 24
    idx2 = hash_bytes[1] % 24
    idx3 = hash_bytes[2] % 24
    
    return EMOJI_ALPHABET[idx1] + EMOJI_ALPHABET[idx2] + EMOJI_ALPHABET[idx3]

def create_invite_url(rpc_endpoints, hub_id=0):
    """Create RDFa-encoded invite URL"""
    
    # Encode RPCs as base64
    rpc_data = json.dumps(rpc_endpoints).encode()
    rpc_b64 = base64.urlsafe_b64encode(rpc_data).decode().rstrip('=')
    
    # Generate emoji code
    emoji_code = encode_rpc_to_emoji(rpc_endpoints)
    
    # RDFa namespace parameters
    params = {
        'hub': hub_id,
        'rpcs': rpc_b64,
        'emoji': emoji_code,
        'monster': f"{len(rpc_endpoints)}x24x24",  # Dimensions
    }
    
    base_url = "https://solana.solfunmeme.com/node/distributed-node.html"
    invite_url = f"{base_url}?{urlencode(params)}"
    
    return {
        'url': invite_url,
        'emoji': emoji_code,
        'qr_data': invite_url,
        'nft_metadata': {
            'name': f"SOLFUNMEME Node Invite {emoji_code}",
            'description': f"Distributed node invite with {len(rpc_endpoints)} RPC endpoints",
            'attributes': [
                {'trait_type': 'Hub ID', 'value': hub_id},
                {'trait_type': 'RPC Count', 'value': len(rpc_endpoints)},
                {'trait_type': 'Emoji Code', 'value': emoji_code},
                {'trait_type': 'Monster Group', 'value': '71×59×47'},
            ]
        }
    }

def main():
    # Load tested endpoints
    with open('rpc-endpoints-tested.json') as f:
        rpcs = json.load(f)[:10]  # Top 10
    
    invite = create_invite_url(rpcs, hub_id=0)
    
    print("NFT INVITE CODE")
    print("=" * 60)
    print(f"Emoji: {invite['emoji']}")
    print(f"URL: {invite['url'][:80]}...")
    print(f"\nNFT Metadata:")
    print(json.dumps(invite['nft_metadata'], indent=2))
    
    # Save
    with open('invite-code.json', 'w') as f:
        json.dump(invite, f, indent=2)
    
    print(f"\n✓ Saved to invite-code.json")
    print(f"\nQR Code data ({len(invite['qr_data'])} chars):")
    print(invite['qr_data'])

if __name__ == "__main__":
    main()
