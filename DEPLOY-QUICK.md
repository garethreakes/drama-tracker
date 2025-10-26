# Quick Deploy Guide

**Copy this to a new server and get running in 5 minutes!**

## Prerequisites

Install Node.js 18+ or 20+ on your Linux server:

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL/Fedora
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Or using nvm (any Linux distro)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
```

## On New Server:

```bash
# 1. Clone/copy code
git clone <repo-url>
cd drama-tracker

# 2. Install
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env: change dev.db to prod.db, set NODE_ENV=production
nano .env  # or vi .env

# 4. Initialize database
npm run setup

# 5. Build
npm run build

# 6. Start
npm start
# Or with PM2: pm2 start npm --name "drama-tracker" -- start
```

## First Login:

1. Visit http://localhost:3000 (or your domain)
2. Login as "Lowri"
3. Set password in "Manage Friends"
4. Done! 🎉

## Production Tips:

- **Use PM2**: `npm install -g pm2 && pm2 start npm --name "drama-tracker" -- start`
- **Setup Nginx**: See DEPLOYMENT.md for reverse proxy config
- **Enable HTTPS**: `sudo certbot --nginx -d yourdomain.com`
- **Backup Database**: `cp prisma/prod.db prisma/backup.db`

That's it! See [DEPLOYMENT.md](DEPLOYMENT.md) for full details and [README.md](README.md) for complete documentation.
