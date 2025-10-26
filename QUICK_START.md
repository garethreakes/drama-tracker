# Drama Tracker - Quick Start Guide

Welcome to Drama Tracker! This guide will get you up and running in under 5 minutes.

## Prerequisites

Make sure you have Node.js (18.x or 20.x) installed:

```bash
node --version
```

If not installed, download from [nodejs.org](https://nodejs.org/)

## Setup Steps

### 1. Navigate to the project directory

```bash
cd drama-tracker
```

### 2. Install all dependencies

```bash
npm install
```

This will install Next.js, React, Prisma, testing libraries, and all other dependencies.

### 3. Setup the database

```bash
npm run prisma:generate && npm run db:push && npm run db:seed
```

This single command will:
- Generate the Prisma client
- Create the SQLite database
- Seed it with 6 friends (Lowri, Emma, Melissa, Grace, Ella, Sofia)
- Add 4 sample dramas for testing

### 4. Start the development server

```bash
npm run dev
```

### 5. Open your browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Drama Tracker home page with:
- Sample dramas already populated
- An "Add New Friend" form
- An "Add New Drama" button

## Testing the App

### Run Unit/Integration Tests

```bash
npm test
```

### Run E2E Tests

```bash
npm run e2e
```

Note: E2E tests will automatically start a development server.

## What to Try

1. **View Existing Drama**: Click on drama cards to expand and see details
2. **Add a Friend**: Use the form on the home page to add "Ava"
3. **Create Drama**: Click "Add New Drama" and select at least 2 people
4. **View Statistics**: Click "Statistics" in the nav to see charts and metrics

## Common Issues

### Port 3000 already in use

If port 3000 is busy, you can specify a different port:

```bash
PORT=3001 npm run dev
```

### Database locked error

If you see database locked errors, make sure:
- No other instances of the app are running
- Delete `prisma/dev.db` and run `npm run db:push && npm run db:seed` again

### Tests failing

Make sure to:
- Run `npm run prisma:generate` before running tests
- Check that all dependencies are installed with `npm install`

## Project Structure Overview

```
drama-tracker/
├── app/              # Pages and API routes
├── components/       # React components
├── lib/              # Utilities and database client
├── prisma/           # Database schema and seeds
├── tests/            # Unit tests
└── e2e/              # End-to-end tests
```

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Explore the codebase
- Run the test suites to see coverage
- Deploy to Vercel (see README for deployment notes)

Enjoy tracking drama! 🎭
