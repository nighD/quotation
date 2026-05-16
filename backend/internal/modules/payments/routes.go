package payments

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers payment routes.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	payments := router.Group("/payments")

	// Protected: create payment
	payments.Post("/create", middleware.Auth(jwtSecret), handler.CreatePayment)

	// Webhook endpoints (no auth — verified via gateway signatures)
	payments.Post("/webhook/stripe", handler.StripeWebhook)
	payments.Post("/webhook/momo", handler.MoMoWebhook)
	payments.Post("/webhook/vnpay", handler.VNPayWebhook)

	// OnePay
	payments.Get("/onepay/return", handler.OnePayReturn)
	payments.All("/onepay/ipn", handler.OnePayIPN)
}
