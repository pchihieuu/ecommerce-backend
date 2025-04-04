#!/bin/bash
check_health() {
  echo "Checking application health..."
  
  # Check containers status
  echo "Container status:"
  docker ps --format "table {{.Names}}\t{{.Status}}" | grep ecom-
  
  # Check backend health endpoint if available
  echo "API Health check:"
  curl -s http://localhost:3055/health || echo "Health endpoint not available"
  
  # Check MongoDB connection
  echo "MongoDB connection:"
  docker exec ecom-mongodb mongosh --eval "db.adminCommand('ping')" | grep ok
  
  # Check Redis connection
  echo "Redis connection:"
  docker exec ecom-redis redis-cli ping
  
  echo "Health check completed."
}
