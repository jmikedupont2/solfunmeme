# Production Monitoring Setup

**Immediate needs for solfunmeme.com downtime prevention**

---

## Quick Setup

### 1. OpenTelemetry (OTEL)
```bash
# Install OTEL collector
docker run -d --name otel-collector \
  -p 4317:4317 -p 4318:4318 \
  otel/opentelemetry-collector-contrib

# Configure for Vercel
cat > otel-config.yaml <<EOF
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  logging:
    loglevel: debug

service:
  pipelines:
    metrics:
      receivers: [otlp]
      exporters: [prometheus, logging]
EOF
```

### 2. UptimeRobot (Free Tier)
```bash
# Quick setup via API
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -d "api_key=$UPTIMEROBOT_KEY" \
  -d "friendly_name=SOLFUNMEME Main" \
  -d "url=https://www.solfunmeme.com" \
  -d "type=1" \
  -d "interval=300"

# DNS monitor
curl -X POST https://api.uptimerobot.com/v2/newMonitor \
  -d "api_key=$UPTIMEROBOT_KEY" \
  -d "friendly_name=SOLFUNMEME DNS" \
  -d "url=solfunmeme.com" \
  -d "type=5" \
  -d "interval=300"
```

### 3. Simple Canary Script
```bash
#!/bin/bash
# canary.sh - Run every 5 minutes via cron

URL="https://www.solfunmeme.com"
DISCORD_WEBHOOK="$DISCORD_WEBHOOK_URL"

# HTTP check
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$URL")

if [ "$STATUS" != "200" ]; then
  curl -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"🚨 SOLFUNMEME DOWN! Status: $STATUS\"}"
fi

# DNS check
DNS=$(dig +short solfunmeme.com | head -1)
if [ -z "$DNS" ]; then
  curl -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"🚨 DNS FAILURE for solfunmeme.com\"}"
fi

# Log
echo "$(date) | Status: $STATUS | Time: ${RESPONSE_TIME}s | DNS: $DNS" >> /var/log/canary.log
```

### 4. DNS Zone Monitoring
```bash
#!/bin/bash
# dns-monitor.sh

DOMAIN="solfunmeme.com"
EXPECTED_IPS="76.76.21.21"

# Check A records
ACTUAL=$(dig +short "$DOMAIN" @8.8.8.8)

if [ "$ACTUAL" != "$EXPECTED_IPS" ]; then
  curl -X POST "$DISCORD_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{\"content\":\"🚨 DNS MISMATCH! Expected: $EXPECTED_IPS, Got: $ACTUAL\"}"
fi

# Check nameservers
NS=$(dig +short NS "$DOMAIN" | sort)
echo "$(date) | Nameservers: $NS" >> /var/log/dns-monitor.log
```

---

## Cron Setup

```bash
# Add to crontab
crontab -e

# Run canary every 5 minutes
*/5 * * * * /usr/local/bin/canary.sh

# DNS check every 15 minutes
*/15 * * * * /usr/local/bin/dns-monitor.sh
```

---

## Alerts Configuration

### Discord Webhook
```bash
# Create webhook in Discord server settings
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### Telegram Bot
```bash
# Create bot via @BotFather
export TELEGRAM_BOT_TOKEN="..."
export TELEGRAM_CHAT_ID="..."

# Alert function
alert_telegram() {
  curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d "chat_id=$TELEGRAM_CHAT_ID" \
    -d "text=$1"
}
```

---

## Monitoring Targets

```yaml
# monitoring-targets.yaml
targets:
  - name: "Main Site"
    url: "https://www.solfunmeme.com"
    type: http
    interval: 300
    expected_status: 200
    timeout: 10
    
  - name: "Root Domain"
    url: "https://solfunmeme.com"
    type: http
    interval: 300
    expected_status: 308  # Redirect
    
  - name: "DNS A Record"
    domain: "solfunmeme.com"
    type: dns
    interval: 900
    expected: "76.76.21.21"
    
  - name: "Vercel Deployment"
    url: "https://solfunmeme.vercel.app"
    type: http
    interval: 300
    expected_status: 200
```

---

## Quick Rust Monitor

```rust
// monitor.rs - Minimal monitoring daemon
use reqwest;
use tokio::time::{interval, Duration};

#[tokio::main]
async fn main() {
    let mut ticker = interval(Duration::from_secs(300));
    
    loop {
        ticker.tick().await;
        check_site().await;
    }
}

async fn check_site() {
    let url = "https://www.solfunmeme.com";
    
    match reqwest::get(url).await {
        Ok(resp) => {
            let status = resp.status();
            let time = resp.elapsed().unwrap_or_default();
            
            if status != 200 {
                alert(&format!("🚨 Status: {}", status)).await;
            }
            
            println!("{} | {} | {:?}", chrono::Utc::now(), status, time);
        }
        Err(e) => {
            alert(&format!("🚨 ERROR: {}", e)).await;
        }
    }
}

async fn alert(msg: &str) {
    let webhook = std::env::var("DISCORD_WEBHOOK").unwrap();
    let _ = reqwest::Client::new()
        .post(&webhook)
        .json(&serde_json::json!({"content": msg}))
        .send()
        .await;
}
```

---

## Deploy Monitor

```bash
# Build
cargo build --release --bin monitor

# Run as systemd service
cat > /etc/systemd/system/solfunmeme-monitor.service <<EOF
[Unit]
Description=SOLFUNMEME Monitor
After=network.target

[Service]
Type=simple
User=monitor
Environment="DISCORD_WEBHOOK=https://discord.com/api/webhooks/..."
ExecStart=/usr/local/bin/monitor
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable solfunmeme-monitor
systemctl start solfunmeme-monitor
```

---

## Grafana Dashboard (Optional)

```bash
# Quick Grafana setup
docker run -d --name=grafana -p 3000:3000 grafana/grafana

# Add Prometheus data source
# Import dashboard: https://grafana.com/grafana/dashboards/
```

---

## Immediate Action Items

1. ✅ Set up UptimeRobot (5 min)
2. ✅ Deploy canary.sh cron job (5 min)
3. ✅ Configure Discord webhook (2 min)
4. ✅ Add DNS monitoring (5 min)
5. ⏳ Build Rust monitor (optional, 30 min)
6. ⏳ Set up Grafana (optional, 1 hour)

---

## Test Alerts

```bash
# Test Discord webhook
curl -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"content":"✅ Monitoring system online"}'

# Test canary
./canary.sh

# Test DNS monitor
./dns-monitor.sh
```

---

## Next: zkPerf Integration

Once basic monitoring is stable, integrate zkPerf:
- Replace curl with zkPerf witness
- Add complexity verification
- Submit proofs to Solana
- Deploy DAO sentinel nodes
