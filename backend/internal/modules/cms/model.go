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
	ID             string         `gorm:"type:varchar(255);primaryKey" json:"id"`
	Title          string         `gorm:"type:varchar(500);not null" json:"title"`
	Slug           string         `gorm:"type:varchar(600);uniqueIndex;not null" json:"slug"`
	Description    string         `gorm:"type:text" json:"description"`
	Thumbnail      string         `gorm:"type:text" json:"thumbnail"`
	Layouts        string         `gorm:"type:varchar(255)" json:"layouts"`
	Content        string         `gorm:"type:text" json:"content"`
	Blocks         string         `gorm:"type:jsonb" json:"blocks"`
	Status         string         `gorm:"type:varchar(50);default:'draft'" json:"status"`
	CategoryID     *uuid.UUID     `gorm:"type:uuid" json:"category_id"`
	Category       *Category      `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	CreatedBy      uuid.UUID      `gorm:"type:uuid" json:"created_by"`
	PDFKey         string         `gorm:"type:varchar(500)" json:"pdf_key,omitempty"`
	SEOTitle       string         `gorm:"type:varchar(255)" json:"seo_title"`
	SEODescription string         `gorm:"type:text" json:"seo_description"`
	SEOKeywords    string         `gorm:"type:varchar(500)" json:"seo_keywords"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// ─── Request DTOs ─────────────────────────────────────────────

type CreateArticleRequest struct {
	ID             string `json:"id" validate:"required,max=255"`
	Title          string `json:"title" validate:"required,min=3,max=500"`
	Description    string `json:"description"`
	Thumbnail      string `json:"thumbnail"`
	Layouts        string `json:"layouts"`
	Content        string `json:"content" validate:"required"`
	Blocks         string `json:"blocks"`
	Status         string `json:"status" validate:"omitempty,oneof=draft published archived"`
	CategoryID     string `json:"category_id" validate:"omitempty,uuid4"`
	PDFKey         string `json:"pdf_key" validate:"omitempty,max=500"`
	SEOTitle       string `json:"seo_title"`
	SEODescription string `json:"seo_description"`
	SEOKeywords    string `json:"seo_keywords"`
}

type UpdateArticleRequest struct {
	Title          string `json:"title" validate:"omitempty,min=3,max=500"`
	Description    string `json:"description"`
	Thumbnail      string `json:"thumbnail"`
	Layouts        string `json:"layouts"`
	Content        string `json:"content" validate:"omitempty"`
	Blocks         string `json:"blocks"`
	Status         string `json:"status" validate:"omitempty,oneof=draft published archived"`
	CategoryID     string `json:"category_id" validate:"omitempty,uuid4"`
	PDFKey         string `json:"pdf_key" validate:"omitempty,max=500"`
	SEOTitle       string `json:"seo_title"`
	SEODescription string `json:"seo_description"`
	SEOKeywords    string `json:"seo_keywords"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" validate:"required,min=2,max=255"`
}

// ─── Response DTOs ────────────────────────────────────────────

type ArticleResponse struct {
	ID             string            `json:"id"`
	Title          string            `json:"title"`
	Slug           string            `json:"slug"`
	Description    string            `json:"description"`
	Thumbnail      string            `json:"thumbnail"`
	Layouts        string            `json:"layouts"`
	Content        string            `json:"content"`
	Blocks         string            `json:"blocks,omitempty"`
	Status         string            `json:"status"`
	CategoryID     string            `json:"category_id"`
	Category       *CategoryResponse `json:"category,omitempty"`
	CreatedBy      string            `json:"created_by"`
	PDFKey         string            `json:"pdf_key,omitempty"`
	SEOTitle       string            `json:"seo_title,omitempty"`
	SEODescription string            `json:"seo_description,omitempty"`
	SEOKeywords    string            `json:"seo_keywords,omitempty"`
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	IsPreview      bool              `json:"is_preview"`
}

type CategoryResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

func toArticleResponse(a *Article) *ArticleResponse {
	r := &ArticleResponse{
		ID:             a.ID,
		Title:          a.Title,
		Slug:           a.Slug,
		Description:    a.Description,
		Thumbnail:      a.Thumbnail,
		Layouts:        a.Layouts,
		Content:        a.Content,
		Blocks:         a.Blocks,
		Status:         a.Status,
		CreatedBy:      a.CreatedBy.String(),
		PDFKey:         a.PDFKey,
		SEOTitle:       a.SEOTitle,
		SEODescription: a.SEODescription,
		SEOKeywords:    a.SEOKeywords,
		CreatedAt:      a.CreatedAt,
		UpdatedAt:      a.UpdatedAt,
		IsPreview:      false,
	}
	if a.CategoryID != nil {
		r.CategoryID = a.CategoryID.String()
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
