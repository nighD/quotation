package subscriptions

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers subscription routes.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	subs := router.Group("/subscriptions")

	subs.Get("/plans", handler.ListPlans) // public

	protected := subs.Use(middleware.Auth(jwtSecret))
	protected.Post("/purchase", handler.Purchase)
	protected.Get("/me", handler.GetMySubscription)
}
