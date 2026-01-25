# Solana P2P Sidechain with HME Knowledge Graph

## Architecture
- **Storage**: HME-encrypted RDFa shards (replaces RocksDB)
- **Validation**: Knowledge graph proofs
- **Execution**: eBPF + zkWASM
- **Consensus**: Proof-of-Knowledge

Each transaction references RDFa KB items that argue for its validity.
