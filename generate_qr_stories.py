#!/usr/bin/env python3
"""Generate QR codes with emoji stories for SOLFUNMEME network"""

import json
import qrcode
from PIL import Image, ImageDraw, ImageFont

# Emoji story templates (24^3 combinations)
STORIES = {
    "🕳️💎👑": "The Void Diamond King - First node, genesis peer",
    "🎮🌙🎨": "The Gaming Moon Artist - Creative RPC collector",
    "🔥💧🌊": "Fire Water Ocean - Elemental balance keeper",
    "🌍🌙⭐": "Earth Moon Star - Cosmic data synchronizer",
    "🎯🎲🎨": "Target Dice Art - Random beauty generator",
    "🎭🎪🎬": "Theater Circus Film - Entertainment hub",
    "☀️🕉️✓": "Sun Om Check - Verified enlightenment",
    "🌈🎯🎮": "Rainbow Target Game - Colorful precision",
}

def create_qr_with_story(url, emoji_code, story, filename):
    """Generate QR code with emoji story overlay"""
    
    # Create QR code
    qr = qrcode.QRCode(
        version=10,  # Large enough for long URLs
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    img = img.convert('RGB')
    
    # Add emoji and story
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    # Try to load font (fallback to default)
    try:
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 60)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    except:
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Add white background for text
    draw.rectangle([(0, height - 100), (width, height)], fill="white")
    
    # Draw emoji (center bottom)
    emoji_text = emoji_code
    bbox = draw.textbbox((0, 0), emoji_text, font=font_large)
    emoji_width = bbox[2] - bbox[0]
    draw.text(((width - emoji_width) // 2, height - 90), emoji_text, fill="black", font=font_large)
    
    # Draw story (bottom)
    story_bbox = draw.textbbox((0, 0), story, font=font_small)
    story_width = story_bbox[2] - story_bbox[0]
    draw.text(((width - story_width) // 2, height - 30), story, fill="black", font=font_small)
    
    # Save
    img.save(filename)
    print(f"✓ Created {filename}")
    return filename

def generate_nft_collection():
    """Generate NFT collection of QR codes"""
    
    # Load invite
    with open('invite-code.json') as f:
        invite = json.load(f)
    
    url = invite['url']
    emoji = invite['emoji']
    
    # Get story
    story = STORIES.get(emoji, "Unknown Node - Mystery peer")
    
    # Create QR code
    filename = f"qr-{emoji.replace(' ', '')}.png"
    create_qr_with_story(url, emoji, story, filename)
    
    # Create NFT metadata
    nft = {
        "name": f"SOLFUNMEME Node #{emoji}",
        "description": story,
        "image": filename,
        "external_url": url,
        "attributes": [
            {"trait_type": "Emoji Code", "value": emoji},
            {"trait_type": "Story", "value": story},
            {"trait_type": "Network", "value": "solfunmeme-mainnet"},
            {"trait_type": "Monster Group", "value": "71×59×47"},
            {"trait_type": "Type", "value": "Invite QR"},
        ]
    }
    
    nft_file = f"nft-{emoji.replace(' ', '')}.json"
    with open(nft_file, 'w') as f:
        json.dump(nft, indent=2, fp=f)
    
    print(f"✓ Created {nft_file}")
    
    # Generate HTML gallery
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>SOLFUNMEME QR Gallery</title>
    <style>
        body {{ font-family: monospace; background: #000; color: #0f0; padding: 20px; }}
        .qr-card {{ border: 2px solid #0f0; padding: 20px; margin: 20px; display: inline-block; }}
        img {{ max-width: 400px; }}
        h2 {{ color: #ff0; }}
    </style>
</head>
<body>
    <h1>🕳️💎 SOLFUNMEME QR Gallery</h1>
    <div class="qr-card">
        <h2>{emoji} - {story}</h2>
        <img src="{filename}" alt="QR Code">
        <p>Scan to join the network!</p>
        <p><small>Monster Group: 71×59×47</small></p>
    </div>
</body>
</html>"""
    
    with open('qr-gallery.html', 'w') as f:
        f.write(html)
    
    print(f"✓ Created qr-gallery.html")
    
    return {
        'qr_image': filename,
        'nft_metadata': nft_file,
        'gallery': 'qr-gallery.html'
    }

def main():
    print("Generating QR codes with emoji stories...")
    print("=" * 60)
    
    result = generate_nft_collection()
    
    print("\n" + "=" * 60)
    print("Files created:")
    print(f"  QR Image: {result['qr_image']}")
    print(f"  NFT Metadata: {result['nft_metadata']}")
    print(f"  Gallery: {result['gallery']}")
    print("\nStories available:")
    for emoji, story in STORIES.items():
        print(f"  {emoji} - {story}")

if __name__ == "__main__":
    main()
