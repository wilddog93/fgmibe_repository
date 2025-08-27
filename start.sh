#!/bin/sh
set -e

if [ -f "./build/server.js" ]; then
  echo "Starting server.js..."
  exec node ./build/server.js
elif [ -f "./build/index.js" ]; then
  echo "Starting index.js..."
  exec node ./build/index.js
else
  echo "ERROR: Tidak ada build/server.js atau build/index.js"
  ls -la ./build
  exit 1
fi
