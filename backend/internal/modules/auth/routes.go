package auth

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers auth routes on the given Fiber router.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	auth := router.Group("/auth")

	// Public routes (with strict rate limiting)
	auth.Post("/social", middleware.StrictRateLimit(), handler.SocialLogin)
	auth.Post("/register", middleware.StrictRateLimit(), handler.Register)
	auth.Post("/login", middleware.StrictRateLimit(), handler.Login)
	auth.Post("/forgot-password", middleware.StrictRateLimit(), handler.ForgotPassword)
	auth.Post("/reset-password", handler.ResetPassword)
	auth.Post("/refresh", handler.RefreshToken)

	// Protected routes
	auth.Get("/profile", middleware.Auth(jwtSecret), handler.GetProfile)
}
