#!/usr/bin/env python3
"""Visualize MiniZinc emoji matrix solution as 3D NFT"""

import json
import re

def parse_minizinc_output(output):
    """Parse MiniZinc solution"""
    
    # Extract symmetry score
    score_match = re.search(r'Symmetry Score: (\d+)', output)
    score = int(score_match.group(1)) if score_match else 0
    
    # Extract matrix (first layer)
    matrix_lines = []
    in_matrix = False
    for line in output.split('\n'):
        if 'Emoji Matrix' in line:
            in_matrix = True
            continue
        if in_matrix and line.strip() and not line.startswith('9 Muses'):
            matrix_lines.append(line.strip())
        if '9 Muses' in line:
            break
    
    # Parse matrix values
    matrix = []
    for line in matrix_lines:
        if line:
            row = [int(x) for x in line.split() if x.isdigit()]
            if row:
                matrix.append(row)
    
    return {
        'score': score,
        'matrix': matrix,
        'size': len(matrix) if matrix else 0
    }

def matrix_to_3d_html(matrix_data, da51_type):
    """Convert matrix to 3D visualization"""
    
    matrix = matrix_data['matrix']
    score = matrix_data['score']
    size = matrix_data['size']
    
    # Emoji alphabet
    emojis = ["🕳️", "💎", "👑", "✓", "☀️", "🕉️", "🔥", "💧", "🌊", "🌍", 
              "🌙", "⭐", "🌈", "🎯", "🎲", "🎨", "🎭", "🎪", "🎬", "🎮",
              "🎯", "🎲", "🎨", "🎭"]
    
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>9 Muses Emoji Matrix - Type {da51_type}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body {{ margin: 0; background: #000; color: #0f0; font-family: monospace; }}
        #container {{ width: 100vw; height: 100vh; }}
        #info {{ position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.8); padding: 10px; }}
    </style>
</head>
<body>
    <div id="info">
        <h2>🕳️💎 9 Muses Emoji Matrix</h2>
        <p>DA51 Type: {da51_type}</p>
        <p>Symmetry Score: {score}</p>
        <p>Matrix Size: {size}×{size}×24</p>
        <p>Monster Group: 71×59×47</p>
    </div>
    <div id="container"></div>
    <script>
        const matrix = {json.dumps(matrix)};
        const emojis = {json.dumps(emojis)};
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({{ antialias: true }});
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('container').appendChild(renderer.domElement);
        
        // Create cubes from matrix
        const cubeSize = 0.4;
        const spacing = 0.5;
        
        matrix.forEach((row, i) => {{
            row.forEach((val, j) => {{
                if (val > 0) {{
                    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                    const hue = (val / 24) * 360;
                    const material = new THREE.MeshPhongMaterial({{ 
                        color: `hsl(${{hue}}, 100%, 50%)`,
                        emissive: `hsl(${{hue}}, 100%, 20%)`
                    }});
                    const cube = new THREE.Mesh(geometry, material);
                    
                    cube.position.x = (i - {size}/2) * spacing;
                    cube.position.y = (j - {size}/2) * spacing;
                    cube.position.z = 0;
                    
                    scene.add(cube);
                }}
            }});
        }});
        
        // Lights
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        scene.add(light);
        
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        
        camera.position.z = 20;
        
        // Animate
        function animate() {{
            requestAnimationFrame(animate);
            scene.rotation.y += 0.005;
            scene.rotation.x += 0.002;
            renderer.render(scene, camera);
        }}
        animate();
    </script>
</body>
</html>"""
    
    return html

def main():
    print("Run MiniZinc solver first:")
    print("  minizinc emoji_matrix_9muses.mzn emoji_matrix.dzn")
    print("\nThen visualize with this script")

if __name__ == "__main__":
    main()
