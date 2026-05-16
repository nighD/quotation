package users

import (
	"github.com/baole/quotation/internal/utils"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the users module.
type Handler struct {
	service *Service
}

// NewHandler creates a new users handler.
func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ListUsers godoc
// @Summary      List users
// @Description  Get paginated list of users (admin only)
// @Tags         users
// @Security     BearerAuth
// @Produce      json
// @Param        page      query int false "Page number"
// @Param        page_size query int false "Page size"
// @Success      200  {object}  response.Response{data=[]UserResponse}
// @Router       /users [get]
func (h *Handler) ListUsers(c *fiber.Ctx) error {
	pg := utils.ParsePagination(c)

	users, total, err := h.service.ListUsers(pg.Page, pg.PageSize)
	if err != nil {
		return response.InternalError(c, "Failed to fetch users")
	}

	return response.OKWithMeta(c, users, "", response.NewMeta(pg.Page, pg.PageSize, total))
}

// GetUser godoc
// @Summary      Get user
// @Description  Get a single user by ID
// @Tags         users
// @Security     BearerAuth
// @Param        id path string true "User ID"
// @Produce      json
// @Success      200  {object}  response.Response{data=UserResponse}
// @Failure      404  {object}  response.Response
// @Router       /users/{id} [get]
func (h *Handler) GetUser(c *fiber.Ctx) error {
	id := c.Params("id")
	user, err := h.service.GetUser(id)
	if err != nil {
		return response.NotFound(c, "User not found")
	}
	return response.OK(c, user, "")
}

// UpdateUser godoc
// @Summary      Update user
// @Description  Update user fields
// @Tags         users
// @Security     BearerAuth
// @Param        id   path string true "User ID"
// @Param        body body UpdateUserRequest true "Update payload"
// @Produce      json
// @Success      200  {object}  response.Response{data=UserResponse}
// @Failure      400  {object}  response.Response
// @Router       /users/{id} [put]
func (h *Handler) UpdateUser(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}

	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	user, err := h.service.UpdateUser(id, &req)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.OK(c, user, "User updated successfully")
}

// DeleteUser godoc
// @Summary      Delete user
// @Description  Soft-delete a user
// @Tags         users
// @Security     BearerAuth
// @Param        id path string true "User ID"
// @Produce      json
// @Success      200  {object}  response.Response
// @Failure      404  {object}  response.Response
// @Router       /users/{id} [delete]
func (h *Handler) DeleteUser(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteUser(id); err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.OK(c, nil, "User deleted successfully")
}
