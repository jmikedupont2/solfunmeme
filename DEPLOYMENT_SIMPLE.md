# Essential Deployment Stack

## Core Platforms (3)

### 1. GitHub Pages (Frontend)
- **WASM node** runs in browser
- **Auto-deploy** on push
- **Free hosting**
- Already configured ✓

### 2. Supabase (Database)
- **24 models** in PostgreSQL
- **Source of truth** for all platforms
- **REST API** for sync
- Schema: `supabase/schema.sql`

### 3. Vercel (Preview)
- **Branch deployments**
- **Auto-build** WASM
- **Fast CDN**
- Config: `vercel.json`

## Setup

```bash
# 1. Supabase
# Create project at supabase.com
# Run: supabase/schema.sql

# 2. GitHub Pages
# Already enabled on feature/distributed-node

# 3. Vercel
# Connect repo at vercel.com
# Auto-deploys on push
```

## URLs

- **GitHub Pages**: https://jmikedupont2.github.io/solfunmeme/distributed-node.html
- **Vercel**: https://solfunmeme-distributed.vercel.app
- **Supabase**: https://your-project.supabase.co

All 3 platforms sync 24 models via Supabase REST API.

**Simple, free, effective.** ✓
