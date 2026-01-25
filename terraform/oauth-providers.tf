terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    github = {
      source  = "integrations/github"
      version = "~> 6.0"
    }
  }
}

variable "google_project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "github_token" {
  description = "GitHub personal access token"
  type        = string
  sensitive   = true
}

provider "google" {
  project = var.google_project_id
}

provider "github" {
  token = var.github_token
}

locals {
  redirect_uri = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
  site_url     = "https://solfunmeme.com"
}

# Google OAuth Client
resource "google_project_service" "oauth" {
  service = "iamcredentials.googleapis.com"
}

resource "google_oauth_client" "solfunmeme" {
  client_id     = "solfunmeme-web"
  client_name   = "SOLFUNMEME Web App"
  
  redirect_uris = [
    local.redirect_uri,
    "http://localhost:3001/profile"
  ]
  
  authorized_origins = [
    local.site_url,
    "http://localhost:3001"
  ]
}

# GitHub OAuth App
resource "github_oauth_application" "solfunmeme" {
  name              = "SOLFUNMEME"
  homepage_url      = local.site_url
  authorization_callback_url = local.redirect_uri
  
  description = "SOLFUNMEME - Zero Ontology System for sovereign AI agents"
}

# Discord OAuth App (manual - no Terraform provider)
# Create at: https://discord.com/developers/applications
# Instructions in outputs

# Twitter OAuth App (manual - no Terraform provider)
# Create at: https://developer.twitter.com/en/portal/dashboard
# Instructions in outputs

# Telegram Bot (manual - via BotFather)
# Create with: /newbot in https://t.me/BotFather
# Instructions in outputs

# Rumble OAuth (manual - no public API yet)
# Create at: https://rumble.com/account/developer
# Instructions in outputs

# TikTok OAuth (manual - requires business verification)
# Create at: https://developers.tiktok.com/
# Instructions in outputs

# Output credentials for Supabase configuration
output "google_client_id" {
  value       = google_oauth_client.solfunmeme.client_id
  description = "Google OAuth Client ID"
}

output "google_client_secret" {
  value       = google_oauth_client.solfunmeme.client_secret
  sensitive   = true
  description = "Google OAuth Client Secret (sensitive)"
}

output "github_client_id" {
  value       = github_oauth_application.solfunmeme.client_id
  description = "GitHub OAuth Client ID"
}

output "github_client_secret" {
  value       = github_oauth_application.solfunmeme.client_secret
  sensitive   = true
  description = "GitHub OAuth Client Secret (sensitive)"
}

output "manual_setup_instructions" {
  value = <<-EOT
  
  ✅ Automated (Terraform):
  - Google OAuth: ${google_oauth_client.solfunmeme.client_id}
  - GitHub OAuth: ${github_oauth_application.solfunmeme.client_id}
  
  📝 Manual Setup Required:
  
  1. Discord:
     - Go to: https://discord.com/developers/applications
     - Click "New Application" → Name: "SOLFUNMEME"
     - OAuth2 → Add Redirect: ${local.redirect_uri}
     - Copy Client ID and Secret
  
  2. Twitter/X:
     - Go to: https://developer.twitter.com/en/portal/dashboard
     - Create App → User authentication settings
     - Type: Web App
     - Callback URI: ${local.redirect_uri}
     - Copy Client ID and Secret
  
  3. Telegram:
     - Message @BotFather on Telegram
     - Send: /newbot
     - Follow prompts to create bot
     - Copy bot token
  
  4. Rumble:
     - Go to: https://rumble.com/account/developer
     - Create Application
     - Redirect URI: ${local.redirect_uri}
     - Copy Client ID and Secret
  
  5. TikTok:
     - Go to: https://developers.tiktok.com/
     - Create App → Login Kit
     - Redirect URI: ${local.redirect_uri}
     - Request scopes: user.info.basic
     - Copy Client Key and Secret
  
  Then add all credentials to terraform.tfvars and run:
  terraform apply -target=module.supabase_oauth
  
  EOT
}

# Save credentials to file for easy copying
resource "local_file" "credentials" {
  filename = "${path.module}/oauth-credentials.txt"
  content  = <<-EOT
  # OAuth Credentials for Supabase
  # Add these to terraform/supabase-oauth.tf terraform.tfvars
  
  google_client_id     = "${google_oauth_client.solfunmeme.client_id}"
  google_client_secret = "${google_oauth_client.solfunmeme.client_secret}"
  
  github_client_id     = "${github_oauth_application.solfunmeme.client_id}"
  github_client_secret = "${github_oauth_application.solfunmeme.client_secret}"
  
  # Add these after manual setup:
  # discord_client_id     = "xxxxx"
  # discord_client_secret = "xxxxx"
  # twitter_client_id     = "xxxxx"
  # twitter_client_secret = "xxxxx"
  # telegram_bot_token    = "xxxxx:xxxxx"
  # rumble_client_id      = "xxxxx"
  # rumble_client_secret  = "xxxxx"
  # tiktok_client_id      = "xxxxx"
  # tiktok_client_secret  = "xxxxx"
  EOT
  
  file_permission = "0600"
}
