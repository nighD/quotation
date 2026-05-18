#!/bin/bash
set -e

# ==========================================
# VPS Setup Script for Ubuntu 24
# ==========================================

echo "=========================================="
echo "Updating system..."
echo "=========================================="
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y

echo "=========================================="
echo "Installing prerequisites..."
echo "=========================================="
apt-get install -y ca-certificates curl gnupg ufw rsync

echo "=========================================="
echo "Configuring UFW firewall..."
echo "=========================================="
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "=========================================="
echo "Installing Docker..."
echo "=========================================="
install -m 0755 -d /etc/apt/keyrings
if [ ! -f /etc/apt/keyrings/docker.gpg ]; then
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
fi

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ensure docker service is running
systemctl enable docker
systemctl start docker

# Add non-root user to docker group if a normal user is specified
if [ -n "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    echo "Added $SUDO_USER to the docker group."
fi

echo "=========================================="
echo "VPS Setup Complete!"
echo "Docker is installed and the firewall is configured."
echo "If you are using a non-root user, you may need to log out and log back in for Docker permissions to take effect."
echo "=========================================="
