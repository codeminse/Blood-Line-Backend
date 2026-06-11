#!/usr/bin/env bash
# Runs ON the VPS via ssh stdin from the GitHub Actions workflow.
# Expects env: APP_CHANGED, NGINX_CHANGED, GHCR_TOKEN, GHCR_USER, REPO, SHA
# Optional: MONGODB_URI_NEW (syncs MONGODB_URI in /opt/feni/backend/.env)
set -e

ENV_UPDATED=false
if [ -n "$MONGODB_URI_NEW" ] && [ -f /opt/feni/backend/.env ]; then
  if ! grep -qF "MONGODB_URI=$MONGODB_URI_NEW" /opt/feni/backend/.env; then
    sed -i "s|^MONGODB_URI=.*|MONGODB_URI=$MONGODB_URI_NEW|" /opt/feni/backend/.env
    ENV_UPDATED=true
    echo ">> MONGODB_URI updated in .env"
  fi
fi

mkdir -p /opt/feni/backend/deploy/nginx
API="https://api.github.com/repos/$REPO/contents"
HDR="Authorization: token $GHCR_TOKEN"
ACC="Accept: application/vnd.github.raw"
curl -fsSL -H "$HDR" -H "$ACC" "$API/deploy/docker-compose.yml?ref=$SHA" -o /opt/feni/backend/deploy/docker-compose.yml
curl -fsSL -H "$HDR" -H "$ACC" "$API/deploy/nginx/api.fenibloodline.com.conf?ref=$SHA" -o /opt/feni/backend/deploy/nginx/api.fenibloodline.com.conf

if [ "$NGINX_CHANGED" = "true" ]; then
  if [ -f /etc/letsencrypt/live/api.fenibloodline.com/fullchain.pem ]; then
    echo ">> Updating nginx config"
    cp /opt/feni/backend/deploy/nginx/api.fenibloodline.com.conf /etc/nginx/sites-available/api.fenibloodline.com.conf
    ln -sf /etc/nginx/sites-available/api.fenibloodline.com.conf /etc/nginx/sites-enabled/api.fenibloodline.com.conf
    nginx -t && systemctl reload nginx
  else
    echo ">> TLS cert not issued yet, keeping bootstrap config (run bash /root/issue-api-cert.sh after adding DNS)"
  fi
else
  echo ">> No nginx changes, skipping"
fi

if [ "$APP_CHANGED" = "true" ]; then
  echo ">> Deploying new image"
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USER" --password-stdin
  cd /opt/feni/backend/deploy
  docker compose pull
  docker compose up -d
  docker image prune -f
else
  echo ">> No app changes, skipping"
fi

if [ "$ENV_UPDATED" = "true" ]; then
  echo ">> Restarting feni-api to pick up new env"
  docker restart feni-api
fi
echo ">> Deploy finished OK"
