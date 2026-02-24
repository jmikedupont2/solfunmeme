#!/usr/bin/env python3
"""Generate MiniZinc data file from target hash"""

import sys
import json

def hash_to_dzn(hash_hex):
    """Convert hex hash to MiniZinc data"""
    
    # Take first 16 hex chars
    hash_hex = hash_hex[:16]
    
    # Convert to array of 0-15 values
    values = [int(c, 16) for c in hash_hex]
    
    dzn = f"target_hash = {values};\n"
    
    return dzn

def main():
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        # Default: hash of "🎮🌙🎨"
        target = "a3f5c8d2e1b4f7a9"
    
    print(f"Target hash: {target}")
    print("\nMiniZinc data file:")
    print("=" * 60)
    
    dzn = hash_to_dzn(target)
    print(dzn)
    
    # Save
    with open('emoji_hash.dzn', 'w') as f:
        f.write(dzn)
    
    print("=" * 60)
    print("✓ Saved to emoji_hash.dzn")
    print("\nRun solver:")
    print("  minizinc emoji_hash_solver.mzn emoji_hash.dzn")

if __name__ == "__main__":
    main()
