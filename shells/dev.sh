#!/bin/bash

source ./backup.sh
source ./deploy.sh
source ./logs-cleanup.sh
source ./check-heath.sh
source ./run-tests.sh

show_help() {
  echo "Available scripts:"
  echo "  backup-mongodb - Backup MongoDB data"
  echo "  deploy - Deploy the application"
  echo "  cleanup-logs - Clean up container logs"
  echo "  check-health - Check application health"
  echo "  run-tests - Run application tests"
}

# Execute the specified function or show help
if [ "$1" = "backup-mongodb" ]; then
  backup_mongodb
elif [ "$1" = "deploy" ]; then
  deploy
elif [ "$1" = "cleanup-logs" ]; then
  cleanup_logs
elif [ "$1" = "check-health" ]; then
  check_health
elif [ "$1" = "run-tests" ]; then
  run_tests
else
  show_help
fi