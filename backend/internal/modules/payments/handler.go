package payments

import (
	"io"

	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the payments module.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// CreatePayment godoc
// @Summary      Create payment
// @Description  Create a payment and return the gateway URL
// @Tags         payments
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body CreatePaymentRequest true "Payment payload"
// @Success      201  {object}  response.Response{data=CreatePaymentResponse}
// @Router       /payments/create [post]
func (h *Handler) CreatePayment(c *fiber.Ctx) error {
	var req CreatePaymentRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	userID := middleware.GetUserID(c)
	result, err := h.service.CreatePayment(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.Created(c, result, "Payment created successfully")
}

// StripeWebhook godoc
// @Summary      Stripe webhook
// @Tags         payments
// @Accept       json
// @Produce      json
// @Success      200  {object}  response.Response
// @Router       /payments/webhook/stripe [post]
func (h *Handler) StripeWebhook(c *fiber.Ctx) error {
	sigHeader := c.Get("Stripe-Signature")

	// Read raw body for Stripe signature verification
	body := c.Body()

	if err := h.service.HandleStripeWebhook(body, sigHeader); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "ok")
}

// MoMoWebhook godoc
// @Summary      MoMo webhook
// @Tags         payments
// @Accept       json
// @Produce      json
// @Success      200  {object}  response.Response
// @Router       /payments/webhook/momo [post]
func (h *Handler) MoMoWebhook(c *fiber.Ctx) error {
	var payload MoMoWebhookPayload
	if err := c.BodyParser(&payload); err != nil {
		return response.BadRequest(c, "Invalid MoMo webhook payload", nil)
	}

	if err := h.service.HandleMoMoWebhook(&payload); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "ok")
}

// VNPayWebhook godoc
// @Summary      VNPay webhook
// @Tags         payments
// @Accept       json
// @Produce      json
// @Success      200  {object}  response.Response
// @Router       /payments/webhook/vnpay [post]
func (h *Handler) VNPayWebhook(c *fiber.Ctx) error {
	var payload VNPayWebhookPayload
	if err := c.QueryParser(&payload); err != nil {
		return response.BadRequest(c, "Invalid VNPay webhook payload", nil)
	}

	if err := h.service.HandleVNPayWebhook(&payload); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "RspCode=00&Message=Confirm Success")
}

// OnePayReturn godoc
func (h *Handler) OnePayReturn(c *fiber.Ctx) error {
	params := c.Queries()
	
	err := h.service.HandleOnePayWebhook(params)
	if err != nil {
		return c.Redirect("http://localhost:5173/plans?payment=failed")
	}

	return c.Redirect("http://localhost:5173/plans?payment=success")
}

// OnePayIPN godoc
func (h *Handler) OnePayIPN(c *fiber.Ctx) error {
	params := c.Queries()

	err := h.service.HandleOnePayWebhook(params)
	if err != nil {
		return c.SendString("responsecode=0&desc=confirm-fail")
	}

	return c.SendString("responsecode=1&desc=confirm-success")
}

// suppress unused import warning
var _ = io.Discard
