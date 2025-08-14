.PHONY: help start-backend start-frontend start-db stop clean install-backend install-frontend

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

start-db: ## Start database and mail services
	docker compose up -d db mailhog
	@echo "Database and mail services started"
	@echo "Database: http://localhost:5432"
	@echo "MailHog: http://localhost:8025"

stop: ## Stop all services
	docker compose down
	@echo "All services stopped"

clean: ## Clean up containers and volumes
	docker compose down -v
	@echo "Containers and volumes cleaned up"

install-backend: ## Install backend dependencies
	powershell -Command "if (Test-Path ./backend-java/gradlew) { cd ./backend-java; ./gradlew build } else { cd ./backend-java; gradle build }"

install-frontend: ## Install frontend dependencies
	cd frontend && npm install

start-backend: ## Start Java backend
	powershell -Command "if (Test-Path ./backend-java/gradlew) { cd ./backend-java; ./gradlew bootRun } else { cd ./backend-java; gradle bootRun }"

start-frontend: ## Start Next.js frontend
	cd frontend && npm run dev

dev: start-db install-backend install-frontend ## Start development environment
	@echo "Starting development environment..."
	@echo "Backend will be available at: http://localhost:8080/api"
	@echo "Frontend will be available at: http://localhost:3000"
	@echo "Database: http://localhost:5432"
	@echo "MailHog: http://localhost:8025"
	@echo ""
	@echo "Starting backend (detached PowerShell)..."
	powershell -Command "if (Get-Command pwsh -ErrorAction SilentlyContinue) { $$shell='pwsh' } else { $$shell='powershell' }; Start-Process -WindowStyle Minimized -FilePath $$shell -ArgumentList '-NoProfile','-Command','if (Test-Path ./backend-java/gradlew) { cd ./backend-java; ./gradlew bootRun } else { cd ./backend-java; gradle bootRun }'"
	@echo "Waiting 5 seconds for backend to initialize..."
	powershell -Command "Start-Sleep -Seconds 5"
	@echo "Starting frontend..."
	@make start-frontend

setup: ## Initial setup
	@echo "Setting up Stationery Management System..."
	@make start-db
	@echo "Waiting for database to be ready..."
	powershell -Command "Start-Sleep -Seconds 10"
	@make install-backend
	@make install-frontend
	@echo "Setup complete! Run 'make dev' to start development servers"

logs: ## Show logs
	docker compose logs -f

reset-db: ## Reset database
	docker compose down -v
	docker compose up -d db mailhog
	@echo "Database reset complete"
