#!/usr/bin/env bash
# Setup and run Firefox headless browser tests

set -e

echo "🦊 Setting up Firefox Headless Testing"
echo ""

# Check if geckodriver is installed
if ! command -v geckodriver &> /dev/null; then
    echo "📦 Installing geckodriver..."
    nix-shell -p geckodriver --run "geckodriver --version"
fi

# Start geckodriver in background
echo "🚀 Starting geckodriver..."
nix-shell -p geckodriver firefox --run "geckodriver --port 4444" > /tmp/geckodriver.log 2>&1 &
GECKO_PID=$!
echo "   PID: $GECKO_PID"

# Wait for geckodriver to start
sleep 3

# Check if dev server is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Dev server not running on port 3001"
    echo "   Start it with: pnpm dev"
    kill $GECKO_PID
    exit 1
fi

echo "✓ Dev server is running"
echo ""

# Run Rust browser tests
echo "🧪 Running browser tests..."
cd browser-bench
nix-shell -p rustc cargo --run "cargo run --release"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
kill $GECKO_PID 2>/dev/null || true

echo "✅ Done!"
