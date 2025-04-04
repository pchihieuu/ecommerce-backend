#!/bin/bash

# logs-cleanup.sh - Script to clean up logs
cleanup_logs() {
  echo "Cleaning up container logs..."
  
  # Find and truncate all container log files
  sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' ecom-backend)
  sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' ecom-mongodb)
  sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' ecom-rabbitmq)
  sudo truncate -s 0 $(docker inspect --format='{{.LogPath}}' ecom-redis)
  
  echo "Container logs have been cleaned up."
}