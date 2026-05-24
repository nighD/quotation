package payments

import (
	"fmt"

	"gorm.io/gorm"
)

// Repository handles database operations for payments.
type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(p *Payment) error {
	return r.db.Create(p).Error
}

func (r *Repository) FindByID(id string) (*Payment, error) {
	var p Payment
	if err := r.db.Where("id = ?", id).First(&p).Error; err != nil {
		return nil, fmt.Errorf("payment not found")
	}
	return &p, nil
}

func (r *Repository) FindByTransactionID(txID string) (*Payment, error) {
	var p Payment
	if err := r.db.Where("transaction_id = ?", txID).First(&p).Error; err != nil {
		return nil, fmt.Errorf("payment not found")
	}
	return &p, nil
}

func (r *Repository) UpdateStatus(id, status, txID, metadata string) error {
	updates := map[string]interface{}{
		"status":         status,
		"transaction_id": txID,
	}
	if metadata != "" {
		updates["metadata"] = metadata
	}
	return r.db.Model(&Payment{}).
		Where("id = ?", id).
		Updates(updates).Error
}

func (r *Repository) ListByUserID(userID string, offset, limit int) ([]Payment, int64, error) {
	var payments []Payment
	var total int64

	r.db.Model(&Payment{}).Where("user_id = ?", userID).Count(&total)
	if err := r.db.Where("user_id = ?", userID).
		Offset(offset).Limit(limit).
		Order("created_at DESC").
		Find(&payments).Error; err != nil {
		return nil, 0, err
	}

	return payments, total, nil
}
