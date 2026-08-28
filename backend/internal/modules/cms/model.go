package cms

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Category is the GORM model for the categories table.
type Category struct {
	ID        uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name      string         `gorm:"type:varchar(255);unique;not null" json:"name"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// Article is the GORM model for the articles table.
type Article struct {
	ID             string         `gorm:"type:varchar(255);primaryKey" json:"id"`
	Title          string         `gorm:"type:varchar(500);not null" json:"title"`
	Slug           string         `gorm:"type:varchar(600);unique;not null" json:"slug"`
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

// CourseRegistration is the GORM model for the course_registrations table.
type CourseRegistration struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID       *uuid.UUID     `gorm:"type:uuid;index:idx_course_registrations_user_id" json:"user_id"`
	Email        string         `gorm:"type:varchar(255);not null;index:idx_course_registrations_email" json:"email"`
	FullName     string         `gorm:"type:varchar(255);not null" json:"full_name"`
	Phone        *string        `gorm:"type:varchar(50)" json:"phone"`
	Company      *string        `gorm:"type:varchar(255)" json:"company"`
	BookingType  string         `gorm:"type:varchar(50);not null;default:'course';index:idx_course_registrations_booking_type" json:"booking_type"`
	BookingTitle string         `gorm:"type:varchar(500);not null" json:"booking_title"`
	TuitionFee   *float64       `gorm:"type:decimal(12,2);default:0" json:"tuition_fee"`
	Deposit      *float64       `gorm:"type:decimal(12,2);default:0" json:"deposit"`
	Status       string         `gorm:"type:varchar(50);not null;default:'pending';index:idx_course_registrations_status" json:"status"`
	Source       string         `gorm:"type:varchar(100);not null;default:'web-dashboard'" json:"source"`
	Note         *string        `gorm:"type:text" json:"note"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CourseRegistration) TableName() string {
	return "course_registrations"
}

// Course is the GORM model for the courses table.
type Course struct {
	ID            uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title         string         `gorm:"type:varchar(500);not null" json:"title"`
	BookingType   string         `gorm:"type:varchar(100);unique;not null" json:"booking_type"`
	BookingTitle  string         `gorm:"type:varchar(500);not null" json:"booking_title"`
	Description   string         `gorm:"type:text" json:"description"`
	Image         string         `gorm:"type:text" json:"image"`
	FallbackImage string         `gorm:"type:text" json:"fallback_image"`
	Instructor    string         `gorm:"type:varchar(255)" json:"instructor"`
	Duration      string         `gorm:"type:varchar(100)" json:"duration"`
	Schedule      string         `gorm:"type:varchar(100)" json:"schedule"`
	TuitionFee    float64        `gorm:"type:decimal(12,2);default:0" json:"tuition_fee"`
	Status        string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	OrderIndex    int            `gorm:"default:0" json:"order_index"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// Event is the GORM model for the events table.
type Event struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string         `gorm:"type:varchar(500);not null" json:"title"`
	Subtitle    string         `gorm:"type:varchar(500)" json:"subtitle"`
	Location    string         `gorm:"type:varchar(255)" json:"location"`
	Date        string         `gorm:"type:varchar(100)" json:"date"`
	Image       string         `gorm:"type:text" json:"image"`
	Badge       string         `gorm:"type:varchar(100)" json:"badge"`
	LumaURL     string         `gorm:"type:text" json:"luma_url"`
	Description string         `gorm:"type:text" json:"description"`
	Status      string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	OrderIndex  int            `gorm:"default:0" json:"order_index"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Newsletter is the GORM model for the newsletters table.
type Newsletter struct {
	ID          uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Title       string         `gorm:"type:varchar(500);not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Date        string         `gorm:"type:varchar(100);not null" json:"date"`
	Location    string         `gorm:"type:varchar(255);not null" json:"location"`
	Image       string         `gorm:"type:text" json:"image"`
	Status      string         `gorm:"type:varchar(50);default:'active'" json:"status"`
	OrderIndex  int            `gorm:"default:0" json:"order_index"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
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
	RequiredRole   string            `json:"required_role,omitempty"`
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
	requiredRole, _ := getPDFActiveRoleAndKey(a.Blocks)
	r := &ArticleResponse{
		ID:             a.ID,
		Title:          a.Title,
		Slug:           a.Slug,
		Description:    a.Description,
		Thumbnail:      a.Thumbnail,
		Layouts:        a.Layouts,
		Content:        a.Content,
		Blocks:         stripPDFURLs(a.Blocks),
		Status:         a.Status,
		CreatedBy:      a.CreatedBy.String(),
		PDFKey:         a.PDFKey,
		SEOTitle:       a.SEOTitle,
		SEODescription: a.SEODescription,
		SEOKeywords:    a.SEOKeywords,
		RequiredRole:   requiredRole,
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

func stripPDFURLs(blocksJSON string) string {
	if blocksJSON == "" {
		return ""
	}
	var blocks []map[string]interface{}
	if err := json.Unmarshal([]byte(blocksJSON), &blocks); err != nil {
		return blocksJSON
	}
	for i, b := range blocks {
		if t, ok := b["type"].(string); ok && t == "pdf" {
			delete(b, "url")
			blocks[i] = b
		}
	}
	resBytes, err := json.Marshal(blocks)
	if err != nil {
		return blocksJSON
	}
	return string(resBytes)
}

type CreateCourseRegistrationRequest struct {
	UserID       string   `json:"user_id" validate:"omitempty,uuid4"`
	Email        string   `json:"email" validate:"required,email,max=255"`
	FullName     string   `json:"full_name" validate:"required,max=255"`
	Phone        string   `json:"phone" validate:"omitempty,max=50"`
	Company      string   `json:"company" validate:"omitempty,max=255"`
	BookingType  string   `json:"booking_type" validate:"omitempty,max=50"`
	BookingTitle string   `json:"booking_title" validate:"required,max=500"`
	TuitionFee   *float64 `json:"tuition_fee"`
	Deposit      *float64 `json:"deposit"`
	Status       string   `json:"status" validate:"omitempty,max=50"`
	Source       string   `json:"source" validate:"omitempty,max=100"`
	Note         string   `json:"note"`
}

type UpdateCourseRegistrationRequest struct {
	Status string `json:"status" validate:"required,max=50"`
	Note   string `json:"note"`
}

type CourseRegistrationResponse struct {
	ID           string    `json:"id"`
	UserID       *string   `json:"user_id,omitempty"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	Phone        *string   `json:"phone,omitempty"`
	Company      *string   `json:"company,omitempty"`
	BookingType  string    `json:"booking_type"`
	BookingTitle string    `json:"booking_title"`
	TuitionFee   *float64  `json:"tuition_fee,omitempty"`
	Deposit      *float64  `json:"deposit,omitempty"`
	Status       string    `json:"status"`
	Source       string    `json:"source"`
	Note         *string   `json:"note,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func toCourseRegistrationResponse(c *CourseRegistration) *CourseRegistrationResponse {
	var userID *string
	if c.UserID != nil {
		idStr := c.UserID.String()
		userID = &idStr
	}
	return &CourseRegistrationResponse{
		ID:           c.ID.String(),
		UserID:       userID,
		Email:        c.Email,
		FullName:     c.FullName,
		Phone:        c.Phone,
		Company:      c.Company,
		BookingType:  c.BookingType,
		BookingTitle: c.BookingTitle,
		TuitionFee:   c.TuitionFee,
		Deposit:      c.Deposit,
		Status:       c.Status,
		Source:       c.Source,
		Note:         c.Note,
		CreatedAt:    c.CreatedAt,
		UpdatedAt:    c.UpdatedAt,
	}
}

type CourseResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	BookingType   string    `json:"booking_type"`
	BookingTitle  string    `json:"booking_title"`
	Description   string    `json:"description"`
	Image         string    `json:"image"`
	FallbackImage string    `json:"fallback_image"`
	Instructor    string    `json:"instructor"`
	Duration      string    `json:"duration"`
	Schedule      string    `json:"schedule"`
	TuitionFee    float64   `json:"tuition_fee"`
	Status        string    `json:"status"`
	OrderIndex    int       `json:"order_index"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func toCourseResponse(c *Course) *CourseResponse {
	return &CourseResponse{
		ID:            c.ID.String(),
		Title:         c.Title,
		BookingType:   c.BookingType,
		BookingTitle:  c.BookingTitle,
		Description:   c.Description,
		Image:         c.Image,
		FallbackImage: c.FallbackImage,
		Instructor:    c.Instructor,
		Duration:      c.Duration,
		Schedule:      c.Schedule,
		TuitionFee:    c.TuitionFee,
		Status:        c.Status,
		OrderIndex:    c.OrderIndex,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

type EventResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Subtitle    string    `json:"subtitle"`
	Location    string    `json:"location"`
	Date        string    `json:"date"`
	Image       string    `json:"image"`
	Badge       string    `json:"badge"`
	LumaURL     string    `json:"luma_url"`
	Description string    `json:"description"`
	Status      string    `json:"status"`
	OrderIndex  int       `json:"order_index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func toEventResponse(e *Event) *EventResponse {
	return &EventResponse{
		ID:          e.ID.String(),
		Title:       e.Title,
		Subtitle:    e.Subtitle,
		Location:    e.Location,
		Date:        e.Date,
		Image:       e.Image,
		Badge:       e.Badge,
		LumaURL:     e.LumaURL,
		Description: e.Description,
		Status:      e.Status,
		OrderIndex:  e.OrderIndex,
		CreatedAt:   e.CreatedAt,
		UpdatedAt:   e.UpdatedAt,
	}
}

// ─── Newsletter DTOs ──────────────────────────────────────────

type CreateNewsletterRequest struct {
	Title       string `json:"title" validate:"required,min=2,max=500"`
	Description string `json:"description"`
	Date        string `json:"date" validate:"required,max=100"`
	Location    string `json:"location" validate:"required,max=255"`
	Image       string `json:"image"`
	Status      string `json:"status" validate:"omitempty,oneof=active inactive"`
	OrderIndex  int    `json:"order_index"`
}

type UpdateNewsletterRequest struct {
	Title       string `json:"title" validate:"omitempty,min=2,max=500"`
	Description string `json:"description"`
	Date        string `json:"date" validate:"omitempty,max=100"`
	Location    string `json:"location" validate:"omitempty,max=255"`
	Image       string `json:"image"`
	Status      string `json:"status" validate:"omitempty,oneof=active inactive"`
	OrderIndex  int    `json:"order_index"`
}

type NewsletterResponse struct {
	ID          string    `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        string    `json:"date"`
	Location    string    `json:"location"`
	Image       string    `json:"image"`
	Status      string    `json:"status"`
	OrderIndex  int       `json:"order_index"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func toNewsletterResponse(n *Newsletter) *NewsletterResponse {
	return &NewsletterResponse{
		ID:          n.ID.String(),
		Title:       n.Title,
		Description: n.Description,
		Date:        n.Date,
		Location:    n.Location,
		Image:       n.Image,
		Status:      n.Status,
		OrderIndex:  n.OrderIndex,
		CreatedAt:   n.CreatedAt,
		UpdatedAt:   n.UpdatedAt,
	}
}

