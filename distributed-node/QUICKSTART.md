# SOLFUNMEME Distributed Node

**Cross-platform P2P node for distributed RPC caching and inflow tracing**

## Quick Start

### Windows
```cmd
solfunmeme-node.exe 4001
```

### Android (Termux)
```bash
chmod +x solfunmeme-node
./solfunmeme-node 4001
```

### Linux
```bash
cd /mnt/data1/time-2026/02-february/22/dasl/rust/solfunmeme_distributed
cargo run --release --bin node 4001
```

## What It Does

1. **Caches all RPC calls** to disk (never re-fetch)
2. **Discovers peers** automatically via mDNS
3. **Shares cache** with teammates via libp2p gossipsub
4. **Traces inflows** to ultimate sources collaboratively

## Port Numbers

- **4001**: Node 1 (you)
- **4002**: Node 2 (teammate)
- **4003**: Node 3 (teammate)
- **4004**: Node 4 (teammate)

Nodes auto-discover on same network.

## Cache Location

- Windows: `./cache_node_4001/`
- Android: `./cache_node_4001/`
- Linux: `./cache_node_4001/`

## Stats

Every 30 seconds shows:
```
📊 STATS:
  Cache hits: 1,234
  Cache misses: 567
  RPC calls: 567
  Hit rate: 68.5%
  Disk cache: 1,801 entries (45.23 MB)
```

## Network

Nodes broadcast:
- Cache availability
- Work assignments
- Fetch requests/responses

## Build from Source

```bash
cd rust/solfunmeme_distributed
cargo build --release --bin node
```

Binary at: `target/release/node`

## GitHub Actions

Automated builds for:
- Windows x86_64
- Android ARM64

Download from Actions artifacts.

🕳️💎 **Distributed SOLFUNMEME data acquisition**
