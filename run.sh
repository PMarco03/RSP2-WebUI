#!/bin/bash

# ============================================================
#  Deploy script — RSP2-WebUI
#  Copia il sito in /var/www/html e avvia/riavvia Nginx
# ============================================================

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"   # cartella dello script
WEB_ROOT="/var/www/html"

echo "==> Cartella sorgente : $SITE_DIR"
echo "==> Destinazione      : $WEB_ROOT"
echo ""

# --- 1. Installa nginx se non è presente ---
if ! command -v nginx &>/dev/null; then
    echo "[1/4] Nginx non trovato — installazione in corso..."
    sudo apt update -qq && sudo apt install -y nginx
else
    echo "[1/4] Nginx già installato — skip."
fi

# --- 2. Pulisci la webroot e copia il sito ---
echo "[2/4] Copia file in $WEB_ROOT ..."
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$SITE_DIR"/. "$WEB_ROOT"/
# rimuove lo script stesso dalla webroot (non serve servirlo)
sudo rm -f "$WEB_ROOT/run.sh"

# --- 3. Permessi corretti ---
echo "[3/4] Imposto permessi..."
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# --- 4. Avvia / riavvia Nginx ---
echo "[4/4] Avvio Nginx..."
sudo systemctl enable nginx --quiet
sudo systemctl restart nginx

# --- Risultato ---
echo ""
if systemctl is-active --quiet nginx; then
    IP=$(hostname -I | awk '{print $1}')
    echo "✅  Deploy completato!"
    echo "    Apri nel browser: http://$IP"
else
    echo "❌  Nginx non è partito. Controlla i log:"
    echo "    sudo journalctl -u nginx --no-pager -n 30"
    exit 1
fi