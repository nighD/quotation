package cms

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Category is the GORM model for the categories table.
type Category struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(255);not null;uniqueIndex" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Article is the GORM model for the articles table.
type Article struct {
	ID         uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title      string         `gorm:"type:varchar(500);not null" json:"title"`
	Slug       string         `gorm:"type:varchar(600);uniqueIndex;not null" json:"slug"`
	Content    string         `gorm:"type:text" json:"content"`
	Status     string         `gorm:"type:varchar(50);default:'draft'" json:"status"`
	CategoryID uuid.UUID      `gorm:"type:uuid" json:"category_id"`
	Category   *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	CreatedBy  uuid.UUID      `gorm:"type:uuid" json:"created_by"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// ─── Request DTOs ─────────────────────────────────────────────

type CreateArticleRequest struct {
	Title      string `json:"title" validate:"required,min=3,max=500"`
	Content    string `json:"content" validate:"required"`
	Status     string `json:"status" validate:"omitempty,oneof=draft published archived"`
	CategoryID string `json:"category_id" validate:"required,uuid4"`
}

type UpdateArticleRequest struct {
	Title      string `json:"title" validate:"omitempty,min=3,max=500"`
	Content    string `json:"content" validate:"omitempty"`
	Status     string `json:"status" validate:"omitempty,oneof=draft published archived"`
	CategoryID string `json:"category_id" validate:"omitempty,uuid4"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

// ─── Response DTOs ────────────────────────────────────────────

type ArticleResponse struct {
	ID         string            `json:"id"`
	Title      string            `json:"title"`
	Slug       string            `json:"slug"`
	Content    string            `json:"content"`
	Status     string            `json:"status"`
	CategoryID string            `json:"category_id"`
	Category   *CategoryResponse `json:"category,omitempty"`
	CreatedBy  string            `json:"created_by"`
	CreatedAt  time.Time         `json:"created_at"`
	UpdatedAt  time.Time         `json:"updated_at"`
	IsPreview  bool              `json:"is_preview"`
}

type CategoryResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

func toArticleResponse(a *Article) *ArticleResponse {
	r := &ArticleResponse{
		ID:         a.ID.String(),
		Title:      a.Title,
		Slug:       a.Slug,
		Content:    a.Content,
		Status:     a.Status,
		CategoryID: a.CategoryID.String(),
		CreatedBy:  a.CreatedBy.String(),
		CreatedAt:  a.CreatedAt,
		UpdatedAt:  a.UpdatedAt,
		IsPreview:  false,
	}
	if a.Category != nil {
		r.Category = toCategoryResponse(a.Category)
	}
	return r
}

func toCategoryResponse(c *Category) *CategoryResponse {
	return &CategoryResponse{
		ID:        c.ID.String(),
		Name:      c.Name,
		CreatedAt: c.CreatedAt,
	}
}
