#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/holiday-countdown-app"
REPO_URL="${1:-}"
DOMAIN="${2:-}"

if [[ -z "$REPO_URL" || -z "$DOMAIN" ]]; then
  echo "Usage: bash deploy/setup_server.sh <repo_url> <domain>"
  echo "Example: bash deploy/setup_server.sh https://github.com/denzeldai/holiday-countdown-app.git holiday.example.com"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

echo "[1/8] Install system packages..."
apt-get update -y
apt-get install -y curl git nginx

echo "[2/8] Install Node.js LTS (20.x)..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "[3/8] Install PM2..."
npm install -g pm2

echo "[4/8] Deploy code to ${APP_DIR}..."
mkdir -p /var/www
if [[ -d "$APP_DIR/.git" ]]; then
  cd "$APP_DIR"
  git fetch --all
  git reset --hard origin/main
else
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "[5/8] Install app dependencies..."
npm ci
npm run generate:holidays

echo "[6/8] Start app with PM2..."
cp -f ecosystem.config.cjs /tmp/holiday-ecosystem.config.cjs
sed -i "s|/var/www/holiday-countdown-app|$APP_DIR|g" /tmp/holiday-ecosystem.config.cjs
pm2 start /tmp/holiday-ecosystem.config.cjs --update-env || pm2 restart holiday-app --update-env
pm2 save
pm2 startup systemd -u root --hp /root >/tmp/pm2-startup.out || true
bash -lc "$(tail -n 1 /tmp/pm2-startup.out 2>/dev/null || true)" || true

echo "[7/8] Configure Nginx..."
cp -f deploy/nginx.conf /etc/nginx/sites-available/holiday-app
sed -i "s|your-domain.com|$DOMAIN|g" /etc/nginx/sites-available/holiday-app
ln -sf /etc/nginx/sites-available/holiday-app /etc/nginx/sites-enabled/holiday-app
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

echo "[8/8] Done. HTTP is live. Next: enable HTTPS."
echo "Run: bash deploy/setup_https.sh $DOMAIN"
