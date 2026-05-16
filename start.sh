#!/bin/bash

echo "=========================================="
echo "🚀 Starting Quotation Development Server"
echo "=========================================="

# Trap Ctrl+C (SIGINT) to gracefully shut down both services
trap 'echo -e "\n🛑 Stopping services..."; kill 0' SIGINT SIGTERM EXIT

# 1. Start Backend in the background
echo "-> Starting Backend (Go)..."
cd backend
# Using local run. If you prefer docker, replace 'make run' with 'make docker-up'
make run &
cd ..

# Optional: give backend a second to start up
sleep 2

# 2. Start Frontend in the foreground (so you can see its logs)
echo "-> Starting Frontend (Vite)..."
cd frontend
npm run dev
