#!/bin/sh
set -e

# Function to wait for service to be ready
wait_for_service() {
  HOST=$1
  PORT=$2
  SERVICE_NAME=$3
  echo "Waiting for $SERVICE_NAME at $HOST:$PORT..."
  
  while ! nc -z $HOST $PORT; do
    echo "$SERVICE_NAME not available yet, waiting..."
    sleep 1
  done
  
  echo "$SERVICE_NAME is up and running!"
}

# Sử dụng các biến từ .env.production nếu không có biến nào được set
: ${MONGODB_HOST:=ecom-mongodb}
: ${MONGODB_PORT:=27017}
: ${RABBITMQ_HOST:=ecom-rabbitmq}
: ${RABBITMQ_PORT:=5672}
: ${REDIS_HOST:=ecom-redis}
: ${REDIS_PORT:=6379}

# Wait for MongoDB
wait_for_service $MONGODB_HOST $MONGODB_PORT "MongoDB"

# Wait for RabbitMQ
wait_for_service $RABBITMQ_HOST $RABBITMQ_PORT "RabbitMQ"

# Wait for Redis
wait_for_service $REDIS_HOST $REDIS_PORT "Redis"

# Apply database migrations or seeds if needed
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  # Add your migration command here
  # node src/scripts/migrate.js
fi

# Set NODE_ENV if not already set
: ${NODE_ENV:=production}

# Check if the command starts with node
if [ "${1#node }" != "$1" ] || [ "$1" = "npm" ]; then
  echo "Starting application with command: $@"
  exec "$@"
else
  echo "Starting application with default command: node src/server.js"
  exec node src/server.js
fi