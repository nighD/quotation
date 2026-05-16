package subscriptions

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository handles database operations for subscriptions.
type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListActivePlans() ([]SubscriptionPlan, error) {
	var plans []SubscriptionPlan
	if err := r.db.Where("is_active = ?", true).Order("price ASC").Find(&plans).Error; err != nil {
		return nil, err
	}
	return plans, nil
}

func (r *Repository) FindPlanByID(id string) (*SubscriptionPlan, error) {
	var plan SubscriptionPlan
	if err := r.db.Where("id = ? AND is_active = ?", id, true).First(&plan).Error; err != nil {
		return nil, fmt.Errorf("subscription plan not found")
	}
	return &plan, nil
}

func (r *Repository) CreateSubscription(sub *UserSubscription) error {
	return r.db.Create(sub).Error
}

func (r *Repository) FindSubscriptionByID(id string) (*UserSubscription, error) {
	var sub UserSubscription
	if err := r.db.Preload("Plan").Where("id = ?", id).First(&sub).Error; err != nil {
		return nil, fmt.Errorf("user subscription not found")
	}
	return &sub, nil
}

func (r *Repository) FindActiveSubscription(userID string) (*UserSubscription, error) {
	var sub UserSubscription
	err := r.db.Preload("Plan").
		Where("user_id = ? AND status = ? AND end_date > ?", userID, "active", time.Now()).
		Order("end_date DESC").
		First(&sub).Error
	if err != nil {
		return nil, fmt.Errorf("no active subscription found")
	}
	return &sub, nil
}

func (r *Repository) ActivateSubscription(id uuid.UUID, startDate, endDate time.Time) error {
	return r.db.Model(&UserSubscription{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"status":     "active",
			"start_date": startDate,
			"end_date":   endDate,
		}).Error
}
