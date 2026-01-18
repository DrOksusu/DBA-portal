#!/bin/bash

# DBA Portal - Prisma Migration Script
# Runs Prisma migrations for all microservices

set -e

echo "=========================================="
echo "DBA Portal - Database Migration"
echo "=========================================="

SERVICES=("auth-service" "revenue-service" "hr-service" "inventory-service" "marketing-service" "clinic-service")

for SERVICE in "${SERVICES[@]}"; do
    echo ""
    echo "----------------------------------------"
    echo "Migrating: $SERVICE"
    echo "----------------------------------------"

    cd "services/$SERVICE"

    if [ -f "prisma/schema.prisma" ]; then
        echo "Running Prisma migrations..."
        npx prisma migrate deploy
        echo "Generating Prisma client..."
        npx prisma generate
        echo "$SERVICE migration completed!"
    else
        echo "Warning: No Prisma schema found for $SERVICE"
    fi

    cd ../..
done

echo ""
echo "=========================================="
echo "All migrations completed!"
echo "=========================================="
