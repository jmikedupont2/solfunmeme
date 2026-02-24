#!/usr/bin/env python3
"""Test 3D NFT QR rendering"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

URL = "https://solana.solfunmeme.com/node/nft-3d-qr.html?emoji=%F0%9F%8E%AE%F0%9F%8C%99%F0%9F%8E%A8"

def test_3d_nft():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print(f"Loading {URL}...")
        driver.get(URL)
        
        # Wait for rendering
        time.sleep(3)
        
        # Check elements
        emoji = driver.execute_script("return document.getElementById('emoji').textContent")
        hash_val = driver.execute_script("return document.getElementById('hash').textContent")
        story = driver.execute_script("return document.getElementById('story').textContent")
        
        print(f"✓ Emoji: {emoji}")
        print(f"✓ Hash: {hash_val}")
        print(f"✓ Story: {story}")
        
        # Check Three.js canvas
        canvas = driver.find_elements("tag name", "canvas")
        if canvas:
            print(f"✓ 3D canvas rendered")
        else:
            print(f"✗ No canvas found")
        
        # Check logs
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print("✗ Browser errors:")
            for err in errors:
                print(f"  {err['message']}")
        else:
            print("✓ No errors")
        
        print("\n✓ 3D NFT test complete")
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    test_3d_nft()
