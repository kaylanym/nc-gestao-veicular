#!/bin/bash

VPS="root@187.77.224.148"
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Iniciando deploy para ncgestaoveicular.app.br..."

echo ""
echo "📦 Enviando frontend..."
scp "$DIR/index.html" \
    "$DIR/styles.css" \
    "$DIR/admin.html" \
    "$DIR/admin.css" \
    "$DIR/admin.js" \
    "$DIR/dashboard.html" \
    "$DIR/dashboard.css" \
    "$DIR/dashboard.js" \
    "$DIR/app.js" \
    "$DIR/area-cliente.html" \
    "$DIR/cadastro.html" \
    "$DIR/servicos.html" \
    "$DIR/servicos.js" \
    "$DIR/resetar-senha.html" \
    "$DIR/supabase-config.js" \
    "$VPS:/var/www/frontend/"

echo ""
echo "⚙️  Enviando backend..."
scp "$DIR/backend/server.js" \
    "$DIR/backend/package.json" \
    "$DIR/backend/package-lock.json" \
    "$VPS:/var/www/backend/"

echo ""
echo "🔄 Reiniciando backend na VPS..."
ssh "$VPS" "cd /var/www/backend && npm install --production && pm2 restart backend"

echo ""
echo "✅ Deploy concluído! Acesse: https://ncgestaoveicular.app.br"
