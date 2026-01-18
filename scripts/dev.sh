#!/bin/bash

# DBA Portal - Development Setup Script
# Sets up the development environment

set -e

echo "=========================================="
echo "DBA Portal - Development Setup"
echo "=========================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Build shared libraries
echo ""
echo "Building shared libraries..."
cd shared/types && npm run build && cd ../..
cd shared/utils && npm run build && cd ../..
cd shared/auth-middleware && npm run build && cd ../..
cd shared/service-client && npm run build && cd ../..

# Start Docker services
echo ""
echo "Starting Docker services..."
docker-compose -f docker-compose.dev.yml up -d mysql

# Wait for MySQL to be ready
echo ""
echo "Waiting for MySQL to be ready..."
sleep 10

# Run migrations
echo ""
echo "Running database migrations..."
./scripts/migrate-all.sh

echo ""
echo "=========================================="
echo "Development setup completed!"
echo "=========================================="
echo ""
echo "To start all services:"
echo "  docker-compose -f docker-compose.dev.yml up"
echo ""
