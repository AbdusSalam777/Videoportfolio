# Deploy automation

These are the files installed on the VPS for auto-deploy. They are kept here
so the deployed setup is version-controlled rather than existing only on the
server.

| File | Installed to |
|---|---|
| `vidportfolio-deploy.sh` | `/usr/local/bin/vidportfolio-deploy` (chmod +x) |
| `vidportfolio-deploy.service` | `/etc/systemd/system/` |
| `vidportfolio-deploy.timer` | `/etc/systemd/system/` |

The timer checks GitHub every minute and redeploys when `main` moves. It is
pull-based, so GitHub stores no credentials for the server and there is no
deploy key to leak.

If a deploy's `npm ci` or `npm run build` fails, the script resets to the
previous commit and rebuilds, so a broken push cannot take the site down.

## Reinstalling after a rebuild

```bash
cd /var/www/vidportfolio
install -m 755 deploy/vidportfolio-deploy.sh /usr/local/bin/vidportfolio-deploy
cp deploy/vidportfolio-deploy.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now vidportfolio-deploy.timer
```

Editing these files in the repo does **not** update the server copies — the
deploy script does not install itself. Re-run the commands above after
changing them.
