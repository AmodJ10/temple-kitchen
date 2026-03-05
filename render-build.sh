#!/usr/bin/env bash
set -e

echo "==> Installing root dependencies (includes zod for shared/)..."
npm install

echo "==> Installing client dependencies & building..."
cd client && npm install --include=dev && npm run build && cd ..

echo "==> Installing server dependencies..."
cd server && npm install && cd ..

echo "==> Build complete!"
