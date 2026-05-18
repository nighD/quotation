#!/bin/bash
set -e

# ==========================================
# Deployment Script for VPS
# ==========================================

if [ "$#" -lt 1 ]; then
    echo "Usage: ./deploy_to_vps.sh <user@vps_ip> [port] [setup]"
    echo "Example (default port 22): ./deploy_to_vps.sh root@123.45.67.89"
    echo "Example (custom port): ./deploy_to_vps.sh root@123.45.67.89 2222"
    echo "Example (with setup): ./deploy_to_vps.sh root@123.45.67.89 2222 setup"
    exit 1
fi

REMOTE_SERVER=$1
PORT=${2:-22}
SETUP_FLAG=$3

# Handle case where user runs `./deploy_to_vps.sh user@ip setup` (without port)
if [ "$PORT" == "setup" ]; then
    PORT=22
    SETUP_FLAG="setup"
fi

DEPLOY_DIR="/opt/quotation-app"
SSH_CMD="ssh -p $PORT"

echo "Note: Because you are using a password, your terminal will prompt you to type your password a few times during this process."
echo "For a smoother experience in the future, it is highly recommended to set up SSH keys."
echo "=========================================="

# Step 1: Run VPS setup if requested
if [ "$SETUP_FLAG" == "setup" ]; then
    echo "Running initial setup on $REMOTE_SERVER (Port $PORT)..."
    $SSH_CMD $REMOTE_SERVER "bash -s" < vps_setup.sh
fi

echo "=========================================="
echo "Deploying to $REMOTE_SERVER..."
echo "=========================================="

# Create deployment directory on remote
$SSH_CMD $REMOTE_SERVER "mkdir -p $DEPLOY_DIR"

# Step 2: Sync files to VPS
echo "Syncing project files to VPS..."
rsync -avz --delete \
    -e "ssh -p $PORT" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'venv' \
    --exclude 'frontend/node_modules' \
    --exclude 'frontend/dist' \
    --exclude 'backend/storage/uploads/*' \
    --exclude 'backend/storage/temp/*' \
    --exclude 'data' \
    --exclude '.DS_Store' \
    ./ $REMOTE_SERVER:$DEPLOY_DIR/

# Step 3: Run docker-compose on the remote server
echo "Starting Docker containers on VPS..."

if [ "$SETUP_FLAG" == "debug" ] || [ "$4" == "debug" ]; then
    echo "Gathering debug info..."
    $SSH_CMD $REMOTE_SERVER "cd $DEPLOY_DIR && docker ps -a && docker logs quotation_frontend"
    exit 0
fi

if [ "$SETUP_FLAG" == "setup-ssl" ] || [ "$4" == "setup-ssl" ]; then
    echo "Running initial SSL Certbot setup..."
    $SSH_CMD $REMOTE_SERVER "cd $DEPLOY_DIR && chmod +x init-letsencrypt.sh && ./init-letsencrypt.sh"
else
    $SSH_CMD $REMOTE_SERVER "cd $DEPLOY_DIR && docker compose -f docker-compose.prod.yml up -d --build"
fi

echo "=========================================="
echo "Deployment Complete!"
echo "Your app should now be running."
echo "Check it out at: http://${REMOTE_SERVER#*@}"
echo "=========================================="
