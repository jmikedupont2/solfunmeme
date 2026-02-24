# Multi-Platform Deployment Guide

## Free Hosting Platforms (from Awesome-Web-Hosting-2026)

### Static Sites (WASM)
1. **GitHub Pages** ✓ (already configured)
2. **Vercel** ✓ (already configured)
3. **Netlify** - `netlify.toml`
4. **Cloudflare Pages** - Auto from GitHub
5. **Render** - Static site
6. **Surge.sh** - `surge public/`
7. **Tiiny.host** - Drag & drop
8. **Neocities** - Classic hosting

### Backend/API
1. **Cloudflare Workers** ✓ (already configured)
2. **Supabase** ✓ (PostgreSQL + API)
3. **Railway** - Docker deploy
4. **Fly.io** - Edge compute
5. **Deno Deploy** - Edge functions
6. **Cyclic** - Serverless
7. **Koyeb** - Global edge

### Database/Storage
1. **Supabase** ✓ - PostgreSQL
2. **PlanetScale** - MySQL
3. **Neon** - Serverless Postgres
4. **Turso** - Edge SQLite
5. **Upstash** - Redis

## Deployment Commands

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

### Render
```yaml
# render.yaml
services:
  - type: web
    name: solfunmeme-node
    env: static
    buildCommand: cd distributed-node && wasm-pack build --target web --out-dir ../public/pkg
    staticPublishPath: ./public
```

### Railway
```bash
railway login
railway init
railway up
```

### Fly.io
```bash
fly launch
fly deploy
```

### Deno Deploy
```bash
deployctl deploy --project=solfunmeme workers/sync-hub.js
```

## Multi-Hub Architecture

```
Browser
  ├─ GitHub Pages
  ├─ Vercel
  ├─ Netlify
  ├─ Cloudflare Pages
  ├─ Render
  └─ Surge

Backend
  ├─ Cloudflare Workers (KV)
  ├─ Supabase (PostgreSQL)
  ├─ Railway
  ├─ Fly.io
  └─ Deno Deploy

All sync 24 models via Supabase as source of truth
```

## Setup Priority

1. **Supabase** (database) - Run schema.sql
2. **Cloudflare Workers** - Deploy sync worker
3. **Netlify** - Connect GitHub repo
4. **Railway** - One-click deploy
5. **Fly.io** - Deploy edge functions

Each platform gets 24 models, all syncing through Supabase!
