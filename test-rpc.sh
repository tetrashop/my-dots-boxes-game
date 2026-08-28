#!/bin/bash

RPCS=(
  "https://ethereum-sepolia.publicnode.com"
  "https://sepolia.gateway.tenderly.co"
  "https://rpc.ankr.com/eth_sepolia"
  "https://rpc.sepolia.org"
)

for RPC in "${RPCS[@]}"; do
  echo -n "🔍 Testing $RPC ... "
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$RPC" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}')
  if [ "$RESPONSE" = "200" ]; then
    echo "✅ Working!"
    break
  else
    echo "❌ Failed (HTTP $RESPONSE)"
  fi
done
