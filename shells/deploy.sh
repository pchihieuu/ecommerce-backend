#!/bin/bash

# deploy.sh - Script for deployment
deploy() {
  echo "Starting deployment process..."
  
  # Pull latest changes
  git pull
  
  # Build new docker image
  docker compose build
  
  # Apply migrations if needed
  # docker exec -it ecom-backend node src/scripts/migrate.js
  
  # Restart services
  docker compose up -d
  
  echo "Deployment completed successfully!"
}