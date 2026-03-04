#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/holiday-countdown-app"
if [[ ! -d "$APP_DIR/.git" ]]; then
  echo "App not found at $APP_DIR. Run setup_server.sh first."
  exit 1
fi

cd "$APP_DIR"
git fetch --all
git reset --hard origin/main

npm ci
npm run generate:holidays

pm2 reload holiday-app --update-env
pm2 save

systemctl reload nginx

echo "Deploy complete."
