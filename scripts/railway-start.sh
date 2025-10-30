#!/bin/bash
set -e

echo "🚀 Starting Drama Tracker deployment..."

# Run database migrations
echo "📦 Running database migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations completed successfully"
else
    echo "⚠️  Migration failed with exit code $?"
    echo "Attempting to continue anyway..."
fi

# Seed database if empty (only on first deploy)
echo "🌱 Checking if database needs seeding..."
if npm run db:seed 2>&1 | grep -q "Created"; then
    echo "✅ Database seeded successfully"
else
    echo "ℹ️  Database already has data or seeding skipped"
fi

# Start the application
echo "🎭 Starting application..."
exec npm start
