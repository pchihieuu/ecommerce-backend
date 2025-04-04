#!/bin/bash

run_tests() {
  echo "Running application tests..."
  
  # Build test environment if needed
  # docker compose -f docker-compose.test.yml up -d
  
  # Run tests
  docker exec ecom-backend npm test
  
  echo "Tests completed."
}