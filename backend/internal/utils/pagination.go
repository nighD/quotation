package utils

import (
	"strconv"

	"github.com/baole/quotation/internal/constants"
	"github.com/gofiber/fiber/v2"
)

// PaginationQuery holds parsed pagination parameters.
type PaginationQuery struct {
	Page     int
	PageSize int
	Offset   int
}

// ParsePagination extracts and validates pagination params from query string.
func ParsePagination(c *fiber.Ctx) PaginationQuery {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", strconv.Itoa(constants.DefaultPageSize)))

	if page < 1 {
		page = constants.DefaultPage
	}
	if pageSize < 1 {
		pageSize = constants.DefaultPageSize
	}
	if pageSize > constants.MaxPageSize {
		pageSize = constants.MaxPageSize
	}

	return PaginationQuery{
		Page:     page,
		PageSize: pageSize,
		Offset:   (page - 1) * pageSize,
	}
}
