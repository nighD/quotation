package engagement

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) SubscribeNewsletter(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req SubscribeNewsletterRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	item, err := h.service.SubscribeNewsletter(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.OK(c, item, "Newsletter subscription saved")
}

func (h *Handler) RegisterEvent(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req RegisterEventRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	item, err := h.service.RegisterEvent(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.OK(c, item, "Event registration saved")
}

func (h *Handler) ListMyEventRegistrations(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	items, err := h.service.ListMyEventRegistrations(userID)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) SubmitBookingRequest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req SubmitBookingRequestRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	item, err := h.service.SubmitBookingRequest(userID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.Created(c, item, "Booking request saved")
}

func (h *Handler) SubmitUpgradeRequest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)

	var req SubmitUpgradeRequestRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	item, err := h.service.SubmitUpgradeRequest(userID, &req)
	if err != nil {
		if item != nil {
			return response.BadRequest(c, err.Error(), item)
		}
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.Created(c, item, "Upgrade request submitted")
}

func (h *Handler) GetMyUpgradeRequest(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	item, err := h.service.GetLatestUpgradeRequest(userID)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.OK(c, item, "")
}

func (h *Handler) ListNewsletterSubscriptions(c *fiber.Ctx) error {
	items, err := h.service.ListNewsletterSubscriptions()
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) ListEventRegistrations(c *fiber.Ctx) error {
	items, err := h.service.ListEventRegistrations()
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) ListMyBookingRequests(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	items, err := h.service.ListMyBookingRequests(userID)
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) ListBookingRequests(c *fiber.Ctx) error {
	items, err := h.service.ListBookingRequests()
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) ListUpgradeRequests(c *fiber.Ctx) error {
	items, err := h.service.ListUpgradeRequests()
	if err != nil {
		return response.InternalError(c, err.Error())
	}
	return response.OK(c, items, "")
}

func (h *Handler) ReviewUpgradeRequest(c *fiber.Ctx) error {
	requestID := c.Params("id")
	reviewerID := middleware.GetUserID(c)

	var req ReviewUpgradeRequestRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	item, err := h.service.ReviewUpgradeRequest(requestID, reviewerID, &req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}
	return response.OK(c, item, "Upgrade request updated")
}
