#!/bin/bash
set -e

echo "Building Vite renderer..."
npm run build:vite

echo "Removing Linux node_modules..."
rm -rf node_modules

echo "Installing Windows dependencies with Wine..."
wine npm install

echo "Rebuilding native modules for Windows..."
npx electron-builder --win --publish never

echo "Build complete! Check release/win-unpacked/"
