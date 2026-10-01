#!/bin/bash
set -e

# --- 1. Load NVM & Chọn Node version 22 ---
echo "▶ [1/5] Loading NVM & Node.js..."
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
    \. "$NVM_DIR/nvm.sh"
elif [ -s "/root/.nvm/nvm.sh" ]; then
    export NVM_DIR="/root/.nvm"
    \. "$NVM_DIR/nvm.sh"
elif [ -s "/www/server/nvm/nvm.sh" ]; then
    export NVM_DIR="/www/server/nvm"
    \. "$NVM_DIR/nvm.sh"
fi

nvm use 22 || {
    echo "⚠️ Node 22 chưa được cài đặt trong NVM. Đang tiến hành cài đặt..."
    nvm install 22
    nvm use 22
}
echo "✓ Node version đang dùng: $(node -v)"
echo "✓ NPM version đang dùng:  $(npm -v)"

# --- 2. Di chuyển vào thư mục dự án & Backup .env ---
ROOT_DIR="/www/wwwroot/nail_landing_page"
cd "$ROOT_DIR"

echo "▶ [2/5] Bảo vệ .env và Git Pull..."
if [ -f server/.env ]; then
    cp server/.env server/.env.backup
fi

# Dọn dẹp thay đổi cục bộ của package-lock
git checkout server/package-lock.json 2>/dev/null || true
git stash

# Kéo code mới nhất từ GitHub
git pull origin main

# Khôi phục lại file .env của server
if [ -f server/.env.backup ]; then
    cp server/.env.backup server/.env
fi

# --- 3. Cập nhật và restart Backend (chỉ restart nail-api) ---
echo "▶ [3/5] Cập nhật Backend (nail-api)..."
cd "$ROOT_DIR/server"
npm install
pm2 restart nail-api

# --- 4. Build Frontend (React / Vite) ---
echo "▶ [4/5] Build Frontend..."
# Xóa cờ khóa .user.ini của aaPanel (nếu có)
chattr -i "$ROOT_DIR/client/dist/.user.ini" 2>/dev/null || true
rm -f "$ROOT_DIR/client/dist/.user.ini" 2>/dev/null || true

cd "$ROOT_DIR/client"
npm install
npm run build

# --- 5. Reload Nginx ---
echo "▶ [5/5] Reload Nginx..."
nginx -s reload || true

echo ""
echo "🎉 ======================================"
echo "   DEPLOY THÀNH CÔNG VỚI NODE $(node -v)!"
echo "   Backend: nail-api đã restart"
echo "   Frontend: client/dist đã build mới"
echo "=========================================="
