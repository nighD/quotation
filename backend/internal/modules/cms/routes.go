package cms

import (
	"github.com/baole/quotation/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

// RegisterRoutes registers CMS routes.
func RegisterRoutes(router fiber.Router, handler *Handler, jwtSecret string) {
	cms := router.Group("/cms")

	authMW := middleware.Auth(jwtSecret)
	optionalAuthMW := middleware.OptionalAuth(jwtSecret)
	editorMW := middleware.RequireAnyRole("admin", "editor")

	// Articles
	articles := cms.Group("/articles")
	articles.Get("/", handler.ListArticles)               // public
	articles.Get("/:id", optionalAuthMW, handler.GetArticle) // public, but checks JWT
	articles.Post("/", authMW, editorMW, handler.CreateArticle)
	articles.Put("/:id", authMW, editorMW, handler.UpdateArticle)
	articles.Delete("/:id", authMW, middleware.RequireAdmin(), handler.DeleteArticle)

	// Categories
	categories := cms.Group("/categories")
	categories.Get("/", handler.ListCategories)           // public
	categories.Post("/", authMW, middleware.RequireAdmin(), handler.CreateCategory)
}
