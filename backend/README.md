# Quotation Backend API

A production-ready Go REST API with authentication, RBAC, CMS, subscriptions, and multi-gateway payments.

## Stack

| Component | Technology |
|---|---|
| Language | Go 1.22+ |
| Framework | Fiber v2 |
| ORM | GORM |
| Database | PostgreSQL 16 |
| Cache/Queue | Redis + Asynq |
| Auth | JWT (RS256) |
| Payments | Stripe, MoMo, VNPay |
| Docs | Swagger |
| Logging | Zap |
| Deploy | Docker + Nginx |

## Project Structure

```
backend/
├── cmd/server/main.go          # Entry point
├── internal/
│   ├── config/                 # Viper config
│   ├── database/               # GORM connection
│   ├── middleware/             # JWT, RBAC, rate limit, logger
│   ├── utils/                  # Password, pagination, file helpers
│   ├── constants/              # App-wide constants
│   └── modules/
│       ├── auth/               # Register, login, refresh, profile
│       ├── users/              # User CRUD (admin)
│       ├── cms/                # Articles + categories
│       ├── subscriptions/      # Plans, purchase, my subscription
│       ├── payments/           # Stripe/MoMo/VNPay + webhooks
│       ├── rbac/               # Roles, permissions, assignment
│       └── analytics/          # Dashboard, revenue, subscription reports
├── pkg/
│   ├── jwt/                    # Token generation/parsing
│   ├── response/               # JSON envelope
│   └── validator/              # Input validation
├── migrations/001_init.sql     # Full schema + seed data
├── docker/Dockerfile           # Multi-stage build
├── docker/nginx.conf           # Reverse proxy
├── docker-compose.yml          # All services
└── Makefile                    # Dev commands
```

## Quick Start

### 1. Environment

```bash
cp .env .env.example   # Edit with your values
```

### 2. Local development (requires Go 1.22 + PostgreSQL)

```bash
make deps           # Download dependencies
make init-storage   # Create storage directories
make migrate        # Run SQL migrations
make run            # Start dev server
```

### 3. Docker

```bash
make docker-up      # Build and start all services
make docker-logs    # Tail API logs
make docker-down    # Stop all services
```

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /auth/register | — | Register new account |
| POST | /auth/login | — | Login and get tokens |
| POST | /auth/refresh | — | Refresh access token |
| GET  | /auth/profile | ✓ | Get my profile |
| GET  | /users | Admin | List all users |
| GET  | /cms/articles | — | List published articles |
| POST | /cms/articles | Editor+ | Create article |
| GET  | /subscriptions/plans | — | List subscription plans |
| POST | /subscriptions/purchase | ✓ | Purchase a subscription |
| POST | /payments/create | ✓ | Create payment intent |
| POST | /payments/webhook/stripe | — | Stripe IPN |
| POST | /payments/webhook/momo | — | MoMo IPN |
| POST | /payments/webhook/vnpay | — | VNPay IPN |
| GET  | /admin/dashboard | Admin | Platform stats |
| GET  | /admin/reports/revenue | Admin | Daily revenue |

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

## Response Format

```json
{
  "success": true,
  "message": "optional message",
  "data": {},
  "meta": {
    "page": 1,
    "page_size": 10,
    "total_items": 100,
    "total_pages": 10
  }
}
```

## Generating Swagger Docs

```bash
make swagger
# Then visit http://localhost:8080/swagger/
```

## Security

- Passwords hashed with bcrypt (cost=10)
- JWT access tokens (24h) + refresh tokens (30d)
- Webhook signature verification (Stripe HMAC, MoMo HMAC-SHA256, VNPay HMAC-SHA512)
- Rate limiting on all endpoints (stricter on auth)
- CORS configured
- SQL injection protected via GORM parameterized queries
- Soft delete for users and articles
