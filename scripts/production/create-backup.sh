#!/bin/bash

# Production Database Backup Script
# Creates timestamped backup of PostgreSQL database

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/arkan_backup_${TIMESTAMP}.sql"
BACKUP_FILE_COMPRESSED="${BACKUP_FILE}.gz"

# Database connection (from environment or defaults)
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
DB_NAME="${DATABASE_NAME:-arkan_dev}"
DB_USER="${DATABASE_USER:-arkan_user}"

echo -e "${YELLOW}=== PostgreSQL Database Backup ===${NC}"
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Backup Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Output: $BACKUP_FILE_COMPRESSED"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump command not found${NC}"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --clean --if-exists \
    -f "$BACKUP_FILE"; then
    
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip "$BACKUP_FILE"
    
    # Get file size
    SIZE=$(du -h "$BACKUP_FILE_COMPRESSED" | cut -f1)
    
    echo -e "${GREEN}✓ Backup compressed${NC}"
    echo ""
    echo -e "${GREEN}=== Backup Complete ===${NC}"
    echo "  File: $BACKUP_FILE_COMPRESSED"
    echo "  Size: $SIZE"
    echo ""
    
    # List recent backups
    echo -e "${YELLOW}Recent backups:${NC}"
    ls -lh "$BACKUP_DIR" | tail -5
    
    # Cleanup old backups (keep last 30 days)
    echo ""
    echo -e "${YELLOW}Cleaning up old backups (>30 days)...${NC}"
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
    echo -e "${GREEN}✓ Cleanup complete${NC}"
    
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}To restore this backup, run:${NC}"
echo "  gunzip -c $BACKUP_FILE_COMPRESSED | psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
