package middleware

import (
	"strings"

	"github.com/baole/quotation/internal/constants"
	jwtpkg "github.com/baole/quotation/pkg/jwt"
	"github.com/baole/quotation/pkg/response"
	"github.com/gofiber/fiber/v2"
)

// AuthConfig holds middleware configuration.
type AuthConfig struct {
	JWTSecret string
}

// Auth returns a JWT authentication middleware.
// It validates the Bearer token and injects userID and roles into the context.
func Auth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			authHeader = c.Query("token")
		}
		if authHeader == "" {
			return response.Unauthorized(c, "Authorization header or token is required")
		}

		var tokenStr string
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 {
				tokenStr = parts[1]
			}
		} else {
			tokenStr = authHeader
		}

		if tokenStr == "" {
			return response.Unauthorized(c, "Invalid token format")
		}

		claims, err := jwtpkg.ParseToken(tokenStr, secret)
		if err != nil {
			return response.Unauthorized(c, "Invalid or expired token")
		}

		// Inject claims into context
		c.Locals(constants.ContextKeyUserID, claims.UserID)
		c.Locals(constants.ContextKeyRoles, claims.Roles)

		return c.Next()
	}
}

// OptionalAuth returns a middleware that sets user info if token is valid, but allows access if missing/invalid.
func OptionalAuth(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			authHeader = c.Query("token")
		}
		if authHeader == "" {
			return c.Next()
		}

		var tokenStr string
		if strings.HasPrefix(strings.ToLower(authHeader), "bearer ") {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 {
				tokenStr = parts[1]
			}
		} else {
			tokenStr = authHeader
		}

		if tokenStr != "" {
			claims, err := jwtpkg.ParseToken(tokenStr, secret)
			if err == nil {
				c.Locals(constants.ContextKeyUserID, claims.UserID)
				c.Locals(constants.ContextKeyRoles, claims.Roles)
			}
		}

		return c.Next()
	}
}

// GetUserID extracts the authenticated user ID from context.
func GetUserID(c *fiber.Ctx) string {
	id, _ := c.Locals(constants.ContextKeyUserID).(string)
	return id
}

// GetRoles extracts the authenticated user roles from context.
func GetRoles(c *fiber.Ctx) []string {
	roles, _ := c.Locals(constants.ContextKeyRoles).([]string)
	return roles
}

// HasRole checks if the user has a specific role.
func HasRole(c *fiber.Ctx, role string) bool {
	for _, r := range GetRoles(c) {
		if r == role {
			return true
		}
	}
	return false
}
