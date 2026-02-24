use libp2p::{
    futures::StreamExt,
    gossipsub, mdns, noise,
    swarm::{NetworkBehaviour, SwarmEvent},
    tcp, yamux, PeerId, Swarm,
};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::error::Error;

#[derive(NetworkBehaviour)]
pub struct DistributedBehaviour {
    pub gossipsub: gossipsub::Behaviour,
    pub mdns: mdns::tokio::Behaviour,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum WorkMessage {
    FetchRequest {
        method: String,
        params: serde_json::Value,
        requester: String,
    },
    FetchResponse {
        method: String,
        params: serde_json::Value,
        response: serde_json::Value,
    },
    CacheShare {
        cache_keys: Vec<String>,
    },
    WorkAssignment {
        accounts: Vec<String>,
        depth: usize,
    },
}

pub struct DistributedNode {
    pub swarm: Swarm<DistributedBehaviour>,
    pub peers: HashSet<PeerId>,
    pub topic: gossipsub::IdentTopic,
}

impl DistributedNode {
    pub async fn new() -> Result<Self, Box<dyn Error>> {
        let local_key = libp2p::identity::Keypair::generate_ed25519();
        let local_peer_id = PeerId::from(local_key.public());
        
        println!("🕳️ Local peer id: {}", local_peer_id);
        
        // Gossipsub config
        let gossipsub_config = gossipsub::ConfigBuilder::default()
            .heartbeat_interval(std::time::Duration::from_secs(1))
            .validation_mode(gossipsub::ValidationMode::Strict)
            .build()
            .expect("Valid config");
        
        let mut gossipsub = gossipsub::Behaviour::new(
            gossipsub::MessageAuthenticity::Signed(local_key.clone()),
            gossipsub_config,
        )?;
        
        let topic = gossipsub::IdentTopic::new("solfunmeme-distributed");
        gossipsub.subscribe(&topic)?;
        
        let mdns = mdns::tokio::Behaviour::new(
            mdns::Config::default(),
            local_peer_id,
        )?;
        
        let behaviour = DistributedBehaviour { gossipsub, mdns };
        
        let swarm = libp2p::SwarmBuilder::with_new_identity()
            .with_tokio()
            .with_tcp(
                tcp::Config::default(),
                noise::Config::new,
                yamux::Config::default,
            )?
            .with_behaviour(|_| behaviour)?
            .build();
        
        Ok(Self {
            swarm,
            peers: HashSet::new(),
            topic,
        })
    }
    
    pub async fn listen(&mut self, port: u16) -> Result<(), Box<dyn Error>> {
        self.swarm.listen_on(format!("/ip4/0.0.0.0/tcp/{}", port).parse()?)?;
        println!("🌐 Listening on port {}", port);
        Ok(())
    }
    
    pub fn broadcast(&mut self, message: &WorkMessage) -> Result<(), Box<dyn Error>> {
        let data = serde_json::to_vec(message)?;
        self.swarm
            .behaviour_mut()
            .gossipsub
            .publish(self.topic.clone(), data)?;
        Ok(())
    }
    
    pub async fn run(&mut self) -> Result<(), Box<dyn Error>> {
        loop {
            match self.swarm.select_next_some().await {
                SwarmEvent::Behaviour(event) => {
                    self.handle_behaviour_event(event).await?;
                }
                SwarmEvent::NewListenAddr { address, .. } => {
                    println!("📡 Listening on {}", address);
                }
                SwarmEvent::ConnectionEstablished { peer_id, .. } => {
                    println!("🤝 Connected to peer: {}", peer_id);
                    self.peers.insert(peer_id);
                }
                SwarmEvent::ConnectionClosed { peer_id, .. } => {
                    println!("👋 Disconnected from peer: {}", peer_id);
                    self.peers.remove(&peer_id);
                }
                _ => {}
            }
        }
    }
    
    async fn handle_behaviour_event(
        &mut self,
        event: DistributedBehaviourEvent,
    ) -> Result<(), Box<dyn Error>> {
        match event {
            DistributedBehaviourEvent::Mdns(mdns::Event::Discovered(list)) => {
                for (peer_id, _multiaddr) in list {
                    println!("🔍 Discovered peer: {}", peer_id);
                    self.swarm
                        .behaviour_mut()
                        .gossipsub
                        .add_explicit_peer(&peer_id);
                }
            }
            DistributedBehaviourEvent::Mdns(mdns::Event::Expired(list)) => {
                for (peer_id, _multiaddr) in list {
                    println!("⏰ Peer expired: {}", peer_id);
                    self.swarm
                        .behaviour_mut()
                        .gossipsub
                        .remove_explicit_peer(&peer_id);
                }
            }
            DistributedBehaviourEvent::Gossipsub(gossipsub::Event::Message {
                message,
                ..
            }) => {
                if let Ok(work_msg) = serde_json::from_slice::<WorkMessage>(&message.data) {
                    println!("📨 Received: {:?}", work_msg);
                    // Handle work message
                }
            }
            _ => {}
        }
        Ok(())
    }
}
