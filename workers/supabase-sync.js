const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/models') {
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/models?select=*&order=id`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      return new Response(await resp.text(), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    if (url.pathname === '/update' && request.method === 'POST') {
      const { id, hub, data, timestamp, hash } = await request.json();
      
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/upsert_model`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_id: id, p_hub: hub, p_data: data, p_timestamp: timestamp, p_hash: hash })
      });
      
      return new Response(await resp.text(), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
    
    return new Response('Supabase Sync Hub', { status: 200 });
  }
}
