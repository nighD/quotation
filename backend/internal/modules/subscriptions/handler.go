package subscriptions

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the subscriptions module.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ListPlans godoc
// @Summary      List subscription plans
// @Tags         subscriptions
// @Produce      json
// @Success      200  {object}  response.Response{data=[]PlanResponse}
// @Router       /subscriptions/plans [get]
func (h *Handler) ListPlans(c *fiber.Ctx) error {
	plans, err := h.service.ListPlans()
	if err != nil {
		return response.InternalError(c, "Failed to fetch plans")
	}
	return response.OK(c, plans, "")
}

// Purchase godoc
// @Summary      Purchase a subscription
// @Tags         subscriptions
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body PurchaseRequest true "Purchase payload"
// @Success      201  {object}  response.Response
// @Router       /subscriptions/purchase [post]
func (h *Handler) Purchase(c *fiber.Ctx) error {
	var req PurchaseRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	userID := middleware.GetUserID(c)
	sub, plan, err := h.service.Purchase(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	// TODO: Create payment intent and return payment URL based on gateway
	return response.Created(c, fiber.Map{
		"subscription_id": sub.ID,
		"plan":            toPlanResponse(plan),
		"message":         "Redirect to payment gateway to complete purchase",
	}, "Subscription initiated")
}

// GetMySubscription godoc
// @Summary      Get my subscription
// @Tags         subscriptions
// @Security     BearerAuth
// @Produce      json
// @Success      200  {object}  response.Response{data=SubscriptionResponse}
// @Router       /subscriptions/me [get]
func (h *Handler) GetMySubscription(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	sub, err := h.service.GetMySubscription(userID)
	if err != nil {
		return response.NotFound(c, "No active subscription found")
	}

	return response.OK(c, sub, "")
}
