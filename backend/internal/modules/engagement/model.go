package engagement

import (
	"time"

	"github.com/google/uuid"
)

type NewsletterSubscription struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Email     string     `gorm:"type:varchar(255);unique;not null" json:"email"`
	FullName  string     `gorm:"type:varchar(255)" json:"full_name"`
	Source    string     `gorm:"type:varchar(100);default:'dashboard'" json:"source"`
	Status    string     `gorm:"type:varchar(50);default:'subscribed'" json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

type NewsletterRegistration struct {
	ID              uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	NewsletterID    uuid.UUID  `gorm:"type:uuid;not null;index" json:"newsletter_id"`
	UserID          *uuid.UUID `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Email           string     `gorm:"type:varchar(255);not null;index" json:"email"`
	FullName        string     `gorm:"type:varchar(255)" json:"full_name"`
	NewsletterTitle string     `gorm:"type:varchar(500);not null" json:"newsletter_title"`
	NewsletterDate  string     `gorm:"type:varchar(100)" json:"newsletter_date"`
	Location        string     `gorm:"type:varchar(255)" json:"location"`
	Status          string     `gorm:"type:varchar(50);default:'pending';index" json:"status"`
	Note            string     `gorm:"type:text" json:"note"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type EventRegistration struct {
	ID         uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID     *uuid.UUID `gorm:"type:uuid;index" json:"user_id,omitempty"`
	Email      string     `gorm:"type:varchar(255);not null;index" json:"email"`
	FullName   string     `gorm:"type:varchar(255)" json:"full_name"`
	EventID    string     `gorm:"type:varchar(100);index" json:"event_id"`
	EventTitle string     `gorm:"type:varchar(255);not null" json:"event_title"`
	EventDate  string     `gorm:"type:varchar(100)" json:"event_date"`
	Location   string     `gorm:"type:varchar(255)" json:"location"`
	Status     string     `gorm:"type:varchar(50);default:'pending'" json:"status"`
	Notes      string     `gorm:"type:text" json:"notes"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
}

type BookingRequest struct {
	ID           uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID       uuid.UUID `gorm:"type:uuid;index;not null" json:"user_id"`
	Email        string    `gorm:"type:varchar(255);not null;index" json:"email"`
	FullName     string    `gorm:"type:varchar(255)" json:"full_name"`
	BookingType  string    `gorm:"type:varchar(100);not null;index" json:"booking_type"`
	BookingTitle string    `gorm:"type:varchar(255);not null" json:"booking_title"`
	Status       string    `gorm:"type:varchar(50);default:'pending';index" json:"status"`
	Source       string    `gorm:"type:varchar(100);default:'admin-dashboard'" json:"source"`
	Note         string    `gorm:"type:text" json:"note"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UpgradeRequest struct {
	ID            uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID        uuid.UUID  `gorm:"type:uuid;index;not null" json:"user_id"`
	Email         string     `gorm:"type:varchar(255);not null;index" json:"email"`
	FullName      string     `gorm:"type:varchar(255)" json:"full_name"`
	Company       string     `gorm:"type:varchar(255)" json:"company"`
	Title         string     `gorm:"type:varchar(255)" json:"title"`
	Country       string     `gorm:"type:varchar(100)" json:"country"`
	Note          string     `gorm:"type:text" json:"note"`
	Status        string     `gorm:"type:varchar(50);default:'pending';index" json:"status"`
	RequestedRole string     `gorm:"type:varchar(100);default:'premium'" json:"requested_role"`
	QueueNumber   int        `gorm:"unique;not null" json:"queue_number"`
	CardNumber    string     `gorm:"type:varchar(100)" json:"card_number"`
	ReviewNote    string     `gorm:"type:text" json:"review_note"`
	ReviewedAt    *time.Time `json:"reviewed_at,omitempty"`
	ReviewedBy    *uuid.UUID `gorm:"type:uuid" json:"reviewed_by,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type SubscribeNewsletterRequest struct {
	Source string `json:"source" validate:"omitempty,max=100"`
}

type RegisterNewsletterRequest struct {
	NewsletterID    string `json:"newsletter_id" validate:"required,max=100"`
	NewsletterTitle string `json:"newsletter_title" validate:"required,min=2,max=500"`
	NewsletterDate  string `json:"newsletter_date" validate:"omitempty,max=100"`
	Location        string `json:"location" validate:"omitempty,max=255"`
	Note            string `json:"note" validate:"omitempty,max=2000"`
}

type ReviewNewsletterRegistrationRequest struct {
	Status string `json:"status" validate:"required,oneof=approved rejected pending"`
	Note   string `json:"note" validate:"omitempty,max=2000"`
}

type RegisterEventRequest struct {
	EventID    string `json:"event_id" validate:"required,max=100"`
	EventTitle string `json:"event_title" validate:"required,min=2,max=255"`
	EventDate  string `json:"event_date" validate:"omitempty,max=100"`
	Location   string `json:"location" validate:"omitempty,max=255"`
	Notes      string `json:"notes" validate:"omitempty,max=2000"`
}

type SubmitBookingRequestRequest struct {
	BookingType  string `json:"booking_type" validate:"required,max=100"`
	BookingTitle string `json:"booking_title" validate:"required,min=2,max=255"`
	Source       string `json:"source" validate:"omitempty,max=100"`
	Note         string `json:"note" validate:"omitempty,max=2000"`
}

type SubmitUpgradeRequestRequest struct {
	Company string `json:"company" validate:"required,max=255"`
	Country string `json:"country" validate:"omitempty,max=100"`
	Note    string `json:"note" validate:"omitempty,max=2000"`
}

type ReviewUpgradeRequestRequest struct {
	Status   string `json:"status" validate:"required,oneof=approved rejected"`
	RoleName string `json:"role_name" validate:"omitempty,oneof=base standard premium"`
	Note     string `json:"note" validate:"omitempty,max=2000"`
}

type UserCard struct {
	ID        uuid.UUID `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Username  string    `gorm:"type:varchar(255);not null;index" json:"username"`
	SoThe     string    `gorm:"type:varchar(100);not null" json:"so_the"`
	LoaiThe   string    `gorm:"type:varchar(100);not null" json:"loai_the"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

