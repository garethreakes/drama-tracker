# Migrating from SQLite to PostgreSQL

This guide helps you migrate your existing Drama Tracker data from SQLite to PostgreSQL.

## Why Migrate?

The Drama Tracker now uses PostgreSQL instead of SQLite for:
- **Better Data Persistence**: PostgreSQL databases on Railway persist across deployments
- **Scalability**: Handle more concurrent users
- **Production Ready**: Industry-standard database with robust features
- **Better Backups**: Automatic backups on Railway

## Before You Start

### What You Need

1. **Your existing SQLite database** (usually `prisma/dev.db` or `prisma/prod.db`)
2. **PostgreSQL installed locally** or access to a PostgreSQL server
3. **The latest code** from the repository

### Backup Your Data

```bash
# Backup your SQLite database
cp prisma/dev.db prisma/backup-$(date +%Y%m%d).db
```

## Migration Methods

### Method 1: Manual Export/Import (Recommended for Small Datasets)

This is the simplest method if you have a small amount of data.

#### Step 1: Export Your Data

Use Prisma Studio to view and manually copy your data:

```bash
# With your OLD SQLite setup
npm run prisma:studio
```

Take screenshots or notes of:
- All friends (names, icons, admin status)
- All dramas (titles, details, participants, severity, dates)
- Drama votes

#### Step 2: Set Up PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql@14
brew services start postgresql@14

# Linux
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create new database
createdb drama_tracker_dev
```

#### Step 3: Update Your Code

```bash
# Pull latest code with PostgreSQL support
git pull origin main

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drama_tracker_dev"
NODE_ENV="development"
```

#### Step 4: Initialize PostgreSQL Database

```bash
# Generate Prisma client and run migrations
npm run setup
```

#### Step 5: Re-enter Your Data

Use the web interface or Prisma Studio to re-add your data:

```bash
npm run prisma:studio
```

Add your friends and dramas through the UI.

### Method 2: Automated Migration Script

For larger datasets, use this migration script.

#### Step 1: Install Migration Tool

```bash
npm install -g prisma-sqlite-to-postgres
```

#### Step 2: Create PostgreSQL Database

```bash
createdb drama_tracker_dev
```

#### Step 3: Run Migration

```bash
# Convert SQLite to PostgreSQL dump
sqlite3 prisma/dev.db .dump > dump.sql

# Clean up SQLite-specific syntax
sed -i '' 's/PRAGMA foreign_keys=OFF;//g' dump.sql
sed -i '' 's/BEGIN TRANSACTION;//g' dump.sql
sed -i '' 's/COMMIT;//g' dump.sql

# Import to PostgreSQL
psql drama_tracker_dev < dump.sql
```

⚠️ **Note**: This method may require manual cleanup of SQL syntax differences.

### Method 3: Use Prisma Migrate

#### Step 1: Create a Migration Script

Create `scripts/migrate-sqlite-to-postgres.ts`:

```typescript
import { PrismaClient as SqliteClient } from '@prisma/client'
import { PrismaClient as PostgresClient } from '@prisma/client'

async function migrate() {
  // Connect to SQLite
  const sqlite = new SqliteClient({
    datasources: {
      db: { url: 'file:./prisma/dev.db' }
    }
  })

  // Connect to PostgreSQL
  const postgres = new PostgresClient({
    datasources: {
      db: { url: 'postgresql://postgres:postgres@localhost:5432/drama_tracker_dev' }
    }
  })

  try {
    // Migrate People
    const people = await sqlite.person.findMany()
    for (const person of people) {
      await postgres.person.create({ data: person })
    }

    // Migrate Dramas
    const dramas = await sqlite.drama.findMany({
      include: { participants: true }
    })

    for (const drama of dramas) {
      const { participants, ...dramaData } = drama
      await postgres.drama.create({
        data: {
          ...dramaData,
          participants: {
            connect: participants.map(p => ({ id: p.id }))
          }
        }
      })
    }

    // Migrate Votes
    const votes = await sqlite.dramaSeverityVote.findMany()
    for (const vote of votes) {
      await postgres.dramaSeverityVote.create({ data: vote })
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await sqlite.$disconnect()
    await postgres.$disconnect()
  }
}

migrate()
```

#### Step 2: Run Migration

```bash
tsx scripts/migrate-sqlite-to-postgres.ts
```

## Migrating Railway Deployment

### Step 1: Add PostgreSQL to Railway

1. Go to your Railway project
2. Click "New" → "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL instance

### Step 2: Link Database

Railway automatically sets `DATABASE_URL` for your web service.

### Step 3: Deploy New Code

```bash
git add .
git commit -m "Migrate to PostgreSQL"
git push
```

### Step 4: Run Migrations on Railway

Railway will automatically run migrations during deployment via `nixpacks.toml`.

### Step 5: Seed Production Data

You have two options:

**Option A: Manual Entry**
- Log in to your Railway deployment
- Use the web interface to add friends and dramas

**Option B: Import via Railway CLI**
```bash
# Export from local SQLite
npm run prisma:studio  # Export data manually

# Or use railway run to seed
railway run npm run db:seed
```

## Verification

After migration, verify everything works:

### Check Database

```bash
# Local
npm run prisma:studio

# Railway
railway run npx prisma studio
```

### Verify Data

- [ ] All friends are present with correct names and icons
- [ ] All dramas exist with correct titles and participants
- [ ] Drama severity ratings are preserved
- [ ] Admin users have correct permissions
- [ ] Votes are associated with correct dramas and people

## Troubleshooting

### "Relation already exists" Error

If you see this error:

```bash
dropdb drama_tracker_dev
createdb drama_tracker_dev
npm run setup
```

### Data Types Don't Match

PostgreSQL is stricter about data types. Common issues:

- **Dates**: SQLite stores as strings, PostgreSQL as TIMESTAMP
  - Fix: Use `new Date(sqliteDate)` when migrating

- **Booleans**: SQLite uses 0/1, PostgreSQL uses true/false
  - Fix: Use `!!value` to convert

### Performance After Migration

PostgreSQL should be faster, but if you notice issues:

```bash
# Analyze tables
psql drama_tracker_dev
ANALYZE;
```

## Rollback Plan

If you need to rollback:

### Local Development

1. Restore your SQLite backup:
   ```bash
   cp prisma/backup-YYYYMMDD.db prisma/dev.db
   ```

2. Revert your code:
   ```bash
   git checkout <previous-commit>
   ```

### Railway Deployment

1. Revert your deployment in Railway dashboard
2. Or push a rollback commit:
   ```bash
   git revert HEAD
   git push
   ```

## Getting Help

If you encounter issues:

1. Check the [README.md](README.md) for updated instructions
2. Review [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md) for Railway-specific guidance
3. Ensure you have the latest code: `git pull origin main`
4. Open an issue with:
   - Error message
   - Migration method used
   - Database sizes (number of records)

## Post-Migration Cleanup

After successful migration:

```bash
# Remove old SQLite files
rm prisma/*.db
rm prisma/*.db-journal

# Keep backup for a while
mv prisma/backup-*.db ~/Backups/
```

## Benefits of PostgreSQL

After migration, you'll have:

✅ **Data Persistence**: Database survives Railway deployments
✅ **Better Performance**: Optimized for concurrent access
✅ **Automatic Backups**: Railway handles backups
✅ **Scalability**: Ready for growth
✅ **Industry Standard**: Used by major applications

Enjoy your upgraded Drama Tracker! 🎭✨
