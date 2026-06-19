#!/bin/bash

set -e

APP_DIR="/home/RSP2-WebUI"

cd "$APP_DIR"

git pull

rm -rf node_modules package-lock.json
npm install

npm run build

sudo systemctl reload nginx