#!/bin/sh
set -e

# Create database tables
echo "Running Prisma migrations..."
npx prisma db push --skip-generate

# Run database seed (don't crash if it fails)
echo "Running database seed..."
npx tsx scripts/seed.ts || echo "Seed failed or already seeded, continuing..."

# Start the app
echo "Starting server..."
exec node server.js
