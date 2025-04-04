# Makefile cho Ecommerce Backend

# Variables
DOCKER_COMPOSE = docker compose
APP_NAME = ecommerce-backend
CONTAINER_NAME = ecom-backend

# Default target
.PHONY: help
help:
	@echo "Makefile commands:"
	@echo "  make build         - Build Docker image"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make restart       - Restart all services"
	@echo "  make logs          - Show logs from all services"
	@echo "  make logs-backend  - Show logs from backend service"
	@echo "  make shell         - Get shell access to the backend container"
	@echo "  make mongo-shell   - Access MongoDB shell"
	@echo "  make redis-cli     - Access Redis CLI"
	@echo "  make clean         - Remove all containers, volumes, networks"
	@echo "  make status        - Check status of containers"

# Build the Docker image
.PHONY: build
build:
	$(DOCKER_COMPOSE) build

# Start all services
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d

# Stop all services
.PHONY: down
down:
	$(DOCKER_COMPOSE) down

# Restart all services
.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

# Show logs from all services
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Show logs from backend service
.PHONY: logs-backend
logs-backend:
	$(DOCKER_COMPOSE) logs -f $(CONTAINER_NAME)

# Get shell access to the backend container
.PHONY: shell
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

# Access MongoDB shell
.PHONY: mongo-shell
mongo-shell:
	docker exec -it ecom-mongodb mongosh

# Access Redis CLI
.PHONY: redis-cli
redis-cli:
	docker exec -it ecom-redis redis-cli

# Remove all containers, volumes, networks
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v --remove-orphans

# Check status of containers
.PHONY: status
status:
	docker ps -a | grep 'ecom-'