package users

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers user management routes.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	users := router.Group("/users", middleware.Auth(jwtSecret), middleware.RequireAdmin())

	users.Get("/", handler.ListUsers)
	users.Get("/:id", handler.GetUser)
	users.Put("/:id", handler.UpdateUser)
	users.Delete("/:id", handler.DeleteUser)
}
