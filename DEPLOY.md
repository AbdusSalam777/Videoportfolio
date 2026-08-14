# Deploying to your Hostinger VPS

Server: `srv1736885.hstgr.cloud` (72.62.72.21), Ubuntu 24.04, Node 20, PM2,
Nginx, certbot already installed. Access via the Hostinger browser Terminal
(hpanel → VPS → Terminal), which logs in as root with no key needed.

## Ports on this box

| Port | Used by |
|---|---|
| 22 | SSH |
| 80 / 443 | nginx |
| 3000 | **`peace-backend`** (existing app — do not touch) |
| 5000 | courier backend |
| 5001 | another node process |
| 5432 | PostgreSQL (localhost only) |
| 8080 | nginx → peacesoftware frontend |
| **3100** | **this app** |

This app runs on **3100** internally and is reached publicly through nginx
on 80/443 at `video.abdusdev.com`. Port 3000 is deliberately avoided —
`peace-backend` already holds it, and starting a second process there would
fail with `EADDRINUSE` or disrupt the running app.

Verify before you start:

```bash
sudo ss -tlnp | grep -E ':3100\b' || echo "3100 is free"
```

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
git clone https://github.com/AbdusSalam777/Videoportfolio.git vidportfolio
cd vidportfolio
npm ci
```

Create `.env.local` on the server (never commit this):

```bash
cat > .env.local <<'EOF'
ADMIN_PASSWORD=choose-a-long-random-password
SESSION_SECRET=REPLACE_WITH_OUTPUT_BELOW
NEXT_PUBLIC_FORM_ENDPOINT=
UPLOAD_DIR=/var/www/vidportfolio-uploads
DATA_DIR=/var/www/vidportfolio-data
FFMPEG_THREADS=1
COOKIE_SECURE=false
EOF
```

> **`COOKIE_SECURE=false` is only needed while the site is served over
> plain HTTP.** Browsers silently discard `Secure` cookies on non-HTTPS
> origins, so leaving it unset before SSL is in place makes admin login
> bounce you back to the login page with no error. §6 removes it once
> HTTPS is live — if you are going straight to the domain, you can leave
> this line out entirely.

Generate the session secret and paste it into the file above:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

`.env.local` is gitignored, so deploys never overwrite it. It is the only
file holding secrets — back it up somewhere safe.

## 3. Build and run with PM2

```bash
npm run build
pm2 start npm --name vidportfolio -- start -- -p 3100
pm2 save
pm2 status          # vidportfolio and peace-backend should both be online
```

(`pm2 save` + the `pm2 startup` command you already used for the courier app ensures it restarts on reboot.)

## 4. DNS — point a subdomain at the VPS

Recommended: `video.abdusdev.com`, kept separate from the dev portfolio on
the root domain.

Check where DNS for `abdusdev.com` is managed:

```bash
dig +short NS abdusdev.com
```

If those are Hostinger nameservers (`*.dns-parking.com`), add the record in
hPanel → **Domains** → abdusdev.com → **DNS / Nameservers** → **DNS records**:

| Type | Name | Points to |
|---|---|---|
| A | `video` | `72.62.72.21` |

Enter `video`, not the full hostname — hPanel appends the domain itself.
Ignore hPanel's *Subdomains* tool; that is for shared hosting and points
the name at Hostinger's web server rather than this VPS. If the
nameservers belong to Cloudflare or another provider, add the record there
instead, and set it to **DNS only** (grey cloud) until SSL is issued.

Wait for this to return the server IP before continuing:

```bash
dig +short video.abdusdev.com
```

Running certbot before DNS resolves will fail validation, and repeated
failures hit Let's Encrypt rate limits (5 per hour per domain).

## 5. Nginx server block

This adds a **new** file and leaves your existing `peace` site untouched.

```bash
sudo tee /etc/nginx/sites-available/vidportfolio <<'EOF'
server {
    listen 80;
    server_name video.abdusdev.com;

    # Large video uploads — the default is 1MB, which rejects almost any video.
    client_max_body_size 3G;
    # A slow connection sending a big file must not be cut off mid-transfer.
    client_body_timeout 600s;

    # Uploads block while ffmpeg transcodes, which can far exceed nginx's
    # default 60s proxy timeout and would otherwise return 504 on a request
    # that is actually still working.
    location /api/upload {
        proxy_pass http://127.0.0.1:3100;
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
        proxy_pass http://127.0.0.1:3100;
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
```

`nginx -t` must pass before you reload. If it fails, the reload is skipped
and your existing sites keep running untouched — this vhost only claims
`video.abdusdev.com`, so the `peace` site on 80/8080 is unaffected.

The site is now reachable at **http://video.abdusdev.com**.

## 6. HTTPS

```bash
sudo certbot --nginx -d video.abdusdev.com
```

Certbot rewrites the vhost to serve HTTPS and redirect HTTP to it. Then
turn the secure cookie back on — it was disabled only because plain HTTP
cannot carry one:

```bash
cd /var/www/vidportfolio
sed -i '/^COOKIE_SECURE=/d' .env.local
pm2 restart vidportfolio
```

Confirm the cookie is marked `Secure` again:

```bash
curl -sI -X POST https://video.abdusdev.com/api/admin/login \
  -H 'Content-Type: application/json' -d '{"password":"wrong"}' | head -3
```

A 401 is the expected response there; you are checking the site answers
over HTTPS, not logging in.

### Testing before DNS propagates

If you want to check the app before the subdomain resolves, temporarily add
`listen 8081;` and `server_name _;` to the vhost, open the port with
`sudo ufw allow 8081/tcp`, and visit `http://72.62.72.21:8081`. Keep
`COOKIE_SECURE=false` while doing so, and remove both once the domain is
live — on plain HTTP the admin password crosses the network in the clear.

## 7. (Optional, later) Let Nginx serve video files directly

Right now videos stream through the Next.js `/media/...` route, which works fine and supports scrubbing. For one less hop, once you're comfortable, add this **above** the `location /` block:

```nginx
location /media/ {
    alias /var/www/vidportfolio-uploads/;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

Then `sudo nginx -t && sudo systemctl reload nginx`. No app code changes needed — this just intercepts `/media/*` before it reaches Node.

## 8. Auto-deploy on every push

`.github/workflows/deploy.yml` builds each push to `main` on GitHub, and
only if that build succeeds does it SSH in, pull, rebuild, and restart PM2.
A broken commit therefore fails on CI and never reaches the live site.

### a. Create a deploy key on the VPS

Run this **on the VPS**. It makes a keypair used only by GitHub Actions:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Then print the **private** key — this is what GitHub needs:

```bash
cat ~/.ssh/github_deploy
```

### b. Add the secrets on GitHub

Go to **Settings → Secrets and variables → Actions → New repository secret**
in [your repo](https://github.com/AbdusSalam777/Videoportfolio/settings/secrets/actions) and add:

| Secret | Value |
|---|---|
| `VPS_HOST` | `72.62.72.21` |
| `VPS_USER` | `root` (or your deploy user) |
| `VPS_SSH_KEY` | the entire output of `cat ~/.ssh/github_deploy`, including the `-----BEGIN`/`-----END` lines |
| `VPS_PORT` | `22` — optional, only if SSH runs on a different port |

Paste the private key yourself in that form. Never commit it, never send it
over chat, and never paste it into a file in this repo.

### c. Confirm it works

Push anything to `main`, then watch
[the Actions tab](https://github.com/AbdusSalam777/Videoportfolio/actions).
The job builds first, deploys second, and fails loudly if the app is not
back online after the restart.

You can also trigger a deploy by hand from that tab via **Run workflow**.

### Manual redeploy (if you ever need it)

```bash
cd /var/www/vidportfolio
git pull
npm ci
npm run build
pm2 restart vidportfolio
```

Uploads and `.env.local` are untouched, since both live outside the repo.

## Large uploads on this VPS — what to expect

The box is 2 vCPU / 7.8 GB RAM / 93 GB free, and already runs `peace-backend` (port 3000) plus the courier app (port 5000).

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
