#!/usr/bin/env python3
"""Encode DA51 Classification into NFT collection"""

import json
import re

def parse_da51_types(md_file):
    """Extract DA51 types from markdown"""
    
    with open(md_file) as f:
        content = f.read()
    
    # Find all type definitions
    type_pattern = r'### Type (\d+): (.+?)\n\*\*Purpose\*\*: (.+?)(?=\n\n|\n###|$)'
    types = re.findall(type_pattern, content, re.DOTALL)
    
    nfts = []
    
    for type_num, name, purpose in types:
        # Extract example if exists
        example_match = re.search(rf'Type {type_num}.*?\*\*Example\*\*: `(0x[0-9A-F]+)`', content, re.DOTALL)
        example = example_match.group(1) if example_match else None
        
        # Create NFT metadata
        nft = {
            "name": f"DA51 Type {type_num}: {name.strip()}",
            "description": purpose.strip(),
            "image": f"da51-type-{type_num}.png",
            "external_url": f"https://solana.solfunmeme.com/node/nft-3d-qr.html?da51={type_num}",
            "attributes": [
                {"trait_type": "DA51 Type", "value": int(type_num)},
                {"trait_type": "Type Name", "value": name.strip()},
                {"trait_type": "Prefix", "value": "0xDA51"},
                {"trait_type": "Monster Group", "value": "71×59×47"},
                {"trait_type": "Classification", "value": "DASL"},
            ]
        }
        
        if example:
            nft["attributes"].append({"trait_type": "Example", "value": example})
        
        nfts.append(nft)
    
    return nfts

def create_3d_nft_html(type_num, name, example):
    """Create 3D NFT HTML for DA51 type"""
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>DA51 Type {type_num}: {name}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body {{ margin: 0; background: #000; color: #0f0; font-family: monospace; }}
        #container {{ width: 100vw; height: 100vh; }}
        #info {{ position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 10px; }}
    </style>
</head>
<body>
    <div id="info">
        <h2>🕳️💎 DA51 Type {type_num}</h2>
        <p><strong>{name}</strong></p>
        <p>Example: <code>{example or 'N/A'}</code></p>
        <p>Monster Group: 71×59×47</p>
    </div>
    <div id="container"></div>
    <script>
        const typeNum = {type_num};
        const example = "{example or '0xDA510000000000'}";
        
        // Parse DA51 address
        const addr = BigInt(example);
        const prefix = (addr >> 48n) & 0xFFFFn;
        const type = (addr >> 44n) & 0xFn;
        const data = addr & 0xFFFFFFFFFFFn;
        
        // Create 3D visualization
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({{ antialias: true }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);
        
        // Create cubes based on type number
        const cubeSize = 1;
        const spacing = 2;
        
        for (let i = 0; i < typeNum + 1; i++) {{
            const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
            const material = new THREE.MeshPhongMaterial({{ 
                color: 0x00ff00,
                emissive: 0x003300
            }});
            const cube = new THREE.Mesh(geometry, material);
            
            const angle = (i / (typeNum + 1)) * Math.PI * 2;
            const radius = 5;
            cube.position.x = Math.cos(angle) * radius;
            cube.position.z = Math.sin(angle) * radius;
            
            scene.add(cube);
        }}
        
        // Lights
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        camera.position.y = 5;
        camera.position.z = 10;
        camera.lookAt(0, 0, 0);
        
        // Animate
        function animate() {{
            requestAnimationFrame(animate);
            scene.rotation.y += 0.01;
            renderer.render(scene, camera);
        }}
        animate();
    </script>
</body>
</html>"""
    
    return html

def main():
    md_file = '/mnt/data1/time-2026/02-february/22/dasl/DA51_PREFIX_CLASSIFICATION.md'
    
    print("Parsing DA51 Classification...")
    nfts = parse_da51_types(md_file)
    
    print(f"✓ Found {len(nfts)} DA51 types")
    
    # Save collection metadata
    collection = {
        "name": "DA51 Classification NFT Collection",
        "description": "Complete taxonomy of Monster Walk Addressing terms",
        "image": "da51-collection.png",
        "external_url": "https://solana.solfunmeme.com/node/",
        "nfts": nfts
    }
    
    with open('da51-nft-collection.json', 'w') as f:
        json.dump(collection, indent=2, fp=f)
    
    print(f"✓ Saved da51-nft-collection.json")
    
    # Create individual NFT files
    for nft in nfts:
        type_num = nft['attributes'][0]['value']
        filename = f"da51-type-{type_num}.json"
        
        with open(filename, 'w') as f:
            json.dump(nft, indent=2, fp=f)
        
        print(f"  Created {filename}")
    
    # Create 3D NFT HTML for first few types
    for nft in nfts[:3]:
        type_num = nft['attributes'][0]['value']
        name = nft['attributes'][1]['value']
        example = next((a['value'] for a in nft['attributes'] if a['trait_type'] == 'Example'), None)
        
        html = create_3d_nft_html(type_num, name, example)
        html_file = f"public/da51-type-{type_num}.html"
        
        with open(html_file, 'w') as f:
            f.write(html)
        
        print(f"  Created {html_file}")
    
    print(f"\n✓ DA51 NFT Collection complete!")
    print(f"  {len(nfts)} types encoded")
    print(f"  Monster Group: 71×59×47")

if __name__ == "__main__":
    main()
