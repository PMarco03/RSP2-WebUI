#!/bin/bash

set -e

APP_DIR="/home/RSP2-WebUI"

cd "$APP_DIR"

# dipendenze pulite (opzionale ma consigliato)
rm -rf node_modules package-lock.json

npm install

npm run build

# install serve se non esiste
if ! command -v serve >/dev/null 2>&1; then
  npm install -g serve
fi

# serve in background sulla porta 3000
nohup serve -s dist -l 3000 > server.log 2>&1 &