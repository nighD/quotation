package analytics

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers admin analytics routes.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	admin := router.Group("/admin", middleware.Auth(jwtSecret), middleware.RequireAdmin())

	admin.Get("/dashboard", handler.GetDashboard)
	admin.Get("/reports/revenue", handler.GetRevenueReport)
	admin.Get("/reports/subscriptions", handler.GetSubscriptionReport)
}
