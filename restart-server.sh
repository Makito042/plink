#!/bin/bash

# Kill any existing node processes
pkill -f "node.*server/index.js"

# Start the server
cd "$(dirname "$0")"
npm run server
