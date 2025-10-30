# Deploy to Railway with PostgreSQL

Complete guide to deploying Drama Tracker on Railway.app with managed PostgreSQL database.

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

### 3. Add PostgreSQL Database

Railway provides managed PostgreSQL:

1. In your project, click "New"
2. Select "Database"
3. Choose "Add PostgreSQL"
4. Railway will create a PostgreSQL instance

### 4. Link Database to Service

Railway automatically sets the `DATABASE_URL` environment variable:

1. Click on your web service
2. Go to "Variables" tab
3. Verify `DATABASE_URL` is set (Railway does this automatically)
4. Add `NODE_ENV=production`

**Note:** Railway automatically connects your service to the PostgreSQL database!

### 5. Configure Build Settings (Auto-detected)

Railway should auto-detect these, but verify in Settings:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`
- **Install Command:** `npm install`

### 6. First Deploy - Seed the Database

After the first deployment succeeds:

1. Go to your service
2. Click on the latest deployment
3. You can run the seed command via Railway CLI (optional):
   ```bash
   railway run npm run db:seed
   ```

Or just log in and add data through the UI!

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
| `DATABASE_URL` | `postgresql://...` | Auto-set by Railway, points to PostgreSQL database |

## Database Management on Railway

### View Database

Railway provides multiple ways to access your PostgreSQL database:

1. **Railway Dashboard:**
   - Click on PostgreSQL service
   - Go to "Data" tab
   - Browse tables directly

2. **psql CLI:**
   ```bash
   railway connect postgres
   ```

3. **Prisma Studio (local):**
   ```bash
   # Copy DATABASE_URL from Railway
   DATABASE_URL="postgresql://..." npx prisma studio
   ```

### Backup Database

Railway automatically backs up your PostgreSQL database!

**Manual backup:**
```bash
# Using Railway CLI
railway connect postgres
pg_dump > backup-$(date +%Y%m%d).sql
```

### Reset Database

**Warning:** This will delete all data!

```bash
railway connect postgres
# Then in psql:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# Run migrations again
railway run npx prisma migrate deploy
railway run npm run db:seed
```

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

**"Can't connect to database":**
- Verify PostgreSQL service is running in Railway
- Check that services are linked (DATABASE_URL should be auto-set)
- Look for migration errors in deployment logs

**"Table does not exist":**
- Migrations may not have run
- Check deployment logs for `prisma migrate deploy` output
- Manually run: `railway run npx prisma migrate deploy`

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

1. Export database:
   ```bash
   railway connect postgres
   pg_dump > export.sql
   ```

2. Import to new PostgreSQL instance:
   ```bash
   psql -h newhost -U user -d database < export.sql
   ```

3. Update `DATABASE_URL` in your new environment

Your code is platform-agnostic and works with any PostgreSQL database!
