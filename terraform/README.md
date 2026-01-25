# Supabase OAuth Terraform Configuration

## Setup

1. **Get Supabase Access Token**:
   ```bash
   # Login to Supabase CLI
   npx supabase login
   
   # Get access token
   npx supabase projects api-keys --project-ref opczaaftecjpremkwwxi
   ```

2. **Create `terraform.tfvars`** (gitignored):
   ```hcl
   supabase_access_token = "sbp_xxxxx"
   
   # Add as you get them
   google_client_id     = "xxxxx.apps.googleusercontent.com"
   google_client_secret = "xxxxx"
   
   github_client_id     = "xxxxx"
   github_client_secret = "xxxxx"
   
   discord_client_id     = "xxxxx"
   discord_client_secret = "xxxxx"
   
   twitter_client_id     = "xxxxx"
   twitter_client_secret = "xxxxx"
   ```

3. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

4. **Apply Configuration**:
   ```bash
   terraform plan
   terraform apply
   ```

## OAuth Provider Setup Links

### Google
- Console: https://console.cloud.google.com/apis/credentials
- Redirect URI: `https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback`

### GitHub
- Settings: https://github.com/settings/developers
- New OAuth App: https://github.com/settings/applications/new
- Redirect URI: `https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback`

### Discord
- Portal: https://discord.com/developers/applications
- Create Application → OAuth2
- Redirect URI: `https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback`

### Twitter
- Portal: https://developer.twitter.com/en/portal/dashboard
- Create App → User authentication settings
- Callback URI: `https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback`

### Twitch
- Console: https://dev.twitch.tv/console/apps
- Register Application
- Redirect URI: `https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback`

### Telegram
- Bot: https://t.me/BotFather
- Create bot with `/newbot`
- Get token

## Workflow

1. Create OAuth app on provider's platform
2. Copy Client ID and Secret
3. Add to `terraform.tfvars`
4. Run `terraform apply`
5. Provider is automatically configured in Supabase!

## Benefits

- **Version Control**: OAuth config as code
- **Reproducible**: Easy to recreate in new environments
- **Secure**: Secrets in tfvars (gitignored)
- **Automated**: No manual clicking in Supabase dashboard
- **Documented**: All providers in one place

## Alternative: Manual Setup

If Terraform provider doesn't support auth settings yet, use this script:

```bash
#!/bin/bash
# scripts/configure-oauth.sh

SUPABASE_PROJECT_REF="opczaaftecjpremkwwxi"
SUPABASE_ACCESS_TOKEN="$1"

# Google
curl -X PATCH "https://api.supabase.com/v1/projects/$SUPABASE_PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "external": {
      "google": {
        "enabled": true,
        "client_id": "'$GOOGLE_CLIENT_ID'",
        "client_secret": "'$GOOGLE_CLIENT_SECRET'"
      }
    }
  }'
```
