# Production Deployment Guide

## 1. Hosting Architecture Requirements
This portfolio application includes a Node.js API backend and an embedded SQLite database (`node:sqlite`).

- **Supported Hosts**: Any platform with persistent volume storage or a standard VPS:
  - VPS (Hetzner, DigitalOcean, Linode, AWS EC2, GCP Compute Engine)
  - Container platforms with persistent volumes (Fly.io with volumes, Railway with volume, Render with persistent disk)
- **Unsupported Hosts**: **DO NOT** deploy to serverless or static-only hosts (such as Netlify, Vercel, Cloudflare Pages, or GitHub Pages). Ephemeral container filesystems will erase database modifications, audit logs, guestbook signatures, and uploaded media files on redeployment or restart.

## 2. Runtime & Node Engine Requirements
- **Node.js**: Node >=22.13 (22.x LTS or 24.x); install via NodeSource/nvm; set ExecStart to the actual `which node` path. (Native `node:sqlite` is unflagged from Node.js 22.13).
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
**CRITICAL RULES**:
- **Never rsync the whole project folder** (directories like `backup/` and `scratch/` hold old historical data, unindexed assets, and temporary files that must never reach production).
- **Never copy `portfolio.db-wal` or `portfolio.db-shm` separately** while the database is active (copying raw WAL/SHM files leads to database corruption).

### Safe Database Deployment Steps:
1. **Stop any local server** to ensure no active write transactions are pending.
2. **Create an atomic snapshot using `VACUUM INTO deploy.db`**:
   ```bash
   node -e "
   const { DatabaseSync } = require('node:sqlite');
   const db = new DatabaseSync('portfolio.db');
   db.exec('VACUUM INTO \'deploy.db\'');
   db.close();
   console.log('deploy.db snapshot created.');
   "
   ```
   *(Or alternatively run `./scripts/backup-db.sh` and use the verified backup snapshot).*
3. **Verify database integrity**:
   ```bash
   node -e "
   const { DatabaseSync } = require('node:sqlite');
   const db = new DatabaseSync('deploy.db');
   console.log(db.prepare('PRAGMA integrity_check;').get());
   db.close();
   "
   ```
4. **Copy `deploy.db` to the server as `portfolio.db`**:
   ```bash
   scp deploy.db user@your-server:/var/www/portfolio/portfolio.db
   rm deploy.db
   ```
5. **Sync only the uploaded media files directory**:
   ```bash
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
# Set ExecStart to the actual `which node` path on your host (e.g. /usr/bin/node or ~/.nvm/versions/node/v22.x/bin/node)
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
