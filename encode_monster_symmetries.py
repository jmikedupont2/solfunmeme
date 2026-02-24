#!/usr/bin/env python3
"""Encode DA51 types into 24^3 emoji with Monster Group symmetries"""

import json
import math

# 24 emoji alphabet (Monster Group base)
EMOJI_ALPHABET = [
    "🕳️", "💎", "👑", "✓", "☀️", "🕉️",  # 0-5: Sacred
    "🔥", "💧", "🌊", "🌍", "🌙", "⭐",  # 6-11: Elements
    "🌈", "🎯", "🎲", "🎨", "🎭", "🎪",  # 12-17: Art
    "🎬", "🎮", "🎯", "🎲", "🎨", "🎭",  # 18-23: Play
]

# Monster Group dimensions
MONSTER_71 = 71  # Supersingular prime
MONSTER_59 = 59  # Supersingular prime  
MONSTER_47 = 47  # Supersingular prime
MONSTER_GROUP = MONSTER_71 * MONSTER_59 * MONSTER_47  # 196,883

def da51_to_monster_coords(da51_addr):
    """Convert DA51 address to Monster Group coordinates"""
    addr = int(da51_addr, 16) if isinstance(da51_addr, str) else da51_addr
    
    # Extract fields
    prefix = (addr >> 48) & 0xFFFF
    type_field = (addr >> 44) & 0xF
    data = addr & 0xFFFFFFFFFFF
    
    # Map to Monster Group (71×59×47)
    coord_71 = data % MONSTER_71
    coord_59 = (data // MONSTER_71) % MONSTER_59
    coord_47 = (data // (MONSTER_71 * MONSTER_59)) % MONSTER_47
    
    return (coord_71, coord_59, coord_47, type_field)

def monster_coords_to_emoji3(coord_71, coord_59, coord_47):
    """Map Monster coordinates to 3 emojis (24^3 encoding)"""
    
    # Map 71 → 24 (with periodicity)
    emoji1_idx = coord_71 % 24
    
    # Map 59 → 24 (with symmetry)
    emoji2_idx = coord_59 % 24
    
    # Map 47 → 24 (with Bott periodicity)
    emoji3_idx = coord_47 % 24
    
    return (
        EMOJI_ALPHABET[emoji1_idx],
        EMOJI_ALPHABET[emoji2_idx],
        EMOJI_ALPHABET[emoji3_idx]
    )

def encode_visual_properties(coord_71, coord_59, coord_47, type_field):
    """Encode Monster symmetries into visual properties"""
    
    # Color (from 71-coordinate, 8-fold Bott periodicity)
    bott_class = coord_71 % 8
    colors = [
        "#00ff00",  # 0: Green (identity)
        "#00ff88",  # 1: Cyan
        "#0088ff",  # 2: Blue
        "#8800ff",  # 3: Purple
        "#ff0088",  # 4: Magenta
        "#ff8800",  # 5: Orange
        "#ffff00",  # 6: Yellow
        "#88ff00",  # 7: Lime (back to green)
    ]
    color = colors[bott_class]
    
    # Size (from 59-coordinate, supersingular scaling)
    size_scale = 0.5 + (coord_59 / MONSTER_59) * 1.5  # 0.5x to 2x
    
    # Spacing (from 47-coordinate, prime periodicity)
    spacing = 1 + (coord_47 / MONSTER_47) * 2  # 1 to 3 units
    
    # Shape (from type field, 6 types)
    shapes = ["cube", "sphere", "torus", "octahedron", "dodecahedron", "icosahedron"]
    shape = shapes[type_field % 6]
    
    # Rotation (Monster Group element)
    rotation_speed = (coord_71 + coord_59 + coord_47) / MONSTER_GROUP
    
    return {
        "color": color,
        "size": size_scale,
        "spacing": spacing,
        "shape": shape,
        "rotation": rotation_speed,
        "bott_class": bott_class,
    }

def create_emoji_url(da51_addr, emoji_triple, visual_props):
    """Create URL encoding all data"""
    
    e1, e2, e3 = emoji_triple
    
    # URL-encode emojis
    import urllib.parse
    emoji_encoded = urllib.parse.quote(f"{e1}{e2}{e3}")
    
    # Encode visual properties as URL params
    params = {
        'emoji': emoji_encoded,
        'da51': da51_addr,
        'color': visual_props['color'].replace('#', ''),
        'size': f"{visual_props['size']:.2f}",
        'spacing': f"{visual_props['spacing']:.2f}",
        'shape': visual_props['shape'],
        'rotation': f"{visual_props['rotation']:.4f}",
        'bott': visual_props['bott_class'],
    }
    
    param_str = '&'.join(f"{k}={v}" for k, v in params.items())
    url = f"https://solana.solfunmeme.com/node/nft-3d-qr.html?{param_str}"
    
    return url

def generate_nft_with_symmetries(da51_addr, type_name, description):
    """Generate NFT with full Monster Group encoding"""
    
    # Get Monster coordinates
    coord_71, coord_59, coord_47, type_field = da51_to_monster_coords(da51_addr)
    
    # Map to emoji triple
    emoji_triple = monster_coords_to_emoji3(coord_71, coord_59, coord_47)
    
    # Encode visual properties
    visual_props = encode_visual_properties(coord_71, coord_59, coord_47, type_field)
    
    # Create URL
    url = create_emoji_url(da51_addr, emoji_triple, visual_props)
    
    # NFT metadata
    nft = {
        "name": f"DA51 {''.join(emoji_triple)} - {type_name}",
        "description": description,
        "image": url,
        "animation_url": url,
        "external_url": url,
        "attributes": [
            {"trait_type": "Emoji Code", "value": ''.join(emoji_triple)},
            {"trait_type": "DA51 Address", "value": da51_addr},
            {"trait_type": "Monster 71", "value": coord_71},
            {"trait_type": "Monster 59", "value": coord_59},
            {"trait_type": "Monster 47", "value": coord_47},
            {"trait_type": "Bott Class", "value": visual_props['bott_class']},
            {"trait_type": "Color", "value": visual_props['color']},
            {"trait_type": "Size", "value": visual_props['size']},
            {"trait_type": "Spacing", "value": visual_props['spacing']},
            {"trait_type": "Shape", "value": visual_props['shape']},
            {"trait_type": "Rotation", "value": visual_props['rotation']},
            {"trait_type": "Monster Group", "value": "71×59×47"},
        ]
    }
    
    return nft, emoji_triple, visual_props

def main():
    # Load DA51 types
    with open('da51-nft-collection.json') as f:
        collection = json.load(f)
    
    print("Encoding DA51 types with Monster Group symmetries...")
    print("=" * 60)
    
    enhanced_nfts = []
    
    for nft in collection['nfts']:
        type_num = nft['attributes'][0]['value']
        type_name = nft['attributes'][1]['value']
        description = nft['description']
        
        # Get example address
        example = next((a['value'] for a in nft['attributes'] if a['trait_type'] == 'Example'), None)
        if not example:
            example = f"0xDA51{type_num:01X}000000000000"
        
        # Generate enhanced NFT
        enhanced, emoji_triple, visual = generate_nft_with_symmetries(example, type_name, description)
        enhanced_nfts.append(enhanced)
        
        print(f"\nType {type_num}: {type_name}")
        print(f"  Emoji: {''.join(emoji_triple)}")
        print(f"  Monster: ({enhanced['attributes'][2]['value']}, {enhanced['attributes'][3]['value']}, {enhanced['attributes'][4]['value']})")
        print(f"  Bott Class: {visual['bott_class']}")
        print(f"  Color: {visual['color']}")
        print(f"  Shape: {visual['shape']}")
        print(f"  URL: {enhanced['animation_url'][:80]}...")
    
    # Save enhanced collection
    enhanced_collection = {
        "name": "DA51 Monster Group NFT Collection",
        "description": "24^3 emoji encoding with Monster Group symmetries (71×59×47)",
        "nfts": enhanced_nfts
    }
    
    with open('da51-monster-nfts.json', 'w') as f:
        json.dump(enhanced_collection, indent=2, fp=f)
    
    print("\n" + "=" * 60)
    print(f"✓ Generated {len(enhanced_nfts)} Monster Group NFTs")
    print(f"✓ Saved to da51-monster-nfts.json")
    print(f"\nEncoding:")
    print(f"  24^3 = 13,824 emoji combinations")
    print(f"  71×59×47 = 196,883 Monster Group")
    print(f"  8-fold Bott periodicity")
    print(f"  6 geometric shapes")
    print(f"  Visual: color, size, spacing, rotation")

if __name__ == "__main__":
    main()
