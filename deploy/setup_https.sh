#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
if [[ -z "$DOMAIN" ]]; then
  echo "Usage: bash deploy/setup_https.sh <domain>"
  echo "Example: bash deploy/setup_https.sh holiday.example.com"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "[1/3] Install Certbot..."
apt-get update -y
apt-get install -y certbot python3-certbot-nginx

echo "[2/3] Request and install SSL cert..."
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --redirect --agree-tos --register-unsafely-without-email --non-interactive

echo "[3/3] Verify renewal timer..."
systemctl status certbot.timer --no-pager || true

echo "HTTPS enabled for $DOMAIN and www.$DOMAIN"
