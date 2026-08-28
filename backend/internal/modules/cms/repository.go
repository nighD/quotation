package cms

import (
	"fmt"
	"strings"

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

func (r *Repository) FindAllArticles(offset, limit int, status string, tag string) ([]Article, int64, error) {
	var articles []Article
	var total int64

	query := r.db.Model(&Article{}).Preload("Category")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if tag != "" {
		lowerTag := strings.ToLower(strings.TrimSpace(tag))
		query = query.Where("? = ANY (regexp_split_to_array(LOWER(seo_keywords), '\\s*,\\s*'))", lowerTag)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&articles).Error; err != nil {
		return nil, 0, err
	}

	return articles, total, nil
}

func (r *Repository) FindArticleByID(id string) (*Article, error) {
	var article Article
	if err := r.db.Preload("Category").Where("id = ? OR slug = ?", id, id).First(&article).Error; err != nil {
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
		Where("user_subscriptions.user_id = ? AND LOWER(user_subscriptions.status) = 'active' AND user_subscriptions.end_date > NOW() AND subscription_plans.name IN ('Quarterly Pro', 'Annual Premium')", userID).
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

// ─── CourseRegistration operations ────────────────────────────

func (r *Repository) CreateCourseRegistration(c *CourseRegistration) error {
	return r.db.Create(c).Error
}

func (r *Repository) FindAllCourseRegistrations(offset, limit int, status string) ([]CourseRegistration, int64, error) {
	var registrations []CourseRegistration
	var total int64

	query := r.db.Model(&CourseRegistration{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&registrations).Error; err != nil {
		return nil, 0, err
	}
	return registrations, total, nil
}

func (r *Repository) FindCourseRegistrationByID(id string) (*CourseRegistration, error) {
	var registration CourseRegistration
	if err := r.db.Where("id = ?", id).First(&registration).Error; err != nil {
		return nil, fmt.Errorf("course registration not found")
	}
	return &registration, nil
}

func (r *Repository) UpdateCourseRegistration(id string, updates map[string]interface{}) (*CourseRegistration, error) {
	var registration CourseRegistration
	if err := r.db.Where("id = ?", id).First(&registration).Error; err != nil {
		return nil, fmt.Errorf("course registration not found")
	}
	if err := r.db.Model(&registration).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to update course registration: %w", err)
	}
	return &registration, nil
}

func (r *Repository) DeleteCourseRegistration(id string) error {
	result := r.db.Where("id = ?", id).Delete(&CourseRegistration{})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("course registration not found")
	}
	return nil
}

// ─── Course operations ────────────────────────────────────────

func (r *Repository) FindAllCourses(offset, limit int, status string) ([]Course, int64, error) {
	var courses []Course
	var total int64

	query := r.db.Model(&Course{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("order_index ASC, created_at DESC").Find(&courses).Error; err != nil {
		return nil, 0, err
	}
	return courses, total, nil
}

// ─── Event operations ─────────────────────────────────────────

func (r *Repository) FindAllEvents(offset, limit int, status string) ([]Event, int64, error) {
	var events []Event
	var total int64

	query := r.db.Model(&Event{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("order_index ASC, created_at DESC").Find(&events).Error; err != nil {
		return nil, 0, err
	}
	return events, total, nil
}

// ─── Newsletter operations ────────────────────────────────────

func (r *Repository) FindAllNewsletters(offset, limit int, status string) ([]Newsletter, int64, error) {
	var newsletters []Newsletter
	var total int64

	query := r.db.Model(&Newsletter{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)
	if err := query.Offset(offset).Limit(limit).Order("order_index ASC, created_at DESC").Find(&newsletters).Error; err != nil {
		return nil, 0, err
	}
	return newsletters, total, nil
}

func (r *Repository) FindNewsletterByID(id string) (*Newsletter, error) {
	var n Newsletter
	if err := r.db.First(&n, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *Repository) CreateNewsletter(n *Newsletter) error {
	return r.db.Create(n).Error
}

func (r *Repository) UpdateNewsletter(id string, updates map[string]interface{}) (*Newsletter, error) {
	var n Newsletter
	if err := r.db.First(&n, "id = ?", id).Error; err != nil {
		return nil, err
	}
	if err := r.db.Model(&n).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *Repository) DeleteNewsletter(id string) error {
	result := r.db.Delete(&Newsletter{}, "id = ?", id)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return fmt.Errorf("newsletter not found")
	}
	return nil
}
