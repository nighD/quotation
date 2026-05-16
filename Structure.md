# Suggested Backend Architecture (Go)

## Recommended Stack

| Component | Suggestion |
|---|---|
| Language | Go (Golang) |
| HTTP Framework | Gin / Fiber |
| ORM | GORM |
| Database | PostgreSQL |
| Authentication | JWT |
| Config Management | Viper |
| Environment Variables | godotenv |
| Background Jobs | Go routines / Asynq |
| Payment Integration | Stripe SDK / Custom VNPay & MoMo SDK |
| API Documentation | Swagger |
| Logging | Zap / Logrus |
| Deployment | Docker |
| Reverse Proxy | Nginx |
| File Storage | Local Storage |

---

# Suggested Project Structure

```bash
backend/
├── cmd/
│   └── server/
│       └── main.go
│
├── internal/
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── utils/
│   ├── constants/
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── cms/
│   │   ├── subscriptions/
│   │   ├── payments/
│   │   ├── webhooks/
│   │   ├── analytics/
│   │   └── rbac/
│
├── storage/
│   ├── uploads/
│   └── temp/
│
├── pkg/
│   ├── jwt/
│   ├── response/
│   └── validator/
│
├── docs/
├── migrations/
├── docker/
├── .env
├── go.mod
└── README.md
```

---

# Suggested Database Schema

## users

| Field | Type |
|---|---|
| id | uuid |
| email | varchar |
| password | varchar |
| full_name | varchar |
| status | varchar |
| created_at | timestamp |

---

## roles

| Field | Type |
|---|---|
| id | uuid |
| name | varchar |

---

## permissions

| Field | Type |
|---|---|
| id | uuid |
| key | varchar |

---

## user_roles

| Field | Type |
|---|---|
| user_id | uuid |
| role_id | uuid |

---

## articles

| Field | Type |
|---|---|
| id | uuid |
| title | varchar |
| slug | varchar |
| content | text |
| status | varchar |
| category_id | uuid |
| created_by | uuid |
| created_at | timestamp |

---

## categories

| Field | Type |
|---|---|
| id | uuid |
| name | varchar |

---

## subscription_plans

| Field | Type |
|---|---|
| id | uuid |
| name | varchar |
| price | decimal |
| duration_days | integer |
| created_at | timestamp |

---

## user_subscriptions

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| subscription_plan_id | uuid |
| start_date | timestamp |
| end_date | timestamp |
| status | varchar |

---

## payments

| Field | Type |
|---|---|
| id | uuid |
| user_id | uuid |
| gateway | varchar |
| amount | decimal |
| transaction_id | varchar |
| status | varchar |
| created_at | timestamp |

---

# Suggested REST API Structure

## Auth APIs

```http
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/profile
```

---

## User APIs

```http
GET    /users
GET    /users/:id
PUT    /users/:id
DELETE /users/:id
```

---

## CMS APIs

```http
POST   /cms/articles
GET    /cms/articles
GET    /cms/articles/:id
PUT    /cms/articles/:id
DELETE /cms/articles/:id

POST   /cms/categories
GET    /cms/categories
```

---

## Subscription APIs

```http
GET    /subscriptions/plans
POST   /subscriptions/purchase
GET    /subscriptions/me
```

---

## Payment APIs

```http
POST   /payments/create
POST   /payments/webhook/stripe
POST   /payments/webhook/momo
POST   /payments/webhook/vnpay
```

---

## Admin APIs

```http
GET /admin/dashboard
GET /admin/reports/revenue
GET /admin/reports/subscriptions
```

---

# Suggested Middleware

## Authentication Middleware
- Verify JWT token
- Extract user information

## RBAC Middleware
- Check user roles
- Check permissions

## Logging Middleware
- Request logs
- Error logs

## Rate Limiting Middleware
- Prevent abuse
- Protect auth endpoints

---

# Suggested File Upload Flow

```text
User uploads image/file
    ↓
Backend validates file
    ↓
File stored in local storage
    ↓
Database stores file path
    ↓
Frontend accesses file via API/static route
```

---

# Suggested Payment Flow

```text
User purchases subscription
    ↓
Backend creates payment request
    ↓
Frontend redirects to payment gateway
    ↓
Gateway completes payment
    ↓
Webhook sent to backend
    ↓
Backend verifies transaction
    ↓
Subscription activated
    ↓
Frontend updated
```

---

# Suggested Security Features

- Password hashing using bcrypt
- JWT expiration & refresh token
- CSRF protection
- Request validation
- SQL injection protection
- Rate limiting
- Secure webhook signature verification

---

# Suggested Deployment

## Docker Services

```yaml
services:
  - api
  - postgres
  - redis
  - nginx
```

---

# Suggested Future Scalability

- Redis caching
- Queue workers
- Event-driven webhook processing
- Horizontal API scaling
- Database indexing optimization
- Background job processing