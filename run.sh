#!/bin/bash

set -e

APP_DIR="/home/RSP-WEBUI"

cd "$APP_DIR"

# install dipendenze
npm install

# build produzione
npm run build