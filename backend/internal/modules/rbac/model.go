package rbac

import (
	"time"

	"github.com/google/uuid"
)

// Role is the GORM model for the roles table.
type Role struct {
	ID          uuid.UUID    `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name        string       `gorm:"type:varchar(100);uniqueIndex;not null" json:"name"`
	Description string       `gorm:"type:varchar(255)" json:"description"`
	CreatedAt   time.Time    `json:"created_at"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
}

// Permission is the GORM model for the permissions table.
type Permission struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Key       string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"key"`
	Module    string    `gorm:"type:varchar(100)" json:"module"`
	CreatedAt time.Time `json:"created_at"`
}

// UserRole is the GORM model for the user_roles join table.
type UserRole struct {
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	RoleID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"role_id"`
	CreatedAt time.Time `json:"created_at"`
}

// ─── Request DTOs ─────────────────────────────────────────────

type CreateRoleRequest struct {
	Name        string   `json:"name" validate:"required,min=2,max=100"`
	Description string   `json:"description" validate:"omitempty,max=255"`
	Permissions []string `json:"permissions"` // permission keys
}

type AssignRoleRequest struct {
	UserID string `json:"user_id" validate:"required,uuid4"`
	RoleID string `json:"role_id" validate:"required,uuid4"`
}
