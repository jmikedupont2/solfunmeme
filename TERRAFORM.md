# Terraform Infrastructure

See `~/terraform/solfunmeme/` for complete infrastructure as code.

## Quick Start

```bash
cd ~/terraform/solfunmeme
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your tokens
terraform init
terraform apply
```

Manages:
- Vercel deployment
- Cloudflare Workers + KV
- GitHub secrets + Pages
