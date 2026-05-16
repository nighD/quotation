.PHONY: run build test swagger docker-up docker-down migrate lint

# Run development server
run:
	go run ./cmd/server/main.go

# Build production binary
build:
	go build -ldflags="-s -w" -o bin/server ./cmd/server/main.go

# Run tests
test:
	go test -v ./...

# Run tests with coverage
test-coverage:
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out

# Generate Swagger docs
swagger:
	swag init -g cmd/server/main.go -o docs

# Docker compose up
docker-up:
	docker compose up --build -d

# Docker compose down
docker-down:
	docker compose down

# Docker compose logs
docker-logs:
	docker compose logs -f api

# Run database migrations
migrate:
	psql -U postgres -d quotation_db -f migrations/001_init.sql

# Download Go dependencies
deps:
	go mod download
	go mod tidy

# Lint
lint:
	golangci-lint run ./...

# Create storage directories
init-storage:
	mkdir -p storage/uploads storage/temp

# Format code
fmt:
	gofmt -w .
	goimports -w .

# Clean build artifacts
clean:
	rm -rf bin/ docs/
