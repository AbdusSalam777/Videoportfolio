# Deploying to your Hostinger VPS

Server: `srv1736885.hstgr.cloud` (72.62.72.21), Ubuntu 24.04, Node 20, PM2, Nginx, certbot already installed. Ports 22/80/443/5432/5000/5001 are taken — this app uses **port 3000**.

## 1. One-time server setup

SSH in (or use the Hostinger browser Terminal), then:

```bash
sudo apt update && sudo apt install -y ffmpeg
ffmpeg -version   # confirm it installed
```

Create persistent storage **outside** the git checkout, so uploads survive future `git pull` deploys:

```bash
sudo mkdir -p /var/www/vidportfolio-uploads /var/www/vidportfolio-data
sudo chown -R $USER:$USER /var/www/vidportfolio-uploads /var/www/vidportfolio-data
```

## 2. Clone and configure

```bash
cd /var/www
git clone <your-github-repo-url> vidportfolio
cd vidportfolio
npm install
```

Create `.env.local` on the server (never commit this):

```bash
cat > .env.local <<'EOF'
ADMIN_PASSWORD=choose-a-long-random-password
SESSION_SECRET=REPLACE_WITH_OUTPUT_BELOW
NEXT_PUBLIC_FORM_ENDPOINT=
UPLOAD_DIR=/var/www/vidportfolio-uploads
DATA_DIR=/var/www/vidportfolio-data
EOF
```

Generate the session secret and paste it into the file above:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 3. Build and run with PM2

```bash
npm run build
pm2 start npm --name vidportfolio -- start -- -p 3000
pm2 save
```

(`pm2 save` + the `pm2 startup` command you already used for the courier app ensures it restarts on reboot.)

## 4. Nginx server block

Point a domain or subdomain (e.g. `portfolio.yourdomain.com`) at `72.62.72.21` first (an A record), then:

```bash
sudo tee /etc/nginx/sites-available/vidportfolio <<'EOF'
server {
    listen 80;
    server_name portfolio.yourdomain.com;

    # Large video uploads — the default is 1MB, which rejects almost any video.
    client_max_body_size 3G;
    # A slow connection sending a big file must not be cut off mid-transfer.
    client_body_timeout 600s;

    # Uploads block while ffmpeg transcodes, which can far exceed nginx's
    # default 60s proxy timeout and would otherwise return 504 on a request
    # that is actually still working.
    location /api/upload {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Stream the upload straight to the app instead of spooling the whole
        # file to a temp file on disk first.
        proxy_request_buffering off;

        proxy_connect_timeout 60s;
        proxy_send_timeout    3600s;
        proxy_read_timeout    3600s;
        send_timeout          3600s;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/vidportfolio /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portfolio.yourdomain.com
```

## 5. (Optional, later) Let Nginx serve video files directly

Right now videos stream through the Next.js `/media/...` route, which works fine and supports scrubbing. For one less hop, once you're comfortable, add this **above** the `location /` block:

```nginx
location /media/ {
    alias /var/www/vidportfolio-uploads/;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Then `sudo nginx -t && sudo systemctl reload nginx`. No app code changes needed — this just intercepts `/media/*` before it reaches Node.

## 6. Redeploying after future changes

```bash
cd /var/www/vidportfolio
git pull
npm install
npm run build
pm2 restart vidportfolio
```

Uploads and `.env.local` are untouched since they live outside the repo.

## Large uploads on this VPS — what to expect

The box is 2 vCPU / 7.8 GB RAM / 93 GB free, already running the courier app on port 5000.

**Memory is fine.** Uploads stream to disk in chunks, so a 3 GB file uses no more RAM than a 3 MB one. ffmpeg itself stays in the low hundreds of MB.

**CPU is the real constraint.** Transcoding pins the cores, and with only 2 of them a long video will make the courier app sluggish while it runs. Set `FFMPEG_THREADS=1` in `.env.local` to leave a core free. Rough guide at CRF 23, 1080p, one thread:

| Source | Approx. transcode time |
|---|---|
| 30 seconds | under a minute |
| 5 minutes | 5–10 minutes |
| 30 minutes | 30–60 minutes |

4K sources take roughly 3–4× longer. The nginx block above allows up to 1 hour per request; beyond that, compress locally before uploading.

**The browser tab must stay open.** Transcoding happens inside the HTTP request, so closing the tab or losing connection mid-upload aborts it. Nothing is published in that case — the partial file is cleaned up.

**Disk.** Each upload briefly holds the original plus the encoded output, then deletes the original. Budget ~2× the source file during processing.

**A short transfer can't produce a broken video.** The server compares bytes received against `Content-Length` and rejects a mismatch, rather than encoding a truncated file.

### If an upload fails

```bash
pm2 logs vidportfolio --lines 100     # look for "[upload]" and ffmpeg errors
df -h                                  # disk full?
ls -la /var/www/vidportfolio-uploads/tmp   # leftovers from a crash, safe to delete
```

## Notes

- **Backups**: `/var/www/vidportfolio-uploads` and `/var/www/vidportfolio-data` are your entire content library — back these up periodically (e.g. a cron `rsync` to another host or S3-compatible storage).
- **Disk space**: with ffmpeg CRF 23 compression, expect roughly 8–15MB per minute of 1080p video. Your 93GB free disk is plenty for hundreds of projects.
- **Single VPS = single location (Malaysia)**: fine for most audiences. If you get international traffic and want a CDN in front, point Cloudflare's free tier at your domain — no app changes required, it just caches `/media/*` at edge locations automatically.
