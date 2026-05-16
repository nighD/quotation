package constants

// User statuses
const (
	UserStatusActive   = "active"
	UserStatusInactive = "inactive"
	UserStatusBanned   = "banned"
)

// Roles
const (
	RoleAdmin  = "admin"
	RoleEditor = "editor"
	RoleUser   = "user"
)

// Article statuses
const (
	ArticleStatusDraft     = "draft"
	ArticleStatusPublished = "published"
	ArticleStatusArchived  = "archived"
)

// Subscription statuses
const (
	SubscriptionStatusActive    = "active"
	SubscriptionStatusExpired   = "expired"
	SubscriptionStatusCancelled = "cancelled"
	SubscriptionStatusPending   = "pending"
)

// Payment statuses
const (
	PaymentStatusPending   = "pending"
	PaymentStatusSuccess   = "success"
	PaymentStatusFailed    = "failed"
	PaymentStatusRefunded  = "refunded"
)

// Payment gateways
const (
	PaymentGatewayStripe = "stripe"
	PaymentGatewayMoMo   = "momo"
	PaymentGatewayVNPay  = "vnpay"
	PaymentGatewayCOD    = "cod"
)

// Permissions
const (
	PermissionUserRead   = "user:read"
	PermissionUserWrite  = "user:write"
	PermissionUserDelete = "user:delete"

	PermissionArticleRead   = "article:read"
	PermissionArticleWrite  = "article:write"
	PermissionArticleDelete = "article:delete"

	PermissionAdminAccess = "admin:access"
)

// Context keys
const (
	ContextKeyUserID = "userID"
	ContextKeyRoles  = "roles"
	ContextKeyUser   = "user"
)

// Pagination defaults
const (
	DefaultPage     = 1
	DefaultPageSize = 10
	MaxPageSize     = 100
)

// File types
const (
	FileTypeImage    = "image"
	FileTypeDocument = "document"
)
