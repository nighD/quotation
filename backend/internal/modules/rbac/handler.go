package rbac

import (
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for RBAC module.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListRoles(c *fiber.Ctx) error {
	roles, err := h.service.ListRoles()
	if err != nil {
		return response.InternalError(c, "Failed to fetch roles")
	}
	return response.OK(c, roles, "")
}

func (h *Handler) CreateRole(c *fiber.Ctx) error {
	var req CreateRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	role, err := h.service.CreateRole(&req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, role, "Role created successfully")
}

func (h *Handler) AssignRole(c *fiber.Ctx) error {
	var req AssignRoleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	if err := h.service.AssignRole(&req); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "Role assigned successfully")
}

func (h *Handler) RemoveRole(c *fiber.Ctx) error {
	userID := c.Params("user_id")
	roleID := c.Params("role_id")

	if err := h.service.RemoveRole(userID, roleID); err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, nil, "Role removed successfully")
}

func (h *Handler) ListPermissions(c *fiber.Ctx) error {
	perms, err := h.service.ListPermissions()
	if err != nil {
		return response.InternalError(c, "Failed to fetch permissions")
	}
	return response.OK(c, perms, "")
}
