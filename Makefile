.PHONY: help up down build logs clean restart migrate seed stats shell-api shell-db

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Start all services
	docker-compose up -d
	@echo "✅ Services started!"
	@echo "   Frontend: http://localhost:3000"
	@echo "   API: http://localhost:5000"
	@echo "   API Docs: http://localhost:5000/docs"
	@echo "   pgAdmin: http://localhost:5050"

down: ## Stop all services
	docker-compose down

build: ## Build all containers
	docker-compose build

logs: ## View logs from all services
	docker-compose logs -f

logs-api: ## View API logs
	docker-compose logs -f api

logs-frontend: ## View frontend logs
	docker-compose logs -f frontend

logs-db: ## View database logs
	docker-compose logs -f postgres

clean: ## Stop services and remove volumes
	docker-compose down -v
	@echo "✅ Cleaned up!"

restart: ## Restart all services
	docker-compose restart

restart-api: ## Restart API service
	docker-compose restart api

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

migrate: ## Run database migrations
	docker-compose exec api alembic upgrade head

migrate-create: ## Create new migration
	@read -p "Enter migration name: " name; \
	docker-compose exec api alembic revision --autogenerate -m "$$name"

seed: ## Seed database with initial data
	docker-compose exec api python api/manage_db.py seed

stats: ## Show database statistics
	docker-compose exec api python api/manage_db.py stats

shell-api: ## Open shell in API container
	docker-compose exec api bash

shell-frontend: ## Open shell in frontend container
	docker-compose exec frontend sh

shell-db: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U teleric -d teleric_learning

test-api: ## Test API health
	@curl -s http://localhost:5000/health | jq
	@curl -s http://localhost:5000/api/stats | jq

init: ## Initialize project (first time setup)
	@echo "🚀 Initializing Teleric Learning Path..."
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "⚠️  Created .env.local - please add your OPENROUTER_API_KEY"; \
	fi
	docker-compose up --build -d
	@echo "⏳ Waiting for services to be ready..."
	sleep 10
	docker-compose exec api alembic upgrade head
	docker-compose exec api python api/manage_db.py seed
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Access your application:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API: http://localhost:5000"
	@echo "  API Docs: http://localhost:5000/docs"
	@echo "  pgAdmin: http://localhost:5050"

dev: up logs ## Start and follow logs (development mode)
