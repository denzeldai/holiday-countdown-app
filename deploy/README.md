# Alibaba Cloud Deployment Pack

This project can run on an Alibaba Cloud ECS Ubuntu server with `Node.js + PM2 + Nginx`.

## 1) Prerequisites

- Domain DNS `A` record points to your ECS public IP:
  - `@` -> `<your-server-ip>`
  - `www` -> `<your-server-ip>`
- Security group allows inbound:
  - TCP `80`
  - TCP `443`

## 2) One-time setup on server

```bash
sudo -i
cd /root
bash /path/to/project/deploy/setup_server.sh https://github.com/denzeldai/holiday-countdown-app.git your-domain.com
```

## 3) Enable HTTPS

```bash
sudo -i
bash /path/to/project/deploy/setup_https.sh your-domain.com
```

## 4) Later updates (after new GitHub push)

```bash
sudo -i
bash /path/to/project/deploy/deploy.sh
```

## 5) Health checks

- `pm2 status`
- `systemctl status nginx`
- `curl -I http://127.0.0.1:3000`
- `curl -s https://your-domain.com/api/holiday`
