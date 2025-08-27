#!/bin/sh
# start.sh

BUILD_DIR=build

if [ -f "$BUILD_DIR/server.js" ]; then
  echo "Starting server.js..."
  node "$BUILD_DIR/server.js"
elif [ -f "$BUILD_DIR/index.js" ]; then
  echo "Starting index.js..."
  node "$BUILD_DIR/index.js"
else
  echo "ERROR: Tidak ada $BUILD_DIR/server.js atau $BUILD_DIR/index.js"
  ls -la "$BUILD_DIR"
  exit 1
fi
