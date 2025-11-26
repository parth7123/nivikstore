#!/bin/bash

# Deployment Setup Script for NivikStore.com
# Usage: ./setup.sh <GITHUB_REPO_URL>

REPO_URL=$1

if [ -z "$REPO_URL" ]; then
    echo "Error: Please provide your GitHub repository URL."
    echo "Usage: ./setup.sh <GITHUB_REPO_URL>"
    exit 1
fi

echo "🚀 Starting Deployment Setup..."

# 1. Update System & Install Tools
echo "📦 Installing Node.js, Nginx, Git, and PM2..."
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# 2. Clone Repository
echo "⬇️ Cloning repository..."
cd /var/www
if [ -d "nivikstore" ]; then
    echo "Directory nivikstore already exists. Pulling latest changes..."
    cd nivikstore
    sudo git pull
else
    sudo git clone $REPO_URL nivikstore
    cd nivikstore
fi

# 3. Backend Setup
echo "⚙️ Setting up Backend..."
cd backend
npm install
# Note: User must manually create .env here or we can copy a placeholder
if [ ! -f .env ]; then
    echo "Creating placeholder .env file. PLEASE EDIT IT!"
    echo "PORT=4002" > .env
    echo "MONGODB_URI=your_mongodb_uri" >> .env
fi
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 4. Frontend Setup
echo "🎨 Setting up Frontend..."
cd ../frontend
npm install
npm run build

# 5. Admin Setup
echo "👑 Setting up Admin Panel..."
cd ../admin
npm install
npm run build

# 6. Nginx Configuration
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/nivikstore > /dev/null <<EOF
server {
    listen 80;
    server_name nivikstore.com www.nivikstore.com;

    location / {
        root /var/www/nivikstore/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 80;
    server_name admin.nivikstore.com;

    location / {
        root /var/www/nivikstore/admin/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/nivikstore /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. SSL Setup
echo "🔒 Setting up SSL..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d nivikstore.com -d www.nivikstore.com -d admin.nivikstore.com --non-interactive --agree-tos -m admin@nivikstore.com

echo "✅ Deployment Complete! Visit https://nivikstore.com"
