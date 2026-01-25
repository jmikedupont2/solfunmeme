terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

provider "supabase" {
  access_token = var.supabase_access_token
  project_ref  = "opczaaftecjpremkwwxi"
}

variable "supabase_access_token" {
  description = "Supabase management API token"
  type        = string
  sensitive   = true
}

# OAuth Provider Credentials (store in terraform.tfvars or env vars)
variable "google_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "google_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "github_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "github_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "discord_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "discord_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "twitter_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "twitter_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "telegram_bot_token" {
  type      = string
  sensitive = true
  default   = ""
}

variable "rumble_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "rumble_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

variable "tiktok_client_id" {
  type      = string
  sensitive = true
  default   = ""
}

variable "tiktok_client_secret" {
  type      = string
  sensitive = true
  default   = ""
}

# Site URLs
locals {
  site_url = "https://solfunmeme.com"
  redirect_urls = [
    "https://solfunmeme.com/profile",
    "http://localhost:3001/profile",
    "http://solana.solfunmeme.com:3001/profile"
  ]
}

# Google OAuth
resource "supabase_settings" "google_auth" {
  count = var.google_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      google = {
        enabled        = true
        client_id      = var.google_client_id
        client_secret  = var.google_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

# GitHub OAuth
resource "supabase_settings" "github_auth" {
  count = var.github_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      github = {
        enabled        = true
        client_id      = var.github_client_id
        client_secret  = var.github_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

# Discord OAuth
resource "supabase_settings" "discord_auth" {
  count = var.discord_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      discord = {
        enabled        = true
        client_id      = var.discord_client_id
        client_secret  = var.discord_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

# Twitter OAuth
resource "supabase_settings" "twitter_auth" {
  count = var.twitter_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      twitter = {
        enabled        = true
        client_id      = var.twitter_client_id
        client_secret  = var.twitter_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

# Telegram OAuth
resource "supabase_settings" "telegram_auth" {
  count = var.telegram_bot_token != "" ? 1 : 0
  
  auth = {
    external = {
      telegram = {
        enabled   = true
        bot_token = var.telegram_bot_token
      }
    }
  }
}

# Rumble OAuth
resource "supabase_settings" "rumble_auth" {
  count = var.rumble_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      rumble = {
        enabled        = true
        client_id      = var.rumble_client_id
        client_secret  = var.rumble_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

# TikTok OAuth
resource "supabase_settings" "tiktok_auth" {
  count = var.tiktok_client_id != "" ? 1 : 0
  
  auth = {
    external = {
      tiktok = {
        enabled        = true
        client_id      = var.tiktok_client_id
        client_secret  = var.tiktok_client_secret
        redirect_uri   = "https://opczaaftecjpremkwwxi.supabase.co/auth/v1/callback"
      }
    }
  }
}

output "configured_providers" {
  value = [
    var.google_client_id != "" ? "Google" : null,
    var.github_client_id != "" ? "GitHub" : null,
    var.discord_client_id != "" ? "Discord" : null,
    var.twitter_client_id != "" ? "Twitter" : null,
    var.telegram_bot_token != "" ? "Telegram" : null,
    var.rumble_client_id != "" ? "Rumble" : null,
    var.tiktok_client_id != "" ? "TikTok" : null,
  ]
  description = "List of configured OAuth providers"
}
