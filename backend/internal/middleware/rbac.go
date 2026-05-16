package middleware

import (
	"github.com/baole/quotation/pkg/response"
	"github.com/gofiber/fiber/v2"
)

// RequireRole returns middleware that checks if the user has all specified roles.
func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoles := GetRoles(c)
		roleSet := make(map[string]struct{}, len(userRoles))
		for _, r := range userRoles {
			roleSet[r] = struct{}{}
		}

		for _, required := range roles {
			if _, ok := roleSet[required]; !ok {
				return response.Forbidden(c, "You do not have permission to perform this action")
			}
		}

		return c.Next()
	}
}

// RequireAnyRole returns middleware that passes if the user has at least one of the specified roles.
func RequireAnyRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRoles := GetRoles(c)
		roleSet := make(map[string]struct{}, len(userRoles))
		for _, r := range userRoles {
			roleSet[r] = struct{}{}
		}

		for _, required := range roles {
			if _, ok := roleSet[required]; ok {
				return c.Next()
			}
		}

		return response.Forbidden(c, "You do not have permission to perform this action")
	}
}

// RequireAdmin is a convenience middleware requiring the admin role.
func RequireAdmin() fiber.Handler {
	return RequireRole("admin")
}
