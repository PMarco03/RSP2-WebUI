#!/bin/bash
# ============================================================
#  Deploy script — RSP2-WebUI
#  Clona il repo, copia il sito in /var/www/html e avvia Nginx
# ============================================================

SITE_DIR="$(cd "$(dirname "$0")" && pwd)"
WEB_ROOT="/var/www/html"
PORT=80

echo "==> Cartella sorgente : $SITE_DIR"
echo "==> Destinazione      : $WEB_ROOT"
echo "==> Porta             : $PORT"
echo ""

# --- 1. Installa nginx se non e' presente ---
if ! command -v nginx &>/dev/null; then
    echo "[1/5] Nginx non trovato — installazione in corso..."
    sudo apt update -qq && sudo apt install -y nginx
else
    echo "[1/5] Nginx gia' installato — skip."
fi

# --- 2. Pulisci la webroot e copia il sito ---
echo "[2/5] Copia file in $WEB_ROOT ..."
sudo rm -rf "$WEB_ROOT"/*
sudo cp -r "$SITE_DIR"/. "$WEB_ROOT"/
sudo rm -f "$WEB_ROOT/run.sh"

# --- 3. Permessi corretti ---
echo "[3/5] Imposto permessi..."
sudo chown -R www-data:www-data "$WEB_ROOT"
sudo chmod -R 755 "$WEB_ROOT"

# --- 4. Configura Nginx sulla porta scelta ---
echo "[4/5] Configuro Nginx sulla porta $PORT ..."
sudo bash -c "cat > /etc/nginx/sites-enabled/default << NGINXCONF
server {
    listen $PORT default_server;
    listen [::]:$PORT default_server;

    root $WEB_ROOT;
    index index.html;

    server_name _;

    location / {
        try_files \\\$uri \\\$uri/ =404;
    }
}
NGINXCONF"

sudo nginx -t
if [ $? -ne 0 ]; then
    echo "ERRORE: configurazione Nginx non valida."
    exit 1
fi

# --- 5. Avvia / riavvia Nginx ---
echo "[5/5] Avvio Nginx..."
sudo systemctl enable nginx --quiet
sudo systemctl restart nginx

# --- Risultato ---
echo ""
if systemctl is-active --quiet nginx; then
    IP=$(hostname -I | awk '{print $1}')
    echo "Deploy completato."
    echo "Apri nel browser: http://$IP:$PORT"
else
    echo "ERRORE: Nginx non e' partito. Controlla i log:"
    echo "  sudo journalctl -u nginx --no-pager -n 30"
    exit 1
fi