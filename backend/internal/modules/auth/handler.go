package auth

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the auth module.
type Handler struct {
	service *Service
}

// NewHandler creates a new auth handler.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// Register godoc
// @Summary      Register new account
// @Description  Create a new user account and return JWT tokens
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body RegisterRequest true "Register payload"
// @Success      201  {object}  response.Response{data=AuthResponse}
// @Failure      400  {object}  response.Response
// @Failure      409  {object}  response.Response
// @Router       /auth/register [post]
func (h *Handler) Register(c *fiber.Ctx) error {
	var req RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	result, err := h.service.Register(&req)
	if err != nil {
		if err.Error() == "email already registered" {
			return response.Conflict(c, err.Error())
		}
		return response.InternalError(c, "Failed to register user")
	}

	return response.Created(c, result, "Registration successful")
}

// SocialLogin godoc
// @Summary      Social Login
// @Description  Authenticate user via social provider (e.g., Google) and return JWT tokens
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body SocialLoginRequest true "Social login payload"
// @Success      200  {object}  response.Response{data=AuthResponse}
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /auth/social [post]
func (h *Handler) SocialLogin(c *fiber.Ctx) error {
	var req SocialLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	result, err := h.service.SocialLogin(&req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.OK(c, result, "Social login successful")
}

// Login godoc
// @Summary      Login
// @Description  Authenticate user and return JWT tokens
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body LoginRequest true "Login payload"
// @Success      200  {object}  response.Response{data=AuthResponse}
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /auth/login [post]
func (h *Handler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	result, err := h.service.Login(&req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.OK(c, result, "Login successful")
}

// ForgotPassword godoc
// @Summary      Forgot password
// @Description  Send a password reset email
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body ForgotPasswordRequest true "Email payload"
// @Success      200  {object}  response.Response
// @Router       /auth/forgot-password [post]
func (h *Handler) ForgotPassword(c *fiber.Ctx) error {
	var req ForgotPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	_ = h.service.ForgotPassword(&req) // Intentionally ignore error to prevent email enumeration
	return response.OK(c, nil, "If the email exists, a reset link has been sent")
}

// ResetPassword godoc
// @Summary      Reset password
// @Description  Reset password using a token from the email
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body ResetPasswordRequest true "Reset payload"
// @Success      200  {object}  response.Response
// @Failure      400  {object}  response.Response
// @Router       /auth/reset-password [post]
func (h *Handler) ResetPassword(c *fiber.Ctx) error {
	var req ResetPasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	if err := h.service.ResetPassword(&req); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "Password reset successful")
}

// GetProfile godoc
// @Summary      Get profile
// @Description  Return the authenticated user's profile
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  response.Response{data=UserInfo}
// @Failure      401  {object}  response.Response
// @Router       /auth/profile [get]
func (h *Handler) GetProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	profile, err := h.service.GetProfile(userID)
	if err != nil {
		return response.NotFound(c, "User not found")
	}

	return response.OK(c, profile, "")
}

// UpdateProfile godoc
// @Summary      Update profile
// @Description  Update the authenticated user's profile information
// @Tags         auth
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body UpdateProfileRequest true "Update profile payload"
// @Success      200  {object}  response.Response{data=UserInfo}
// @Failure      400  {object}  response.Response
// @Failure      401  {object}  response.Response
// @Router       /auth/profile [put]
func (h *Handler) UpdateProfile(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	profile, err := h.service.UpdateProfile(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, profile, "Profile updated successfully")
}

// RefreshToken godoc
// @Summary      Refresh tokens
// @Description  Exchange a refresh token for a new token pair
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body RefreshTokenRequest true "Refresh token payload"
// @Success      200  {object}  response.Response{data=AuthResponse}
// @Failure      401  {object}  response.Response
// @Router       /auth/refresh [post]
func (h *Handler) RefreshToken(c *fiber.Ctx) error {
	var req RefreshTokenRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	result, err := h.service.RefreshTokens(&req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.OK(c, result, "Token refreshed")
}

// JoinWaitlist godoc
// @Summary      Join waitlist
// @Description  Join the premium subscription waitlist
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  response.Response{data=UserInfo}
// @Failure      401  {object}  response.Response
// @Router       /auth/join-waitlist [post]
func (h *Handler) JoinWaitlist(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	profile, err := h.service.JoinWaitlist(userID)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, profile, "Successfully joined waitlist")
}
