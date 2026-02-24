#!/usr/bin/env bash
# Quick test all endpoints with curl

CSV="rpc-endpoints/rpc_list.csv"
WORKING="rpc-endpoints-working.txt"

> "$WORKING"

echo "Testing RPC endpoints..."
total=0
working=0

tail -n +2 "$CSV" | while IFS=, read -r endpoint rest; do
    total=$((total + 1))
    
    # Try HTTP
    result=$(curl -s -m 3 -X POST "http://$endpoint" \
      -H "Content-Type: application/json" \
      -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' 2>&1)
    
    if echo "$result" | grep -q '"result":"ok"'; then
        echo "✓ http://$endpoint"
        echo "http://$endpoint" >> "$WORKING"
        working=$((working + 1))
    else
        echo "✗ $endpoint"
    fi
done

echo ""
echo "Results: $working working endpoints"
cat "$WORKING"
