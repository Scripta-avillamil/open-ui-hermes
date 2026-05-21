#!/bin/sh
set -e

# Run database seed
echo "Running database seed..."
npx tsx scripts/seed.ts

# Start the app
echo "Starting server..."
exec node server.js
