package middleware

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/baole/quotation/pkg/response"
)

// RateLimit returns a rate limiting middleware.
func RateLimit(max int, expiry time.Duration) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: expiry,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return response.TooManyRequests(c)
		},
		SkipFailedRequests:     false,
		SkipSuccessfulRequests: false,
	})
}

// StrictRateLimit is a tighter limit for sensitive endpoints like auth.
func StrictRateLimit() fiber.Handler {
	return RateLimit(10, time.Minute)
}
