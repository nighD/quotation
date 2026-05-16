package response

import "github.com/gofiber/fiber/v2"

// Meta holds pagination information.
type Meta struct {
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	TotalItems int64 `json:"total_items"`
	TotalPages int64 `json:"total_pages"`
}

// Response is the standard JSON envelope for all API responses.
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
	Error   interface{} `json:"error,omitempty"`
}

// OK sends a 200 success response.
func OK(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusOK).JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// OKWithMeta sends a 200 success response with pagination meta.
func OKWithMeta(c *fiber.Ctx, data interface{}, message string, meta *Meta) error {
	return c.Status(fiber.StatusOK).JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
		Meta:    meta,
	})
}

// Created sends a 201 response.
func Created(c *fiber.Ctx, data interface{}, message string) error {
	return c.Status(fiber.StatusCreated).JSON(Response{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// BadRequest sends a 400 response.
func BadRequest(c *fiber.Ctx, message string, err interface{}) error {
	return c.Status(fiber.StatusBadRequest).JSON(Response{
		Success: false,
		Message: message,
		Error:   err,
	})
}

// Unauthorized sends a 401 response.
func Unauthorized(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Unauthorized"
	}
	return c.Status(fiber.StatusUnauthorized).JSON(Response{
		Success: false,
		Message: message,
	})
}

// Forbidden sends a 403 response.
func Forbidden(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Access denied"
	}
	return c.Status(fiber.StatusForbidden).JSON(Response{
		Success: false,
		Message: message,
	})
}

// NotFound sends a 404 response.
func NotFound(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Resource not found"
	}
	return c.Status(fiber.StatusNotFound).JSON(Response{
		Success: false,
		Message: message,
	})
}

// Conflict sends a 409 response.
func Conflict(c *fiber.Ctx, message string) error {
	return c.Status(fiber.StatusConflict).JSON(Response{
		Success: false,
		Message: message,
	})
}

// InternalError sends a 500 response.
func InternalError(c *fiber.Ctx, message string) error {
	if message == "" {
		message = "Internal server error"
	}
	return c.Status(fiber.StatusInternalServerError).JSON(Response{
		Success: false,
		Message: message,
	})
}

// TooManyRequests sends a 429 response.
func TooManyRequests(c *fiber.Ctx) error {
	return c.Status(fiber.StatusTooManyRequests).JSON(Response{
		Success: false,
		Message: "Too many requests. Please try again later.",
	})
}

// NewMeta creates pagination meta from raw values.
func NewMeta(page, pageSize int, totalItems int64) *Meta {
	totalPages := totalItems / int64(pageSize)
	if totalItems%int64(pageSize) > 0 {
		totalPages++
	}
	return &Meta{
		Page:       page,
		PageSize:   pageSize,
		TotalItems: totalItems,
		TotalPages: totalPages,
	}
}
