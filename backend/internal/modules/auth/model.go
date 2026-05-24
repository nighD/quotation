package auth

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User is the main user model shared across modules.
type User struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Email        string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password     *string        `gorm:"type:varchar(255)" json:"-"`
	FullName     string         `gorm:"type:varchar(255);not null" json:"full_name"`
	AuthProvider string         `gorm:"type:varchar(50);not null;default:'email'" json:"auth_provider"`
	ProviderID   *string        `gorm:"type:varchar(255)" json:"provider_id,omitempty"`
	Status       string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	AvatarURL    string         `gorm:"type:text" json:"avatar_url"`
	Company          string         `gorm:"type:varchar(255)" json:"company"`
	Title            string         `gorm:"type:varchar(255)" json:"title"`
	Country          string         `gorm:"type:varchar(100)" json:"country"`
	IsJoinedWaitlist bool           `gorm:"column:is_joined_waitlist;default:false" json:"is_joined_waitlist"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

// ─── Request DTOs ─────────────────────────────────────────────

// SocialLoginRequest is the payload for POST /auth/social.
type SocialLoginRequest struct {
	Provider string `json:"provider" validate:"required,oneof=google"`
	Token    string `json:"token" validate:"required"`
}

// RegisterRequest is the payload for POST /auth/register.
type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=8,max=72"`
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
}

// LoginRequest is the payload for POST /auth/login.
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// ForgotPasswordRequest is the payload for POST /auth/forgot-password.
type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

// ResetPasswordRequest is the payload for POST /auth/reset-password.
type ResetPasswordRequest struct {
	Token       string `json:"token" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8,max=72"`
}

// RefreshTokenRequest is the payload for POST /auth/refresh.
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// UpdateProfileRequest is the payload for PUT /auth/profile.
type UpdateProfileRequest struct {
	FullName string `json:"full_name" validate:"required,min=2,max=100"`
	Company  string `json:"company" validate:"omitempty,max=255"`
	Title    string `json:"title" validate:"omitempty,max=255"`
	Country  string `json:"country" validate:"omitempty,max=100"`
}

// ─── Response DTOs ────────────────────────────────────────────

// AuthResponse is returned on successful login or register.
type AuthResponse struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    int64     `json:"expires_at"`
	User         UserInfo  `json:"user"`
}

// UserInfo is a safe subset of User fields returned to the client.
type UserInfo struct {
	ID        string   `json:"id"`
	Email     string   `json:"email"`
	FullName  string   `json:"full_name"`
	Status    string   `json:"status"`
	AvatarURL string   `json:"avatar_url"`
	Company          string   `json:"company"`
	Title            string   `json:"title"`
	Country          string   `json:"country"`
	Roles            []string `json:"roles"`
	IsJoinedWaitlist bool     `json:"is_joined_waitlist"`
}
