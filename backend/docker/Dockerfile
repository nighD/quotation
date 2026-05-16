# ── Stage 1: Build ────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and build dependencies
RUN apk add --no-cache git ca-certificates tzdata

# Copy module files first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Generate Swagger docs
RUN go install github.com/swaggo/swag/cmd/swag@latest && swag init -g cmd/server/main.go -o docs || true

# Build binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-s -w -X main.buildTime=$(date +%Y-%m-%dT%H:%M:%S)" \
    -o bin/server ./cmd/server/main.go

# ── Stage 2: Run ──────────────────────────────────────────────
FROM alpine:3.19

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata curl

# Copy binary and timezone data
COPY --from=builder /app/bin/server .
COPY --from=builder /app/docs ./docs
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Create storage directories
RUN mkdir -p storage/uploads storage/temp

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

CMD ["./server"]
