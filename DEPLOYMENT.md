# Deployment Checklist

Quick reference guide for deploying Drama Tracker to a new server.

## Pre-Deployment

### Install Node.js on Linux

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # Should show v20.x.x
```

**CentOS/RHEL/Fedora:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
node --version  # Should show v20.x.x
```

**Using nvm (any distro):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Checklist

- [ ] Server has Node.js 18+ or 20+ installed
- [ ] Server has npm installed (comes with Node.js)
- [ ] You have SSH or terminal access to the server
- [ ] Firewall allows port 3000 (or your chosen port)
- [ ] Git installed (for cloning repo): `sudo apt install git` or `sudo yum install git`

## Deployment Steps

### 1. Get the Code

```bash
# Clone the repository
git clone <your-repo-url>
cd drama-tracker

# Or copy files manually via SCP/SFTP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit for production
nano .env
```

**Update these values:**
```env
DATABASE_URL="file:./prod.db"
NODE_ENV="production"
```

### 4. Initialize Database

```bash
npm run setup
```

This will:
- Generate Prisma client
- Create database with schema
- Add default friends (Lowri, Emma, Melissa, Grace, Ella, Sofia)
- Set Lowri as admin

### 5. Build for Production

```bash
npm run build
```

### 6. Start the Server

**Option A: Direct Start**
```bash
npm start
```

**Option B: Using PM2 (Recommended)**
```bash
# Install PM2 globally
npm install -g pm2

# Start app
pm2 start npm --name "drama-tracker" -- start

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
# Run the command it outputs

# View logs
pm2 logs drama-tracker
```

**Option C: Using systemd (Linux Native)**
```bash
# Create systemd service file
sudo nano /etc/systemd/system/drama-tracker.service
```

Add this content (adjust paths for your setup):
```ini
[Unit]
Description=Drama Tracker App
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/drama-tracker
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=drama-tracker

[Install]
WantedBy=multi-user.target
```

Then enable and start:
```bash
# Reload systemd
sudo systemctl daemon-reload

# Enable auto-start on boot
sudo systemctl enable drama-tracker

# Start service
sudo systemctl start drama-tracker

# Check status
sudo systemctl status drama-tracker

# View logs
sudo journalctl -u drama-tracker -f
```

### 7. Verify Deployment

```bash
# Test locally on server
curl http://localhost:3000

# Should redirect to login page (307 or 200 response)
```

## Post-Deployment

### Set Up Nginx Reverse Proxy (Optional)

1. Install Nginx:
```bash
sudo apt update
sudo apt install nginx
```

2. Create site configuration:
```bash
sudo nano /etc/nginx/sites-available/drama-tracker
```

3. Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/drama-tracker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. Set up HTTPS with Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Or if not using Nginx, allow Node.js port
sudo ufw allow 3000
```

### Set Up Database Backups

Create a backup script:
```bash
#!/bin/bash
# backup-db.sh
BACKUP_DIR="/var/backups/drama-tracker"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp /path/to/drama-tracker/prisma/prod.db $BACKUP_DIR/prod-$DATE.db

# Keep only last 30 days of backups
find $BACKUP_DIR -name "prod-*.db" -mtime +30 -delete
```

Add to crontab:
```bash
# Run daily at 3 AM
0 3 * * * /path/to/backup-db.sh
```

### Set Initial Passwords

1. Visit your deployed URL
2. Login as "Lowri"
3. Go to "Manage Friends"
4. Set Lowri's password
5. Set passwords for other friends
6. Done! 🎉

## Updates & Maintenance

### Update the Application

```bash
cd drama-tracker
git pull
npm install
npm run prisma:generate
npm run build
pm2 restart drama-tracker
```

### View Logs

```bash
# PM2 logs
pm2 logs drama-tracker

# Or check Next.js logs
tail -f .next/trace
```

### Restart Application

```bash
# PM2
pm2 restart drama-tracker

# Direct
# Kill and restart npm start
```

### Backup Database

```bash
# Manual backup
cp prisma/prod.db prisma/backup-$(date +%Y%m%d).db

# Restore from backup
cp prisma/backup-20250101.db prisma/prod.db
pm2 restart drama-tracker
```

## Troubleshooting

### App won't start
```bash
# Check logs
pm2 logs drama-tracker

# Check if port is in use
lsof -i:3000

# Rebuild
npm run build
pm2 restart drama-tracker
```

### Database errors
```bash
# Regenerate Prisma client
npm run prisma:generate

# Check database file exists and has correct permissions
ls -la prisma/prod.db

# Fix permissions (make readable/writable by user and group)
chmod 664 prisma/prod.db
chown $USER:$USER prisma/prod.db

# If using systemd, ensure the service user owns the files
sudo chown -R YOUR_USERNAME:YOUR_USERNAME /path/to/drama-tracker
```

### Permission denied errors (Linux)
```bash
# Ensure correct ownership of entire directory
sudo chown -R $USER:$USER /path/to/drama-tracker

# Set correct permissions
chmod -R 755 /path/to/drama-tracker
chmod 664 /path/to/drama-tracker/prisma/*.db

# If using systemd, match the User in the service file
```

### Can't access from browser
```bash
# Check if app is running
pm2 status
# Or for systemd: sudo systemctl status drama-tracker

# Check firewall (Ubuntu/Debian)
sudo ufw status

# Check firewall (CentOS/RHEL)
sudo firewall-cmd --list-all

# Check Nginx
sudo nginx -t
sudo systemctl status nginx
```

### SELinux blocking connections (CentOS/RHEL)
```bash
# Check if SELinux is enabled
getenforce

# Allow httpd to connect to network (for Nginx reverse proxy)
sudo setsebool -P httpd_can_network_connect 1

# Or temporarily disable SELinux for testing
sudo setenforce 0

# Re-enable after testing
sudo setenforce 1
```

## Quick Command Reference

### With PM2
```bash
# View app status
pm2 status

# View logs
pm2 logs drama-tracker

# Restart app
pm2 restart drama-tracker

# Stop app
pm2 stop drama-tracker
```

### With systemd
```bash
# View app status
sudo systemctl status drama-tracker

# View logs
sudo journalctl -u drama-tracker -f

# Restart app
sudo systemctl restart drama-tracker

# Stop app
sudo systemctl stop drama-tracker

# Start app
sudo systemctl start drama-tracker
```

### General Commands
```bash
# Backup database
cp prisma/prod.db prisma/backup-$(date +%Y%m%d).db

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Check what's running on port 3000
sudo lsof -i:3000
# Or: sudo netstat -tlnp | grep :3000
```

## Security Checklist

- [ ] HTTPS enabled (Let's Encrypt)
- [ ] Firewall configured (ufw or iptables)
- [ ] Strong admin password set
- [ ] Regular database backups configured
- [ ] Server security updates enabled
- [ ] Only necessary ports exposed
- [ ] `.env` file has restricted permissions (600)

## Support

For issues, refer to the main [README.md](README.md) troubleshooting section.
