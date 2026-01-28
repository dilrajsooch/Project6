# Makefile for Library Web Application
# Provides convenient commands for Docker and Doxygen operations

.PHONY: help build run stop docs docs-serve clean logs shell

# Default target - show help
help:
	@echo "Library Web Application - Available Commands"
	@echo "============================================="
	@echo ""
	@echo "Application Commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make run         - Start the web application"
	@echo "  make stop        - Stop all running containers"
	@echo "  make logs        - View application logs"
	@echo "  make shell       - Open shell in web container"
	@echo ""
	@echo "Documentation Commands:"
	@echo "  make docs        - Generate Doxygen documentation"
	@echo "  make docs-serve  - Generate docs and serve on port 8080"
	@echo "  make docs-local  - Generate docs locally (requires doxygen installed)"
	@echo ""
	@echo "Cleanup Commands:"
	@echo "  make clean       - Remove containers, volumes, and generated docs"
	@echo "  make clean-docs  - Remove only generated documentation"

# Build Docker images
build:
	docker-compose build

# Run the web application
run:
	docker-compose up -d web
	@echo "Application running at http://localhost:5000"

# Stop all containers
stop:
	docker-compose down

# View logs
logs:
	docker-compose logs -f web

# Open shell in web container
shell:
	docker-compose exec web /bin/bash

# Generate documentation using Docker
docs:
	@echo "Generating Doxygen documentation..."
	docker-compose run --rm docs
	@echo "Documentation generated in ./docs/html/"
	@echo "Open ./docs/html/index.html in your browser"

# Generate and serve documentation
docs-serve:
	@echo "Generating documentation and starting server..."
	docker-compose run --rm docs
	docker-compose --profile docs-server up -d docs-server
	@echo "Documentation server running at http://localhost:8080"

# Generate documentation locally (without Docker)
docs-local:
	@echo "Generating documentation locally..."
	doxygen Doxyfile
	@echo "Documentation generated in ./docs/html/"

# Clean everything
clean:
	docker-compose down -v --rmi local
	rm -rf docs/html docs/latex docs/*.tag docs/*.log

# Clean only documentation
clean-docs:
	rm -rf docs/html docs/latex docs/*.tag docs/*.log
