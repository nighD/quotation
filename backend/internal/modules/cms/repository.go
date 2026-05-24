package cms

import (
	"fmt"

	"gorm.io/gorm"
)

// Repository handles database operations for CMS.
type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// ─── Article operations ──────────────────────────────────────

func (r *Repository) CreateArticle(a *Article) error {
	return r.db.Create(a).Error
}

func (r *Repository) FindAllArticles(offset, limit int, status string) ([]Article, int64, error) {
	var articles []Article
	var total int64

	query := r.db.Model(&Article{}).Preload("Category")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

func (r *Repository) FindArticleByID(id string) (*Article, error) {
	var article Article
	if err := r.db.Preload("Category").Where("id = ?", id).First(&article).Error; err != nil {
		return nil, fmt.Errorf("article not found")
	}
	return &article, nil
}

func (r *Repository) UpdateArticle(id string, updates map[string]interface{}) (*Article, error) {
	var article Article
	if err := r.db.Where("id = ?", id).First(&article).Error; err != nil {
		return nil, fmt.Errorf("article not found")
	}
	if err := r.db.Model(&article).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update article: %w", err)
	}
	return &article, nil
}

func (r *Repository) DeleteArticle(id string) error {
	result := r.db.Where("id = ?", id).Delete(&Article{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("article not found")
	}
	return nil
}

func (r *Repository) SlugExists(slug string) bool {
	var count int64
	r.db.Model(&Article{}).Where("slug = ?", slug).Count(&count)
	return count > 0
}

func (r *Repository) HasActiveSubscription(userID string) bool {
	var count int64
	r.db.Table("user_subscriptions").
		Joins("JOIN subscription_plans ON subscription_plans.id = user_subscriptions.subscription_plan_id").
		Where("user_subscriptions.user_id = ? AND user_subscriptions.status = 'active' AND user_subscriptions.end_date > NOW() AND subscription_plans.name IN ('Quarterly Pro', 'Annual Premium')", userID).
		Count(&count)
	return count > 0
}

// ─── Category operations ─────────────────────────────────────

func (r *Repository) CreateCategory(c *Category) error {
	return r.db.Create(c).Error
}

func (r *Repository) FindAllCategories() ([]Category, error) {
	var categories []Category
	if err := r.db.Order("name ASC").Find(&categories).Error; err != nil {
		return nil, err
	}
	return categories, nil
}
