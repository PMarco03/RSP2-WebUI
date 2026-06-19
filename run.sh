#!/bin/bash

set -e

APP_DIR="/home/vue-app"

cd "$APP_DIR"

# install dipendenze
npm install

# build produzione
npm run build