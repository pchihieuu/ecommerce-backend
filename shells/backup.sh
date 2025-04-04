#!/bin/bash

# backup.sh - Script to backup MongoDB data
backup_mongodb() {
  TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
  BACKUP_DIR="./backups/mongodb"
  
  # Create backup directory if it doesn't exist
  mkdir -p $BACKUP_DIR
  
  echo "Starting MongoDB backup..."
  docker exec ecom-mongodb mongodump --out=/tmp/backup_$TIMESTAMP
  docker cp ecom-mongodb:/tmp/backup_$TIMESTAMP $BACKUP_DIR/
  
  echo "Backup completed: $BACKUP_DIR/backup_$TIMESTAMP"
}