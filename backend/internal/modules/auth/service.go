package auth

import (
	"context"
	"fmt"

	"github.com/baole/quotation/internal/config"
	"github.com/baole/quotation/internal/constants"
	"github.com/baole/quotation/internal/utils"
	"github.com/google/uuid"
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
		Email:     req.Email,
		Password:  &hashed,
		FullName:  req.FullName,
		Status:    constants.UserStatusActive,
		AvatarURL: generateRandomAvatar(req.Email),
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

	picture, _ := payload.Claims["picture"].(string)
	if picture == "" {
		picture = generateRandomAvatar(email)
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
				AvatarURL:    picture,
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
		// If they don't have an avatar URL yet, save the one from Google
		if user.AvatarURL == "" {
			user.AvatarURL = picture
			s.db.Model(&user).Update("avatar_url", picture)
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

// DevLogin issues a real JWT for local development bypass.
func (s *Service) DevLogin(req *DevLoginRequest) (*AuthResponse, error) {
	role := req.Role
	if role == "" {
		role = "admin"
	}

	profile := struct {
		Email    string
		FullName string
		Company  string
		Title    string
		Country  string
		Roles    []string
	}{
		Email:    "dev-user@localhost",
		FullName: "Hoàng Vương (User)",
		Company:  "VIFC",
		Title:    "Member",
		Country:  "Vietnam",
		Roles:    []string{"user"},
	}

	if role == "admin" {
		profile.Email = "dev-admin@localhost"
		profile.FullName = "Hoàng Vương (Admin)"
		profile.Title = "Administrator"
		profile.Roles = []string{"admin", "premium"}
	}

	var user User
	err := s.db.Where("email = ?", profile.Email).First(&user).Error
	if err != nil {
		if err != gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("failed to query dev user: %w", err)
		}

		user = User{
			Email:        profile.Email,
			FullName:     profile.FullName,
			Status:       constants.UserStatusActive,
			AuthProvider: "dev",
			AvatarURL:    generateRandomAvatar(profile.Email),
			Company:      profile.Company,
			Title:        profile.Title,
			Country:      profile.Country,
		}

		if err := s.db.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("failed to create dev user: %w", err)
		}
	} else {
		updates := map[string]interface{}{
			"full_name":     profile.FullName,
			"status":        constants.UserStatusActive,
			"auth_provider": "dev",
			"company":       profile.Company,
			"title":         profile.Title,
			"country":       profile.Country,
		}
		if user.AvatarURL == "" {
			updates["avatar_url"] = generateRandomAvatar(profile.Email)
		}
		if err := s.db.Model(&user).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("failed to update dev user: %w", err)
		}
		if err := s.db.Where("id = ?", user.ID).First(&user).Error; err != nil {
			return nil, fmt.Errorf("failed to reload dev user: %w", err)
		}
	}

	for _, roleName := range profile.Roles {
		if err := s.ensureRoleAssignment(user.ID, roleName); err != nil {
			return nil, err
		}
	}

	return s.issueTokens(&user)
}

// GetProfile returns the authenticated user's profile.
func (s *Service) GetProfile(userID string) (*UserInfo, error) {
	var user User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	if user.AvatarURL == "" {
		user.AvatarURL = generateRandomAvatar(user.Email)
		s.db.Model(&user).Update("avatar_url", user.AvatarURL)
	}

	roles := s.getUserRoles(userID)
	userInfo := toUserInfo(&user, roles)
	s.populateCardInfo(userInfo)
	return userInfo, nil
}

// UpdateProfile updates the authenticated user's profile information.
func (s *Service) UpdateProfile(userID string, req *UpdateProfileRequest) (*UserInfo, error) {
	var user User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	updates := map[string]interface{}{}
	if req.FullName != "" {
		updates["full_name"] = req.FullName
	}
	updates["company"] = req.Company
	updates["title"] = req.Title
	updates["country"] = req.Country

	if err := s.db.Model(&user).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	// Fetch updated user from DB
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch updated user")
	}

	roles := s.getUserRoles(userID)
	userInfo := toUserInfo(&user, roles)
	s.populateCardInfo(userInfo)
	return userInfo, nil
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

	userInfo := toUserInfo(user, roles)
	s.populateCardInfo(userInfo)

	return &AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresAt:    tokens.ExpiresAt,
		User:         *userInfo,
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

	// Check active subscription plans
	var planNames []string
	s.db.Table("user_subscriptions").
		Joins("JOIN subscription_plans ON subscription_plans.id = user_subscriptions.subscription_plan_id").
		Where("user_subscriptions.user_id = ? AND user_subscriptions.status = 'active' AND user_subscriptions.end_date > NOW()", userID).
		Pluck("subscription_plans.name", &planNames)

	for _, name := range planNames {
		if name == "Monthly Basic" {
			roles = append(roles, "base")
		} else if name == "Quarterly Pro" {
			roles = append(roles, "standard")
		} else if name == "Annual Premium" {
			roles = append(roles, "premium")
		}
	}

	return roles
}

// JoinWaitlist sets the user's is_joined_waitlist status to true.
func (s *Service) JoinWaitlist(userID string) (*UserInfo, error) {
	var user User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	if err := s.db.Model(&user).Update("is_joined_waitlist", true).Error; err != nil {
		return nil, fmt.Errorf("failed to join waitlist: %w", err)
	}

	// Fetch updated user from DB
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch updated user")
	}

	roles := s.getUserRoles(userID)
	return toUserInfo(&user, roles), nil
}

var randomAvatars = []string{
	"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&h=200&q=80",
	"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
}

func generateRandomAvatar(email string) string {
	// Deterministic selection based on email character sum
	var sum int
	for _, char := range email {
		sum += int(char)
	}
	return randomAvatars[sum%len(randomAvatars)]
}

func toUserInfo(u *User, roles []string) *UserInfo {
	return &UserInfo{
		ID:               u.ID.String(),
		Email:            u.Email,
		FullName:         u.FullName,
		Status:           u.Status,
		AvatarURL:        u.AvatarURL,
		Company:          u.Company,
		Title:            u.Title,
		Country:          u.Country,
		Roles:            roles,
		IsJoinedWaitlist: u.IsJoinedWaitlist,
	}
}

func (s *Service) ensureRoleAssignment(userID uuid.UUID, roleName string) error {
	if roleName == "" {
		return nil
	}

	roleID, err := s.findRoleIDByName(roleName)
	if err != nil {
		return fmt.Errorf("failed to query role %s: %w", roleName, err)
	}

	if roleID == uuid.Nil {
		roleID = uuid.New()
		if err := s.db.Exec(
			"INSERT INTO roles (id, name, description, created_at) VALUES (?, ?, ?, NOW()) ON CONFLICT (name) DO NOTHING",
			roleID,
			roleName,
			"Development login role",
		).Error; err != nil {
			return fmt.Errorf("failed to create role %s: %w", roleName, err)
		}

		roleID, err = s.findRoleIDByName(roleName)
		if err != nil {
			return fmt.Errorf("failed to reload role %s: %w", roleName, err)
		}
	}

	if roleID == uuid.Nil {
		return fmt.Errorf("role %s is unavailable", roleName)
	}

	if err := s.db.Exec(
		"INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW()) ON CONFLICT DO NOTHING",
		userID,
		roleID,
	).Error; err != nil {
		return fmt.Errorf("failed to assign role %s: %w", roleName, err)
	}

	return nil
}

func (s *Service) findRoleIDByName(roleName string) (uuid.UUID, error) {
	var roleIDValue string
	if err := s.db.Raw("SELECT id FROM roles WHERE name = ?", roleName).Scan(&roleIDValue).Error; err != nil {
		return uuid.Nil, err
	}
	if roleIDValue == "" {
		return uuid.Nil, nil
	}
	roleID, err := uuid.Parse(roleIDValue)
	if err != nil {
		return uuid.Nil, err
	}
	return roleID, nil
}

func (s *Service) populateCardInfo(userInfo *UserInfo) {
	var userCard struct {
		SoThe   string
		LoaiThe string
	}
	if err := s.db.Table("user_cards").Where("user_id = ?", userInfo.ID).Select("so_the, loai_the").First(&userCard).Error; err == nil {
		userInfo.CardNumber = userCard.SoThe
		userInfo.CardType = userCard.LoaiThe
	}
}

