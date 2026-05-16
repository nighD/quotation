package cms

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/internal/utils"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the CMS module.
type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

// ─── Articles ─────────────────────────────────────────────────

func (h *Handler) CreateArticle(c *fiber.Ctx) error {
	var req CreateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	userID := middleware.GetUserID(c)
	article, err := h.service.CreateArticle(&req, userID)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.Created(c, article, "Article created successfully")
}

func (h *Handler) ListArticles(c *fiber.Ctx) error {
	pg := utils.ParsePagination(c)
	status := c.Query("status", "")

	articles, total, err := h.service.ListArticles(pg.Page, pg.PageSize, status)
	if err != nil {
		return response.InternalError(c, "Failed to fetch articles")
	}

	return response.OKWithMeta(c, articles, "", response.NewMeta(pg.Page, pg.PageSize, total))
}

func (h *Handler) GetArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middleware.GetUserID(c)
	roles := middleware.GetRoles(c)

	article, err := h.service.GetArticle(id, userID, roles)
	if err != nil {
		return response.NotFound(c, "Article not found")
	}
	return response.OK(c, article, "")
}

func (h *Handler) UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	article, err := h.service.UpdateArticle(id, &req)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.OK(c, article, "Article updated successfully")
}

func (h *Handler) DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteArticle(id); err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.OK(c, nil, "Article deleted successfully")
}

// ─── Categories ───────────────────────────────────────────────

func (h *Handler) CreateCategory(c *fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	cat, err := h.service.CreateCategory(&req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, cat, "Category created successfully")
}

func (h *Handler) ListCategories(c *fiber.Ctx) error {
	cats, err := h.service.ListCategories()
	if err != nil {
		return response.InternalError(c, "Failed to fetch categories")
	}
	return response.OK(c, cats, "")
}
