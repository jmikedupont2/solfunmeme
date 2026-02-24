pub mod cache;
#[cfg(not(target_arch = "wasm32"))]
pub mod fetcher;

#[cfg(target_arch = "wasm32")]
pub mod wasm;

#[cfg(target_arch = "wasm32")]
pub mod sync;

#[cfg(not(target_arch = "wasm32"))]
pub mod p2p;

pub use cache::RpcCache;
#[cfg(not(target_arch = "wasm32"))]
pub use fetcher::CachedFetcher;

#[cfg(not(target_arch = "wasm32"))]
pub use p2p::{DistributedNode, WorkMessage};
