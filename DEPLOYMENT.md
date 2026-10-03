# Production Deployment Guide

## 1. Hosting Architecture Requirements
This portfolio application includes a Node.js API backend and an embedded SQLite database (`node:sqlite`).

- **Supported Hosts**: Any platform with persistent volume storage or a standard VPS:
  - VPS (Hetzner, DigitalOcean, Linode, AWS EC2, GCP Compute Engine)
  - Container platforms with persistent volumes (Fly.io with volumes, Railway with volume, Render with persistent disk)
- **Unsupported Hosts**: **DO NOT** deploy to serverless or static-only hosts (such as Netlify, Vercel, Cloudflare Pages, or GitHub Pages). Ephemeral container filesystems will erase database modifications, audit logs, guestbook signatures, and uploaded media files on redeployment or restart.

## 2. Runtime & Node Engine Requirements
- **Node.js**: `>= 22.5.0` (Required for native `node:sqlite` database engine support).
- Check version: `node -v`

---

## 3. Installation & Build
```bash
# 1. Clone repository on the production host
git clone <your-repo-url> /var/www/portfolio
cd /var/www/portfolio

# 2. Install production dependencies
npm ci

# 3. Build optimized frontend bundle into dist/
npm run build

# 4. Start production server
npm start
```

---

## 4. Environment Configuration (`.env`)
Copy `.env.example` to `.env` and configure production values:
```bash
cp .env.example .env
chmod 600 .env
```

Key settings:
- `PORT=3001`
- `NODE_ENV=production`
- `DB_PATH=/var/www/portfolio/portfolio.db` (or path on persistent volume)
- `UPLOAD_DIR=/var/www/portfolio/data/uploads` (or path on persistent volume)
- `SITE_URL=https://yourdomain.com`
- `ALLOWED_ORIGIN=https://yourdomain.com`
- `TRUST_PROXY=true`
- `TRUST_PROXY_HOPS=1`
- `FORCE_HTTPS=true`
- `CSP_MODE=report-only` (Verify in browser console, then switch to `enforce`)

---

## 5. Initial Data & Admin Setup (Out-of-Band)
**Never track `portfolio.db` or `data/uploads` in Git.**
Copy your prepared database and existing uploads to the host securely:
```bash
# From your local machine:
scp portfolio.db user@your-server:/var/www/portfolio/portfolio.db
rsync -avzP data/uploads/ user@your-server:/var/www/portfolio/data/uploads/
```

Reset the administrator password directly on the production host:
```bash
node scripts/reset-admin.js admin
# Enter your secure password when prompted
```

---

## 6. Reverse Proxy Setup (Caddy Example - Automatic HTTPS)
Caddy automatically provisions and renews Let's Encrypt TLS certificates.

`/etc/caddy/Caddyfile`:
```caddy
yourdomain.com {
    encode zstd gzip

    # Reverse proxy to local Node.js server
    reverse_proxy 127.0.0.1:3001 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Restart Caddy:
```bash
sudo systemctl reload caddy
```

---

## 7. Process Management

### Option A: systemd Service (Recommended on Linux VPS)
Create `/etc/systemd/system/portfolio.service`:
```ini
[Unit]
Description=Divyanshu Mishra Portfolio
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/portfolio
EnvironmentFile=/var/www/portfolio/.env
ExecStart=/usr/bin/node /var/www/portfolio/server/server.js
Restart=always
RestartSec=5
StandardOutput=append:/var/log/portfolio.log
StandardError=append:/var/log/portfolio.error.log

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio
sudo systemctl status portfolio
```

### Option B: PM2
```bash
pm2 start server/server.js --name "portfolio" --env production
pm2 save
pm2 startup
```

---

## 8. Switching CSP to Enforce Mode
1. Deploy with `CSP_MODE=report-only`.
2. Open `https://yourdomain.com/` and `https://yourdomain.com/admin` in a browser with DevTools Console open.
3. Verify that there are zero CSP violation reports.
4. Update `.env`:
   ```bash
   CSP_MODE=enforce
   ```
5. Restart the server: `sudo systemctl restart portfolio`.

---

## 9. Automated Database Backups & Restore

### Backup via Cron
The included `scripts/backup-db.sh` script performs an atomic `VACUUM INTO` snapshot, validates data with `PRAGMA integrity_check`, and rotates older backups.

Add to crontab (`crontab -e`):
```cron
# Run daily at 03:00 UTC
0 3 * * * cd /var/www/portfolio && ./scripts/backup-db.sh >> /var/log/portfolio-backup.log 2>&1
```

### Restoring from Backup
```bash
# 1. Stop the application server
sudo systemctl stop portfolio

# 2. Verify backup integrity
node -e "
const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('/var/www/portfolio/backup/portfolio-2026-10-04T00-00-00Z.db');
console.log(db.prepare('PRAGMA integrity_check;').get());
"

# 3. Replace live database with verified backup snapshot
cp /var/www/portfolio/backup/portfolio-2026-10-04T00-00-00Z.db /var/www/portfolio/portfolio.db

# 4. Restart server
sudo systemctl start portfolio
```

---

## 10. Log Locations
- Application logs (systemd): `/var/log/portfolio.log` and `/var/log/portfolio.error.log`
- System journal: `journalctl -u portfolio -f`
- Caddy access logs: `/var/log/caddy/access.log`
- Database backup log: `/var/log/portfolio-backup.log`
