package users

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User is the GORM model for the users table.
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email        string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password     *string        `gorm:"type:varchar(255)" json:"-"`
	FullName     string         `gorm:"type:varchar(255);not null" json:"full_name"`
	AuthProvider string         `gorm:"type:varchar(50);not null;default:'email'" json:"auth_provider"`
	ProviderID   *string        `gorm:"type:varchar(255)" json:"provider_id,omitempty"`
	Status       string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// ─── Request DTOs ─────────────────────────────────────────────

// UpdateUserRequest is the payload for PUT /users/:id.
type UpdateUserRequest struct {
	FullName string `json:"full_name" validate:"omitempty,min=2,max=100"`
	Status   string `json:"status" validate:"omitempty,oneof=active inactive banned"`
}

// ─── Response DTOs ────────────────────────────────────────────

// UserResponse is the public representation of a user.
type UserResponse struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	FullName  string    `json:"full_name"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func toResponse(u *User) *UserResponse {
	return &UserResponse{
		ID:        u.ID.String(),
		Email:     u.Email,
		FullName:  u.FullName,
		Status:    u.Status,
		CreatedAt: u.CreatedAt,
	}
}
