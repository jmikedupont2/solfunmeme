#!/usr/bin/env python3
"""9 Muses as Monster Group symmetry constraints"""

import json
import math

# 9 Muses (Greek mythology) mapped to Monster Group symmetries
MUSES = {
    "Calliope": {  # Epic Poetry
        "symmetry": "71-fold rotation",
        "constraint": lambda x: x % 71,
        "decoration": "spiral",
        "color": "#ff0000",
    },
    "Clio": {  # History
        "symmetry": "59-fold reflection",
        "constraint": lambda x: x % 59,
        "decoration": "timeline",
        "color": "#ff8800",
    },
    "Erato": {  # Love Poetry
        "symmetry": "47-fold duality",
        "constraint": lambda x: x % 47,
        "decoration": "heart",
        "color": "#ff00ff",
    },
    "Euterpe": {  # Music
        "symmetry": "8-fold Bott periodicity",
        "constraint": lambda x: x % 8,
        "decoration": "wave",
        "color": "#00ff00",
    },
    "Melpomene": {  # Tragedy
        "symmetry": "24-fold emoji cycle",
        "constraint": lambda x: x % 24,
        "decoration": "mask",
        "color": "#0000ff",
    },
    "Polyhymnia": {  # Sacred Poetry
        "symmetry": "196883-fold Monster",
        "constraint": lambda x: x % 196883,
        "decoration": "mandala",
        "color": "#8800ff",
    },
    "Terpsichore": {  # Dance
        "symmetry": "6-fold shape rotation",
        "constraint": lambda x: x % 6,
        "decoration": "spiral",
        "color": "#00ffff",
    },
    "Thalia": {  # Comedy
        "symmetry": "3-fold emoji triple",
        "constraint": lambda x: x % 3,
        "decoration": "triangle",
        "color": "#ffff00",
    },
    "Urania": {  # Astronomy
        "symmetry": "12-fold zodiac",
        "constraint": lambda x: x % 12,
        "decoration": "star",
        "color": "#ffffff",
    },
}

def apply_muse_constraints(da51_addr, rounds=9):
    """Apply 9 Muses as decoration rounds"""
    
    addr = int(da51_addr, 16) if isinstance(da51_addr, str) else da51_addr
    data = addr & 0xFFFFFFFFFFF
    
    decorations = []
    
    for round_num, (muse_name, muse) in enumerate(MUSES.items()):
        # Apply constraint
        value = muse['constraint'](data + round_num)
        
        # Calculate decoration parameters
        decoration = {
            "round": round_num,
            "muse": muse_name,
            "symmetry": muse['symmetry'],
            "value": value,
            "decoration": muse['decoration'],
            "color": muse['color'],
            "angle": (value / 360.0) * 2 * math.pi,
            "radius": 1 + (round_num * 0.5),
            "opacity": 1.0 - (round_num * 0.1),
        }
        
        decorations.append(decoration)
    
    return decorations

def pack_symmetries(decorations):
    """Pack all 9 symmetries into visual encoding"""
    
    # Layer 1: Calliope (71-fold) - Outer spiral
    # Layer 2: Clio (59-fold) - Timeline markers
    # Layer 3: Erato (47-fold) - Heart patterns
    # Layer 4: Euterpe (8-fold) - Wave oscillations
    # Layer 5: Melpomene (24-fold) - Emoji masks
    # Layer 6: Polyhymnia (196883-fold) - Central mandala
    # Layer 7: Terpsichore (6-fold) - Shape rotations
    # Layer 8: Thalia (3-fold) - Triangle base
    # Layer 9: Urania (12-fold) - Zodiac ring
    
    packed = {
        "layers": len(decorations),
        "total_symmetries": sum(d['value'] for d in decorations),
        "muse_encoding": ''.join(d['muse'][0] for d in decorations),  # CCEEEMPTTU
        "color_spectrum": [d['color'] for d in decorations],
        "radial_structure": [d['radius'] for d in decorations],
    }
    
    return packed

def generate_3d_with_muses(da51_addr, type_name):
    """Generate 3D NFT with 9 Muses decoration"""
    
    decorations = apply_muse_constraints(da51_addr, rounds=9)
    packed = pack_symmetries(decorations)
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>9 Muses: {type_name}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body {{ margin: 0; background: #000; color: #fff; font-family: monospace; }}
        #container {{ width: 100vw; height: 100vh; }}
        #info {{ position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 10px; }}
        .muse {{ font-size: 12px; margin: 2px 0; }}
    </style>
</head>
<body>
    <div id="info">
        <h2>🕳️💎 9 Muses: {type_name}</h2>
        <p>DA51: {da51_addr}</p>
        <div id="muses">
"""
    
    for dec in decorations:
        html += f'            <div class="muse" style="color: {dec["color"]}">{dec["muse"]}: {dec["symmetry"]} = {dec["value"]}</div>\n'
    
    html += f"""        </div>
        <p>Muse Code: {packed['muse_encoding']}</p>
    </div>
    <div id="container"></div>
    <script>
        const decorations = {json.dumps(decorations)};
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({{ antialias: true }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);
        
        // Create decoration layers
        decorations.forEach((dec, i) => {{
            const geometry = new THREE.TorusGeometry(dec.radius, 0.1, 16, 100);
            const material = new THREE.MeshPhongMaterial({{ 
                color: dec.color,
                transparent: true,
                opacity: dec.opacity
            }});
            const torus = new THREE.Mesh(geometry, material);
            torus.rotation.x = dec.angle;
            scene.add(torus);
        }});
        
        // Central sphere (Polyhymnia - Monster Group)
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({{ color: 0x8800ff }});
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);
        
        // Lights
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        camera.position.z = 10;
        
        // Animate with 9 Muses
        let time = 0;
        function animate() {{
            requestAnimationFrame(animate);
            time += 0.01;
            
            scene.children.forEach((child, i) => {{
                if (child.geometry && child.geometry.type === 'TorusGeometry') {{
                    const dec = decorations[i];
                    child.rotation.y = time * (dec.value / 100);
                }}
            }});
            
            renderer.render(scene, camera);
        }}
        animate();
    </script>
</body>
</html>"""
    
    return html

def main():
    # Load DA51 types
    with open('da51-nft-collection.json') as f:
        collection = json.load(f)
    
    print("Applying 9 Muses as Monster Group constraints...")
    print("=" * 60)
    
    muse_nfts = []
    
    for nft in collection['nfts']:
        type_num = nft['attributes'][0]['value']
        type_name = nft['attributes'][1]['value']
        
        example = next((a['value'] for a in nft['attributes'] if a['trait_type'] == 'Example'), None)
        if not example:
            example = f"0xDA51{type_num:01X}000000000000"
        
        # Apply 9 Muses
        decorations = apply_muse_constraints(example, rounds=9)
        packed = pack_symmetries(decorations)
        
        print(f"\nType {type_num}: {type_name}")
        print(f"  Muse Code: {packed['muse_encoding']}")
        print(f"  Total Symmetries: {packed['total_symmetries']}")
        
        for dec in decorations[:3]:  # Show first 3
            print(f"    {dec['muse']}: {dec['symmetry']} = {dec['value']}")
        
        # Generate 3D HTML
        html = generate_3d_with_muses(example, type_name)
        html_file = f"public/muses-type-{type_num}.html"
        
        with open(html_file, 'w') as f:
            f.write(html)
        
        print(f"  ✓ Created {html_file}")
        
        # Create NFT metadata
        muse_nft = {
            "name": f"9 Muses: {type_name}",
            "description": f"Monster Group symmetries decorated by 9 Muses in {len(decorations)} rounds",
            "animation_url": f"https://solana.solfunmeme.com/node/muses-type-{type_num}.html",
            "attributes": [
                {"trait_type": "DA51 Type", "value": type_num},
                {"trait_type": "Muse Code", "value": packed['muse_encoding']},
                {"trait_type": "Total Symmetries", "value": packed['total_symmetries']},
                {"trait_type": "Decoration Rounds", "value": len(decorations)},
            ] + [
                {"trait_type": f"Muse {i+1}", "value": f"{dec['muse']}: {dec['value']}"} 
                for i, dec in enumerate(decorations)
            ]
        }
        
        muse_nfts.append(muse_nft)
    
    # Save collection
    muse_collection = {
        "name": "9 Muses Monster Group NFT Collection",
        "description": "Each DA51 type decorated by 9 Muses with Monster Group symmetries",
        "muses": list(MUSES.keys()),
        "nfts": muse_nfts
    }
    
    with open('da51-muses-nfts.json', 'w') as f:
        json.dump(muse_collection, indent=2, fp=f)
    
    print("\n" + "=" * 60)
    print(f"✓ Generated {len(muse_nfts)} NFTs with 9 Muses")
    print(f"✓ Saved to da51-muses-nfts.json")
    print(f"\n9 Muses:")
    for muse, props in MUSES.items():
        print(f"  {muse}: {props['symmetry']}")

if __name__ == "__main__":
    main()
