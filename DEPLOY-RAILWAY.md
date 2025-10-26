# Deploy to Railway

Complete guide to deploying Drama Tracker on Railway.app

## Prerequisites

- GitHub account
- Code pushed to GitHub repository
- Railway account (sign up at https://railway.app)

## Step-by-Step Deployment

### 1. Create Railway Account

1. Go to https://railway.app
2. Click "Login with GitHub"
3. Authorize Railway to access your GitHub

### 2. Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `drama-tracker` from your repositories
4. Railway will automatically detect it's a Next.js app

### 3. Configure Environment Variables

Click on your service → "Variables" tab → Add these:

```env
NODE_ENV=production
DATABASE_URL=file:/data/prod.db
```

**Important:** The `/data` path will be where we mount the persistent volume.

### 4. Add Persistent Volume (CRITICAL!)

Your SQLite database needs persistent storage:

1. In your service, click "Settings"
2. Scroll to "Volumes"
3. Click "Add Volume"
4. Set mount path: `/data`
5. Click "Add"

This ensures your database survives redeployments.

### 5. Configure Build Settings (Auto-detected)

Railway should auto-detect these, but verify in Settings:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Install Command:** `npm install`

### 6. Add Custom Start Command

We need to initialize the database on first deploy:

1. Go to Settings → "Deploy"
2. Set **Start Command** to:
   ```bash
   npm run setup && npm start
   ```

**Note:** This runs setup (creates DB + seeds) before starting. After first deploy, you can change it back to just `npm start`.

### 7. Deploy!

1. Click "Deploy" or push to GitHub
2. Railway will:
   - Pull your code
   - Install dependencies
   - Run build
   - Initialize database
   - Start the app

Watch the logs in the "Deployments" tab.

### 8. Get Your URL

1. Click "Settings"
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Railway gives you a URL like: `drama-tracker-production.up.railway.app`

### 9. First Login

1. Visit your Railway URL
2. Login as "Lowri"
3. Go to "Manage Friends" → Set password for Lowri
4. Done! 🎉

## Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Tells Next.js to run in production mode |
| `DATABASE_URL` | `file:/data/prod.db` | Points to persistent volume for SQLite |

## Database Management on Railway

### View Database

You can't easily browse SQLite on Railway, but you can:

1. Download the database:
   - Railway dashboard → your service → "Data" tab
   - Download the volume

2. Or add Prisma Studio to your deployment (optional)

### Backup Database

**Manual backup:**
1. Go to your service → "Data"
2. Download the volume
3. Save locally

**Automated backup:**
Consider using Railway's [backup addon](https://railway.app/addons) or set up a cron job.

### Reset Database

1. Delete the volume in Railway
2. Create a new volume at `/data`
3. Redeploy (will run setup again)

## Updating Your App

Railway auto-deploys on every push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature X"
git push

# Railway automatically detects the push and redeploys
```

## Troubleshooting

### Build fails

**Check the logs:**
- Go to Deployments → Click on failed deployment → View logs

**Common issues:**
- Missing dependencies: `npm install` in logs
- TypeScript errors: Fix and push again
- Environment variables: Double-check Variables tab

### Database errors

**"Database not found":**
- Check that volume is mounted at `/data`
- Verify `DATABASE_URL=file:/data/prod.db`

**"Database is locked":**
- Multiple instances might be running
- Check Settings → Scale → Should be 1 replica

### App starts but crashes

**Check logs:**
```bash
# In Railway dashboard
Deployments → Latest → View Logs
```

**Common causes:**
- Database not initialized: Run setup command
- Missing environment variables
- Port conflict (Railway auto-assigns PORT)

### Can't login

**Reset admin password:**
Unfortunately, you'll need to reset the database or manually update via downloaded DB.

## Cost Management

### Free Tier ($5/month credit)

Railway gives you $5 free credit every month:
- Enough for small apps with light usage
- ~500 hours of runtime
- No credit card required initially

### Monitor Usage

1. Go to your project
2. Click "Usage" tab
3. See current month's usage
4. Set up billing alerts

### Optimize Costs

- **Scale to zero when not in use:**
  - Settings → Scale → 0 replicas when idle

- **Reduce instance size:**
  - Most apps work fine on smallest instance

- **Monitor database size:**
  - Large databases cost more storage

## Advanced Configuration

### Custom Domain

1. Settings → Networking
2. Click "Custom Domain"
3. Add your domain: `dramatracker.com`
4. Update DNS with Railway's records

### Add HTTPS (Automatic)

Railway automatically provides SSL for:
- Railway domains (*.up.railway.app)
- Custom domains

No configuration needed!

### Environment-based Deploys

Create multiple services for staging/production:

1. New Service → Connect same repo
2. Different branch (e.g., `staging`)
3. Different environment variables

## Monitoring

### View Logs

Real-time logs:
1. Your service → "Observability"
2. View live logs as they come in

### Metrics

Railway provides basic metrics:
- CPU usage
- Memory usage
- Network traffic

## Railway CLI (Optional)

Install for local development:

```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run locally with Railway env vars
railway run npm run dev

# Deploy from CLI
railway up
```

## Next Steps

After successful deployment:

1. ✅ Test all features
2. ✅ Set passwords for all friends
3. ✅ Add some drama to test
4. ✅ Check statistics page
5. ✅ Set up custom domain (optional)
6. ✅ Configure backups

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **Railway Status:** https://status.railway.app

## Migration from Railway

If you ever want to migrate:

1. Download database from Railway volume
2. Export as SQL
3. Import to new platform (follow DEPLOYMENT.md)

Your code is platform-agnostic and works anywhere!
