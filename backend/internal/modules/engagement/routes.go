package engagement

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	engagement := router.Group("/engagement", middleware.Auth(jwtSecret))
	engagement.Post("/newsletter/subscribe", handler.SubscribeNewsletter)
	engagement.Post("/events/register", handler.RegisterEvent)
	engagement.Get("/events/register", handler.ListMyEventRegistrations)
	engagement.Post("/booking-requests", handler.SubmitBookingRequest)
	engagement.Get("/booking-requests/me", handler.ListMyBookingRequests)
	engagement.Post("/upgrade-requests", handler.SubmitUpgradeRequest)
	engagement.Get("/upgrade-requests/me", handler.GetMyUpgradeRequest)

	admin := router.Group("/admin", middleware.Auth(jwtSecret), middleware.RequireAdmin())
	admin.Get("/notifications/newsletter", handler.ListNewsletterSubscriptions)
	admin.Get("/events/registrations", handler.ListEventRegistrations)
	admin.Get("/booking-requests", handler.ListBookingRequests)
	admin.Get("/upgrade-requests", handler.ListUpgradeRequests)
	admin.Patch("/upgrade-requests/:id/review", handler.ReviewUpgradeRequest)
}
