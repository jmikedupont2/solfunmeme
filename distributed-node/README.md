# SOLFUNMEME Distributed Fetcher

**Cached RPC + Libp2p P2P Network for Collaborative Data Acquisition**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DISTRIBUTED NETWORK                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Node 1 (Port 4001)          Node 2 (Port 4002)            │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ RPC Cache    │◄──────────►│ RPC Cache    │              │
│  │ ./cache_4001 │   libp2p   │ ./cache_4002 │              │
│  └──────────────┘  gossipsub └──────────────┘              │
│         │                            │                       │
│         ▼                            ▼                       │
│  Solana RPC                   Solana RPC                    │
│  (rate limited)               (rate limited)                │
│                                                              │
│  Node 3 (Port 4003)          Node 4 (Port 4004)            │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ RPC Cache    │◄──────────►│ RPC Cache    │              │
│  │ ./cache_4003 │   mdns     │ ./cache_4004 │              │
│  └──────────────┘  discovery └──────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Features

### 1. RPC Caching
- **Disk persistence**: SHA256-keyed cache files
- **Memory cache**: Fast lookups
- **Sharded storage**: First 2 chars of hash for directory organization
- **Stats tracking**: Hit rate, cache size, RPC calls

### 2. Libp2p P2P Network
- **mDNS discovery**: Automatic peer finding on local network
- **Gossipsub**: Broadcast work assignments and cache availability
- **TCP transport**: Reliable connections
- **Noise encryption**: Secure peer communication

### 3. Distributed Work
- **Work messages**: Fetch requests, responses, cache sharing
- **Load balancing**: Multiple nodes share RPC load
- **Cache sharing**: Peers announce available data
- **Collaborative tracing**: Split inflow analysis across nodes

## Usage

### Start Node 1
```bash
cd rust/solfunmeme_distributed
cargo run --release --bin node 4001
```

### Start Node 2 (teammate)
```bash
cargo run --release --bin node 4002
```

### Start Node 3 (teammate)
```bash
cargo run --release --bin node 4003
```

Nodes will automatically discover each other via mDNS and form a network.

## Cache Structure

```
cache_node_4001/
├── 00/
│   ├── 00a1b2c3d4e5f6...json
│   └── 00f9e8d7c6b5a4...json
├── 01/
│   └── 01234567890abc...json
├── 02/
...
└── ff/
    └── ffedcba9876543...json
```

Each file contains:
```json
{
  "method": "getSignaturesForAddress",
  "params": ["BwUTq7fS6sfUmHDwAiCQZ3asSiPEapW5zDrsbwtapump", {"limit": 10}],
  "response": {...},
  "timestamp": 1708750000
}
```

## Work Messages

### FetchRequest
```rust
WorkMessage::FetchRequest {
    method: "getTransaction",
    params: json!(["signature123..."]),
    requester: "peer_id_abc",
}
```

### FetchResponse
```rust
WorkMessage::FetchResponse {
    method: "getTransaction",
    params: json!(["signature123..."]),
    response: json!({...}),
}
```

### CacheShare
```rust
WorkMessage::CacheShare {
    cache_keys: vec!["account1", "account2", ...],
}
```

### WorkAssignment
```rust
WorkMessage::WorkAssignment {
    accounts: vec!["addr1", "addr2", ...],
    depth: 5,  // Trace 5 levels deep
}
```

## Stats Output

```
📊 STATS:
  Cache hits: 1,234
  Cache misses: 567
  RPC calls: 567
  Hit rate: 68.5%
  Disk cache: 1,801 entries (45.23 MB)
```

## Integration with Inflow Tracing

```rust
use solfunmeme_distributed::CachedFetcher;

let fetcher = CachedFetcher::new("./cache", "https://api.mainnet-beta.solana.com");

// First call hits RPC
let sigs = fetcher.fetch(
    "getSignaturesForAddress",
    json!([account, {"limit": 100}])
).await?;

// Second call hits cache (instant)
let sigs_cached = fetcher.fetch(
    "getSignaturesForAddress",
    json!([account, {"limit": 100}])
).await?;
```

## Benefits

### For Solo Use
- **No re-fetching**: Cache persists across runs
- **Faster development**: Instant responses for cached data
- **Cost savings**: Fewer RPC calls

### For Team Use
- **Shared load**: 4 nodes = 4x throughput
- **Redundancy**: If one node fails, others continue
- **Cache sharing**: Teammates benefit from each other's fetches
- **Distributed tracing**: Split 10,000 accounts across 4 nodes = 2,500 each

## Next Steps

1. **Implement work distribution**: Coordinator assigns accounts to nodes
2. **Add cache sync**: Nodes request missing data from peers
3. **Build inflow tracer**: Use distributed fetcher for ultimate source tracing
4. **Add rate limiting**: Respect RPC limits across all nodes
5. **Monitoring dashboard**: Web UI showing network status

## Monster Group Encoding

All cached data can be encoded to DASL-FRACTRAN:
- Cache key → Monster prime factorization
- Response size → Virasoro mode
- Timestamp → Bott periodicity class

**🕳️💎 Distributed data acquisition with Monster holographic preservation** ✓

