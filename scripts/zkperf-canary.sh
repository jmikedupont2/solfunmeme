#!/bin/bash
# zkPerf Canary - Self-witnessing monitoring script
# Records its own perf/strace and generates ZK proof

set -euo pipefail

URL="https://www.solfunmeme.com"
DISCORD_WEBHOOK="${DISCORD_WEBHOOK_URL:-}"
PERF_DATA="/tmp/canary-perf-$$.data"
STRACE_LOG="/tmp/canary-strace-$$.log"

# Start perf recording of this script
perf record -o "$PERF_DATA" -e cycles,instructions,cache-misses,branches -p $$ &
PERF_PID=$!

# Start strace recording
strace -o "$STRACE_LOG" -f -tt -T -p $$ &
STRACE_PID=$!

# Monitoring function
monitor() {
    # HTTP check
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$URL")
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" -m 10 "$URL")
    
    # DNS check
    DNS=$(dig +short solfunmeme.com @8.8.8.8 | head -1)
    
    echo "$STATUS|$RESPONSE_TIME|$DNS"
}

# Run monitoring
RESULT=$(monitor)

# Stop perf/strace
kill -INT $PERF_PID 2>/dev/null || true
kill -INT $STRACE_PID 2>/dev/null || true
wait $PERF_PID 2>/dev/null || true
wait $STRACE_PID 2>/dev/null || true

# Generate zkPerf witness proof
zkperf witness \
    --perf "$PERF_DATA" \
    --strace "$STRACE_LOG" \
    --result "$RESULT" \
    --target "$URL" \
    --submit

# Cleanup
rm -f "$PERF_DATA" "$STRACE_LOG"
