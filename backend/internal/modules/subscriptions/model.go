package subscriptions

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SubscriptionPlan is the GORM model for subscription_plans.
type SubscriptionPlan struct {
	ID           uuid.UUID      `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	Price        float64        `gorm:"type:decimal(12,2);not null" json:"price"`
	DurationDays int            `gorm:"not null" json:"duration_days"`
	Description  string         `gorm:"type:text" json:"description"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

// UserSubscription is the GORM model for user_subscriptions.
type UserSubscription struct {
	ID                 uuid.UUID        `gorm:"type:uuid;default:gen_random_uuid();primaryKey" json:"id"`
	UserID             uuid.UUID        `gorm:"type:uuid;not null;index" json:"user_id"`
	SubscriptionPlanID uuid.UUID        `gorm:"type:uuid;not null" json:"subscription_plan_id"`
	Plan               *SubscriptionPlan `gorm:"foreignKey:SubscriptionPlanID" json:"plan,omitempty"`
	StartDate          time.Time        `json:"start_date"`
	EndDate            time.Time        `json:"end_date"`
	Status             string           `gorm:"type:varchar(50);default:'pending'" json:"status"`
	CreatedAt          time.Time        `json:"created_at"`
	UpdatedAt          time.Time        `json:"updated_at"`
}

// ─── Request DTOs ─────────────────────────────────────────────

type PurchaseRequest struct {
	PlanID string `json:"plan_id" validate:"required,uuid4"`
}

// ─── Response DTOs ────────────────────────────────────────────

type PlanResponse struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	Price        float64 `json:"price"`
	DurationDays int     `json:"duration_days"`
	Description  string  `json:"description"`
}

type SubscriptionResponse struct {
	ID        string       `json:"id"`
	UserID    string       `json:"user_id"`
	Plan      PlanResponse `json:"plan"`
	StartDate time.Time    `json:"start_date"`
	EndDate   time.Time    `json:"end_date"`
	Status    string       `json:"status"`
	IsActive  bool         `json:"is_active"`
}

func toPlanResponse(p *SubscriptionPlan) PlanResponse {
	return PlanResponse{
		ID:           p.ID.String(),
		Name:         p.Name,
		Price:        p.Price,
		DurationDays: p.DurationDays,
		Description:  p.Description,
	}
}

func toSubResponse(s *UserSubscription) *SubscriptionResponse {
	r := &SubscriptionResponse{
		ID:        s.ID.String(),
		UserID:    s.UserID.String(),
		StartDate: s.StartDate,
		EndDate:   s.EndDate,
		Status:    s.Status,
		IsActive:  s.Status == "active" && time.Now().Before(s.EndDate),
	}
	if s.Plan != nil {
		plan := toPlanResponse(s.Plan)
		r.Plan = plan
	}
	return r
}
