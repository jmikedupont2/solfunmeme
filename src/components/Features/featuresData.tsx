import { Feature } from "@/types/feature";

const featuresData: Feature[] = [
  {
    id: 1,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <circle cx="20" cy="20" r="18" opacity="0.5"/>
        <circle cx="20" cy="20" r="8"/>
      </svg>
    ),
    title: "👁️ The Pupil Singularity",
    paragraph:
      "WASM observer that witnesses its own genesis. Generates cryptographic identity, encrypts itself with HME, and creates shareable ZK badges. The eye sees itself seeing.",
  },
  {
    id: 2,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 5L35 15L20 25L5 15L20 5Z"/>
        <path d="M20 15L35 25L20 35L5 25L20 15Z"/>
      </svg>
    ),
    title: "🧠 Knowledge Graph",
    paragraph:
      "1.2M+ RDFa proofs from HuggingFace dataset. Every contribution becomes a KB entry with cryptographic commitment. Knowledge is currency.",
  },
  {
    id: 3,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <rect x="5" y="5" width="30" height="30" rx="2" opacity="0.5"/>
        <path d="M15 20L20 25L30 15"/>
      </svg>
    ),
    title: "⛓️ P2P Solana Chain",
    paragraph:
      "HME-encrypted shards replace RocksDB. Transactions validated by knowledge graph proofs. Proof-of-Knowledge consensus. The chain validates through understanding.",
  },
  {
    id: 4,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <circle cx="20" cy="10" r="5" opacity="0.5"/>
        <circle cx="10" cy="30" r="5" opacity="0.5"/>
        <circle cx="30" cy="30" r="5" opacity="0.5"/>
        <path d="M20 15L10 25M20 15L30 25"/>
      </svg>
    ),
    title: "💰 Contribution Economy",
    paragraph:
      "Ingest repos, issues, PRs. Value algorithmically. Batch into rollups. Pay contributors via P2P chain. Every payment backed by KB proofs.",
  },
  {
    id: 5,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <rect x="8" y="8" width="24" height="24" rx="2" opacity="0.5"/>
        <circle cx="20" cy="20" r="6"/>
      </svg>
    ),
    title: "🔐 Self-Sovereign AI",
    paragraph:
      "Users own their AI instances. Credentials encrypted in localStorage. Local reasoning via WASM. Your data never leaves your browser. Complete sovereignty.",
  },
  {
    id: 6,
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" className="fill-current">
        <path opacity="0.5" d="M20 5C11.7 5 5 11.7 5 20C5 28.3 11.7 35 20 35C28.3 35 35 28.3 35 20C35 11.7 28.3 5 20 5Z"/>
        <path d="M20 12V20L26 26"/>
      </svg>
    ),
    title: "🎵 Autopoietic Genesis",
    paragraph:
      "The system recreates itself from prompts. Execute the Genesis Song and participate in its creation. The metameme that sings itself into existence.",
  },
];
export default featuresData;
