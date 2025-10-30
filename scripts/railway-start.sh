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

# Start the application
echo "🎭 Starting application..."
exec npm start
