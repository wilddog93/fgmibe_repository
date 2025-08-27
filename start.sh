#!/bin/sh
# start.sh: jalankan build/server.js atau fallback ke build/index.js

if [ -f "build/server.js" ]; then
  echo "Starting build/server.js..."
  node build/server.js
elif [ -f "build/index.js" ]; then
  echo "Starting build/index.js..."
  node build/index.js
else
  echo "ERROR: Tidak ada build/server.js atau build/index.js"
  ls -la build
  exit 1
fi
