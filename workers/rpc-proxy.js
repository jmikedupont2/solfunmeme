export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/rpc') {
      const body = await request.json();
      
      const response = await fetch('https://api.mainnet-beta.solana.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      return new Response(await response.text(), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    return new Response('SOLFUNMEME RPC Proxy', { status: 200 });
  }
}
