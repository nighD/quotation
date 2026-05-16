package auth

import (
	"context"
	"fmt"

	"github.com/baole/quotation/internal/config"
	"github.com/baole/quotation/internal/constants"
	"github.com/baole/quotation/internal/utils"
	jwtpkg "github.com/baole/quotation/pkg/jwt"
	"google.golang.org/api/idtoken"
	"gorm.io/gorm"
)

// Service handles auth business logic.
type Service struct {
	db  *gorm.DB
	cfg *config.Config
}

// NewService creates a new auth service.
func NewService(db *gorm.DB, cfg *config.Config) *Service {
	return &Service{db: db, cfg: cfg}
}

// Register creates a new user account.
func (s *Service) Register(req *RegisterRequest) (*AuthResponse, error) {
	// Check if email already exists
	var existing User
	if err := s.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
		return nil, fmt.Errorf("email already registered")
	}

	// Hash password
	hashed, err := utils.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to process password: %w", err)
	}

	user := User{
		Email:    req.Email,
		Password: &hashed,
		FullName: req.FullName,
		Status:   constants.UserStatusActive,
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return s.issueTokens(&user)
}

// SocialLogin handles authentication via social providers (e.g., Google).
func (s *Service) SocialLogin(req *SocialLoginRequest) (*AuthResponse, error) {
	if req.Provider != "google" {
		return nil, fmt.Errorf("unsupported provider")
	}

	payload, err := idtoken.Validate(context.Background(), req.Token, s.cfg.Google.ClientID)
	if err != nil {
		return nil, fmt.Errorf("invalid google token: %w", err)
	}

	email, ok := payload.Claims["email"].(string)
	if !ok || email == "" {
		return nil, fmt.Errorf("email not provided by google")
	}

	name, _ := payload.Claims["name"].(string)
	if name == "" {
		name = "Google User" // Fallback
	}

	providerID := payload.Subject

	var user User
	err = s.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Register new social user
			user = User{
				Email:        email,
				FullName:     name,
				Status:       constants.UserStatusActive,
				AuthProvider: "google",
				ProviderID:   &providerID,
			}
			if err := s.db.Create(&user).Error; err != nil {
				return nil, fmt.Errorf("failed to register social user: %w", err)
			}
		} else {
			return nil, fmt.Errorf("database error: %w", err)
		}
	} else {
		// User exists. Update provider if they didn't have one? We can just ensure status is active.
		if user.Status != constants.UserStatusActive {
			return nil, fmt.Errorf("user account is inactive")
		}
	}

	return s.issueTokens(&user)
}

// Login authenticates a user and returns tokens.
func (s *Service) Login(req *LoginRequest) (*AuthResponse, error) {
	var user User
	if err := s.db.Where("email = ? AND status = ?", req.Email, constants.UserStatusActive).First(&user).Error; err != nil {
		return nil, fmt.Errorf("invalid email or password")
	}

	if user.Password == nil || !utils.CheckPassword(req.Password, *user.Password) {
		return nil, fmt.Errorf("invalid email or password")
	}

	return s.issueTokens(&user)
}

// GetProfile returns the authenticated user's profile.
func (s *Service) GetProfile(userID string) (*UserInfo, error) {
	var user User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	return toUserInfo(&user), nil
}

// ForgotPassword initiates a password reset (stub — integrate email service).
func (s *Service) ForgotPassword(req *ForgotPasswordRequest) error {
	var user User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		// Return nil to prevent email enumeration
		return nil
	}

	// TODO: Generate reset token, store in Redis with TTL, send via email service
	// resetToken := uuid.New().String()
	// store in redis: "reset:<token>" -> userID, TTL 15 min
	// send email with link: /reset-password?token=<token>

	return nil
}

// ResetPassword validates the reset token and updates the password.
func (s *Service) ResetPassword(req *ResetPasswordRequest) error {
	// TODO: Validate token from Redis
	// Fetch userID from Redis key "reset:<token>"
	// Delete token from Redis after use
	// Update user password

	hashed, err := utils.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to process password: %w", err)
	}

	_ = hashed // placeholder until Redis is integrated
	return nil
}

// RefreshTokens validates a refresh token and issues a new token pair.
func (s *Service) RefreshTokens(req *RefreshTokenRequest) (*AuthResponse, error) {
	claims, err := jwtpkg.ParseToken(req.RefreshToken, s.cfg.JWT.RefreshSecret)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired refresh token")
	}

	var user User
	if err := s.db.Where("id = ? AND status = ?", claims.UserID, constants.UserStatusActive).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found or inactive")
	}

	return s.issueTokens(&user)
}

// issueTokens generates and returns a token pair for the given user.
func (s *Service) issueTokens(user *User) (*AuthResponse, error) {
	// Fetch roles for this user
	roles := s.getUserRoles(user.ID.String())

	tokens, err := jwtpkg.GenerateTokenPair(
		user.ID.String(),
		user.Email,
		roles,
		s.cfg.JWT.Secret,
		s.cfg.JWT.RefreshSecret,
		s.cfg.JWT.ExpiryHours,
		s.cfg.JWT.RefreshExpiryDays,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate tokens: %w", err)
	}

	return &AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresAt:    tokens.ExpiresAt,
		User:         *toUserInfo(user),
	}, nil
}

// getUserRoles fetches the roles for a user from the database.
func (s *Service) getUserRoles(userID string) []string {
	var roles []string
	s.db.Raw(`
		SELECT r.name FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ?
	`, userID).Scan(&roles)
	return roles
}

func toUserInfo(u *User) *UserInfo {
	return &UserInfo{
		ID:       u.ID.String(),
		Email:    u.Email,
		FullName: u.FullName,
		Status:   u.Status,
	}
}
