#!/usr/bin/env bash
# Polls GitHub for new commits on main and redeploys when the SHA changes.
#
# Deliberately pull-based: nothing outside the VPS needs credentials, so there
# is no deploy key to store in GitHub and nothing to leak. The repo is public,
# so the fetch itself needs no auth either.
set -euo pipefail

REPO_DIR=/var/www/vidportfolio
BRANCH=main
PM2_APP=vidportfolio
LOG=/var/log/vidportfolio-deploy.log

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG"; }

cd "$REPO_DIR"

git fetch --quiet origin "$BRANCH"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ]; then
  exit 0   # nothing new
fi

log "new commit ${LOCAL:0:7} -> ${REMOTE:0:7}, deploying"

# Keep the current build so a failure can be rolled back to something working.
PREVIOUS=$LOCAL

git reset --hard --quiet "origin/$BRANCH"

if ! npm ci --no-audit --no-fund >>"$LOG" 2>&1; then
  log "npm ci FAILED, rolling back to ${PREVIOUS:0:7}"
  git reset --hard --quiet "$PREVIOUS"
  npm ci --no-audit --no-fund >>"$LOG" 2>&1 || true
  exit 1
fi

if ! npm run build >>"$LOG" 2>&1; then
  log "build FAILED, rolling back to ${PREVIOUS:0:7}"
  git reset --hard --quiet "$PREVIOUS"
  npm ci --no-audit --no-fund >>"$LOG" 2>&1 || true
  npm run build >>"$LOG" 2>&1 || log "rollback build also failed - site may be down"
  pm2 restart "$PM2_APP" --update-env >>"$LOG" 2>&1 || true
  exit 1
fi

pm2 restart "$PM2_APP" --update-env >>"$LOG" 2>&1

sleep 4
CODE=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3100/ || echo 000)
if [ "$CODE" = "200" ]; then
  log "deployed ${REMOTE:0:7} OK (health $CODE)"
else
  log "WARNING: health check returned $CODE after deploying ${REMOTE:0:7}"
fi
