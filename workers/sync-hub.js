const HUBS = {
  hf: 'https://huggingface.co/spaces/jmikedupont2/solfunmeme-node',
  vercel: 'https://solfunmeme-distributed.vercel.app',
  cf: 'https://solfunmeme.workers.dev'
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Get models
    if (url.pathname === '/models') {
      const models = await env.MODELS.get('state') || '[]';
      return new Response(models, {
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Update model
    if (url.pathname === '/update' && request.method === 'POST') {
      const { id, data, timestamp } = await request.json();
      const models = JSON.parse(await env.MODELS.get('state') || '[]');
      
      if (models[id]) {
        if (timestamp > models[id].timestamp) {
          models[id] = { id, data, timestamp, hub: 'cf', hash: `${id}${timestamp}` };
          await env.MODELS.put('state', JSON.stringify(models));
        }
      }
      
      return new Response(JSON.stringify(models[id]), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    // Sync with other hubs
    if (url.pathname === '/sync') {
      const models = JSON.parse(await env.MODELS.get('state') || '[]');
      let synced = 0;
      
      for (const [name, hub] of Object.entries(HUBS)) {
        if (name === 'cf') continue;
        try {
          const resp = await fetch(`${hub}/models`);
          const otherModels = await resp.json();
          
          for (let i = 0; i < 24; i++) {
            if (otherModels[i] && otherModels[i].timestamp > (models[i]?.timestamp || 0)) {
              models[i] = otherModels[i];
              synced++;
            }
          }
        } catch (e) {}
      }
      
      await env.MODELS.put('state', JSON.stringify(models));
      return new Response(JSON.stringify({ synced }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    return new Response('SOLFUNMEME 24-Model Sync Hub', { status: 200 });
  },
  
  async scheduled(event, env) {
    // Auto-sync every minute
    await this.fetch(new Request('https://solfunmeme.workers.dev/sync'), env);
  }
}
