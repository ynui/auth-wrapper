.PHONY: help up down logs build

COMPOSE_FILE ?= docker-compose.yml

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Start services
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Stop services
	docker compose -f $(COMPOSE_FILE) down

logs: ## Tail logs
	docker compose -f $(COMPOSE_FILE) logs -f

build: ## Build services
	docker compose -f $(COMPOSE_FILE) build
