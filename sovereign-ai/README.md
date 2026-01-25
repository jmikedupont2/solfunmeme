# Self-Sovereign AI Instance

## Architecture
- **User Auth**: Google OAuth → Local storage (user-owned)
- **Private Instance**: Browser-based, no server tracking
- **WASM Closure**: Reasoning engine runs locally
- **Resource Management**: User adds/manages their own data
- **LLM Integration**: Gemini CLI via local credentials

## Flow
1. User authenticates with Google
2. Credentials stored in browser localStorage (encrypted)
3. User adds resources (repos, docs, datasets)
4. WASM observer witnesses and indexes
5. LLM reasoning happens in user's closure
6. All data stays local, user-owned

## Privacy
- No server-side credential storage
- All reasoning local
- User controls data
- Encrypted at rest in browser
