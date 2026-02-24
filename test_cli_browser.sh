#!/usr/bin/env bash
# CLI browser test with lynx

URL="https://jmikedupont2.github.io/solfunmeme/distributed-node.html"

echo "Testing with lynx (text browser)..."
lynx -dump "$URL" | head -30

echo ""
echo "Testing with curl (check resources)..."
curl -sI "$URL" | grep -E "HTTP|content-type"
curl -sI "${URL%/*}/pkg/solfunmeme_distributed_bg.wasm" | grep -E "HTTP|content-type|content-length"

echo ""
echo "✓ CLI test complete"
