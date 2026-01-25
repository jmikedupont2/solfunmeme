# Contribution Ingestion & Rollup Payment System

## Architecture
- **Ingest**: Git repos, issues, PRs → Knowledge Graph
- **Value**: Each contribution gets KB proof + commitment
- **Rollup**: Batch payments to contributors via P2P Solana chain
- **Proof**: Every payment backed by RDFa KB item

## Data Sources
- GitHub repos (meta-introspector, solfunmeme, etc.)
- Issues & PRs
- HuggingFace datasets
- Code commits
- Documentation

## Payment Model
- Contribution → KB entry → Valuation → Rollup payment
- Each KB item = proof of work
- Rollup aggregates weeks of contributions
- Single chain transaction pays all contributors
