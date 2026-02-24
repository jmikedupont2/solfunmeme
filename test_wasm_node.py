#!/usr/bin/env python3
"""Test SOLFUNMEME WASM node in headless browser"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import time
import sys

URL = "https://solana.solfunmeme.com/node/distributed-node.html?hub=0&rpcs=WyJodHRwOi8vMTg1LjI2LjkuMTEzOjg4OTkiLCAiaHR0cDovLzIwNy4xNDguMTQuMjIwOjg4OTkiLCAiaHR0cDovLzg4LjIxNi4xOTguMjA1Ojg4OTkiLCAiaHR0cDovLzE4NS4xOTEuMTE3LjE0Mjo4ODk5IiwgImh0dHA6Ly8zNS4xNTkuMTA1Ljk4Ojg4OTkiLCAiaHR0cDovLzY3LjIxMy4xMjEuMjE5Ojg4OTkiLCAiaHR0cDovLzIxNi4yMzguMTAyLjg5Ojg4OTkiLCAiaHR0cDovLzEwMy4xNC4yNy45Nzo4ODk5IiwgImh0dHA6Ly83Mi40Ni44NC4xOTU6ODg5OSIsICJodHRwOi8vNS4xOTkuMTY0LjIyMDo4ODk5Il0&emoji=%F0%9F%8E%AE%F0%9F%8C%99%F0%9F%8E%A8&monster=10x24x24"

def test_wasm_node():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    
    driver = webdriver.Chrome(options=options)
    
    try:
        print(f"Loading {URL}...")
        driver.get(URL)
        
        # Wait for page load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "stats"))
        )
        print("✓ Page loaded")
        
        # Check initial stats
        stats = driver.find_element(By.ID, "stats").text
        print(f"Initial stats: {stats}")
        
        # Check for WASM errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print("✗ Browser errors:")
            for err in errors:
                print(f"  {err['message']}")
            return False
        
        print("✓ No browser errors")
        
        # Click button
        button = driver.find_element(By.XPATH, "//button[contains(text(), 'Get Signatures')]")
        print("Clicking 'Get Signatures'...")
        button.click()
        
        # Wait for response
        time.sleep(5)
        
        # Check output
        output = driver.find_element(By.ID, "output").text
        print(f"Output: {output[:200]}...")
        
        # Check updated stats
        stats = driver.find_element(By.ID, "stats").text
        print(f"Updated stats: {stats}")
        
        # Check logs again
        logs = driver.get_log('browser')
        for log in logs[-10:]:
            print(f"  [{log['level']}] {log['message']}")
        
        print("✓ Test complete")
        return True
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    success = test_wasm_node()
    sys.exit(0 if success else 1)
