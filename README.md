# Drama Tracker

A fun, colorful web app for tracking drama between friends with severity ratings, monthly drama queen awards, statistics, and password-protected access.

## Features

- 🎭 **Track Dramas** - Record dramas with title, details, and participants
- 🔥 **Severity Ratings** - 5-level scale (Minor to Severe) with emoji indicators
- 👑 **Monthly Drama Queen** - Automatic monthly awards with history
- 📊 **Statistics** - Visualize trends with interactive charts
- ✅ **Finish Dramas** - Mark dramas as resolved and filter by status
- 🔒 **Authentication** - Password-protected with admin controls
- 👤 **Custom Icons** - Assign emoji icons to friends
- ✨ **Beautiful UI** - Gradient design with playful styling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Charts**: Recharts
- **Authentication**: Cookie-based sessions
- **Testing**: Vitest + Testing Library, Playwright

## Prerequisites

- Node.js 18+ or 20+
- npm (comes with Node.js)
- PostgreSQL 14+ (locally or via Railway)
- Works on Linux, macOS, and Windows
- For production deployment, see [DEPLOY-RAILWAY.md](DEPLOY-RAILWAY.md)

## Quick Start (Local Development)

1. **Install PostgreSQL**
   ```bash
   # macOS with Homebrew
   brew install postgresql@14
   brew services start postgresql@14

   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   sudo systemctl start postgresql

   # Windows: Download installer from postgresql.org
   ```

2. **Create Database**
   ```bash
   createdb drama_tracker_dev
   ```

3. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd drama-tracker
   npm install
   ```

4. **Set Up Environment**
   ```bash
   cp .env.example .env
   # Edit .env if your PostgreSQL credentials differ
   ```

5. **Initialize Database**
   ```bash
   npm run setup
   ```
   This will:
   - Generate Prisma client
   - Run database migrations
   - Add default friends (Lowri, Emma, Melissa, Grace, Ella, Sofia)
   - Set Lowri as admin

6. **Start Development Server**
   ```bash
   npm run dev
   ```

7. **Open Browser**
   - Navigate to http://localhost:3000
   - Login with: Lowri (set password via "Manage Friends" when first prompted)

## Deployment to Another Server

### Production Deployment Steps

1. **On your server, install Node.js 18+ or 20+**

2. **Clone and set up the project:**
   ```bash
   git clone <your-repo-url>
   cd drama-tracker
   npm install
   ```

3. **Configure environment for production:**
   ```bash
   cp .env.example .env
   nano .env  # or use your preferred editor
   ```

   Update `.env` for production:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/drama_tracker"
   NODE_ENV="production"
   ```

4. **Initialize the database:**
   ```bash
   npm run setup
   ```

5. **Build the application:**
   ```bash
   npm run build
   ```

6. **Start the production server:**
   ```bash
   npm start
   ```

   The app will be available at http://localhost:3000

### Option: Using PM2 Process Manager (Recommended)

For production, use PM2 to keep the app running and restart on crashes/reboots:

```bash
# Install PM2 globally
npm install -g pm2

# Start the app
pm2 start npm --name "drama-tracker" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command it outputs

# View logs
pm2 logs drama-tracker

# Restart app
pm2 restart drama-tracker

# Stop app
pm2 stop drama-tracker
```

### Option: Nginx Reverse Proxy

To expose the app on port 80/443 with a domain:

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

For HTTPS, use Let's Encrypt:
```bash
sudo certbot --nginx -d your-domain.com
```

## Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run setup` - Complete database setup (generate + migrate + seed)
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Create and apply new migration
- `npm run db:seed` - Seed database with initial friends
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

### Testing
- `npm test` - Run all unit/integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI
- `npm run e2e` - Run Playwright E2E tests
- `npm run e2e:ui` - Run E2E tests in UI mode

## Environment Variables

Create a `.env` file with these variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drama_tracker_dev"

# Node Environment
NODE_ENV="development"
```

For production, change to:
```env
DATABASE_URL="postgresql://user:password@host:5432/drama_tracker"
NODE_ENV="production"
```

## Database Management

### Backup Database
```bash
# Create PostgreSQL backup
pg_dump drama_tracker_dev > backup-$(date +%Y%m%d).sql
```

### Restore Database
```bash
# Restore from backup
psql drama_tracker_dev < backup-20251030.sql
```

### Reset Database
```bash
dropdb drama_tracker_dev
createdb drama_tracker_dev
npm run setup
```

### View/Edit Database Visually
```bash
npm run prisma:studio
# Opens at http://localhost:5555
```

## Initial Setup & First Use

1. After deployment, visit the app URL
2. You'll be redirected to the login page
3. Login as "Lowri" (the default admin)
4. Set Lowri's password from "Manage Friends"
5. Add passwords for other friends
6. Start tracking drama!

## Data Model

### Person
- `id` - Unique identifier
- `name` - Person's name (unique, case-insensitive)
- `icon` - Emoji icon (default: 👤)
- `password` - Hashed password (nullable)
- `isAdmin` - Admin status (boolean)
- `createdAt` - Creation timestamp
- `dramas` - Related dramas (many-to-many)

### Drama
- `id` - Unique identifier
- `title` - Short drama summary (required)
- `details` - Optional longer description
- `severity` - Severity level 1-5 (default: 3)
- `isFinished` - Completion status (default: false)
- `finishedAt` - Completion timestamp (nullable)
- `createdAt` - Creation timestamp
- `participants` - Related people (many-to-many, min 2)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with name and password
- `POST /api/auth/logout` - Logout current user

### People
- `GET /api/people` - List all people
- `POST /api/people` - Create new person
- `GET /api/people/[id]` - Get person by ID
- `PUT /api/people/[id]` - Update person
- `DELETE /api/people/[id]` - Delete person
- `PATCH /api/people/[id]/password` - Change password

### Dramas
- `GET /api/dramas` - List all dramas with participants
- `POST /api/dramas` - Create new drama
- `GET /api/dramas/[id]` - Get drama by ID
- `PUT /api/dramas/[id]` - Update drama
- `DELETE /api/dramas/[id]` - Delete drama
- `PATCH /api/dramas/[id]/finish` - Toggle finish status

## Project Structure

```
drama-tracker/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── people/               # People endpoints
│   │   └── dramas/               # Drama endpoints
│   ├── drama/                    # Drama pages
│   │   ├── new/                  # Add drama
│   │   └── edit/[id]/            # Edit drama
│   ├── friends/                  # Friend management
│   │   ├── page.tsx              # List friends
│   │   └── edit/[id]/            # Edit friend
│   ├── login/                    # Login page
│   ├── statistics/               # Statistics page
│   ├── page.tsx                  # Home page
│   ├── layout.tsx                # Root layout with nav
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── AddFriendForm.tsx
│   ├── AddDramaForm.tsx
│   ├── EditDramaForm.tsx
│   ├── DramaCard.tsx
│   ├── DramaList.tsx             # Drama filtering
│   ├── UserMenu.tsx              # User dropdown
│   ├── PasswordChangeForm.tsx
│   └── Charts/
│       ├── PerPersonBar.tsx
│       └── PerWeekLine.tsx
├── lib/                          # Utilities
│   ├── prisma.ts                 # Prisma client
│   ├── auth.ts                   # Auth utilities
│   └── analytics.ts              # Analytics functions
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   ├── seed.ts                   # Seed script
│   └── migrations/               # Database migrations
├── middleware.ts                 # Route protection
├── .env                          # Environment variables
└── .env.example                  # Example env file
```

## Troubleshooting

### Port 3000 already in use
```bash
# Option 1: Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Option 1 (Linux alternative if lsof not available)
sudo netstat -tlnp | grep :3000
sudo kill -9 <PID>

# Option 2: Change port
# Edit package.json scripts to use -p 3001
```

### Prisma errors after schema changes
```bash
npm run prisma:generate
npm run prisma:migrate
# Restart the server
```

### Can't connect to PostgreSQL
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Start PostgreSQL if needed
brew services start postgresql@14  # macOS
sudo systemctl start postgresql    # Linux
```

### Can't log in / Forgot password
For admin (Lowri), you can reset the password:
```bash
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); const password = Buffer.from('newpassword').toString('base64'); prisma.person.update({ where: { name: 'Lowri' }, data: { password } }).then(() => console.log('Password updated!')).finally(() => prisma.\$disconnect())"
```

### Build fails
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Security Notes

⚠️ **Important for Production:**

1. **Password Hashing**: The current implementation uses Base64 encoding for demo purposes. For production with sensitive data, implement bcrypt:
   ```bash
   npm install bcrypt
   # Update lib/auth.ts to use bcrypt.hash() and bcrypt.compare()
   ```

2. **HTTPS**: Always use HTTPS in production (use Let's Encrypt with Nginx)

3. **Environment Variables**: Never commit `.env` to version control

4. **Database Backups**: Set up regular backups of your SQLite database

5. **Strong Passwords**: Enforce strong passwords for admin accounts

6. **Firewall**: Configure firewall to only expose necessary ports

## Performance

- PostgreSQL is suitable for production deployments
- Railway provides managed PostgreSQL with automatic backups
- Enable gzip compression in Nginx for better performance
- Use connection pooling for high-traffic deployments

## License

Private project for personal use.

## Contributors

Built for tracking friend group drama in a fun, colorful, and organized way! 🎭✨
