package rbac

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers RBAC management routes (all admin-only).
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	rbac := router.Group("/rbac", middleware.Auth(jwtSecret), middleware.RequireAdmin())

	rbac.Get("/roles", handler.ListRoles)
	rbac.Post("/roles", handler.CreateRole)
	rbac.Post("/roles/assign", handler.AssignRole)
	rbac.Delete("/roles/users/:user_id/roles/:role_id", handler.RemoveRole)
	rbac.Get("/permissions", handler.ListPermissions)
}
