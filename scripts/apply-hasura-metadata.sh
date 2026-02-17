#!/bin/bash
# Apply Hasura Metadata Script

set -e

echo "========================================="
echo "   Applying Hasura Metadata"
echo "========================================="

# Check if Hasura CLI is installed
if ! command -v hasura &> /dev/null; then
    echo "❌ Hasura CLI not found. Installing..."
    npm install --global hasura-cli
fi

# Check if Hasura is running
if ! curl -s http://localhost:8080/healthz > /dev/null; then
    echo "❌ Hasura is not running. Start it with: docker compose up -d"
    exit 1
fi

echo "✅ Hasura is running"

# Navigate to hasura directory
cd hasura

# Apply metadata
echo "📦 Applying metadata..."
hasura metadata apply --endpoint http://localhost:8080 --admin-secret "${HASURA_ADMIN_SECRET:-hasura-admin-secret}"

# Reload metadata
echo "🔄 Reloading metadata..."
hasura metadata reload --endpoint http://localhost:8080 --admin-secret "${HASURA_ADMIN_SECRET:-hasura-admin-secret}"

echo ""
echo "========================================="
echo "   ✅ Hasura Metadata Applied!"
echo "========================================="
echo ""
echo "Access Hasura Console:"
echo "  http://localhost:8080"
echo ""
echo "Admin Secret: ${HASURA_ADMIN_SECRET:-hasura-admin-secret}"
echo ""
