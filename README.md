# Videoportfolio

A self-hosted video editing portfolio. Videos are uploaded through a
password-protected admin panel, compressed on the server with ffmpeg, and
served straight from disk — no Cloudinary, Vimeo, or YouTube involved.

## What it does

- **Public site** — hero reel, filterable work grid with hover previews,
  about page, contact form. No login needed to view anything.
- **Admin panel** (`/admin`) — upload and delete videos, edit your bio,
  skills, tools and headline stats, manage client logos and a
  behind-the-scenes gallery.
- **Client reviews** — visitors submit testimonials from the homepage;
  nothing is published until you approve it in the admin panel.

Every upload is transcoded to a web-ready H.264 MP4 with `+faststart`, plus
a short muted preview clip for grid hovers and an extracted thumbnail.
Portrait (9:16) clips are detected and laid out whole instead of cropped.

## Running locally

Requires Node 20+ and [ffmpeg](https://ffmpeg.org/) on your `PATH`.

```bash
npm ci
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

| Variable | Purpose |
|---|---|
| `ADMIN_PASSWORD` | password for `/admin` |
| `SESSION_SECRET` | signs the admin session cookie |
| `NEXT_PUBLIC_FORM_ENDPOINT` | contact form target (e.g. Formspree) |
| `UPLOAD_DIR` | where videos/images are written (default `./uploads`) |
| `DATA_DIR` | where the JSON store lives (default `./data`) |
| `FFMPEG_THREADS` | cap ffmpeg's cores; set to `1` on a small VPS |

## Where data lives

There is no database. Projects and profile data are JSON files in
`DATA_DIR`; media sits in `UPLOAD_DIR`. Both are gitignored and, in
production, live outside the checkout so deploys never touch them.

**Back up `UPLOAD_DIR`, `DATA_DIR`, and `.env.local`** — they are the whole
site's content and secrets.

## Deploying

See [DEPLOY.md](DEPLOY.md) for the full VPS setup (PM2, Nginx, SSL) and the
GitHub Actions pipeline that builds on push and deploys only if the build
passes.
