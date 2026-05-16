package analytics

import (
	"time"

	"gorm.io/gorm"
)

// Service handles analytics aggregation queries.
type Service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

// DashboardStats holds high-level platform metrics.
type DashboardStats struct {
	TotalUsers         int64   `json:"total_users"`
	ActiveUsers        int64   `json:"active_users"`
	TotalRevenue       float64 `json:"total_revenue"`
	ActiveSubscription int64   `json:"active_subscriptions"`
	TotalArticles      int64   `json:"total_articles"`
	NewUsersToday      int64   `json:"new_users_today"`
}

// RevenueReport holds daily revenue entries.
type RevenueReport struct {
	Date    string  `json:"date"`
	Revenue float64 `json:"revenue"`
	Count   int64   `json:"count"`
}

// SubscriptionReport holds plan subscription breakdown.
type SubscriptionReport struct {
	PlanName string `json:"plan_name"`
	Count    int64  `json:"count"`
}

func (s *Service) GetDashboard() (*DashboardStats, error) {
	stats := &DashboardStats{}

	s.db.Raw("SELECT COUNT(*) FROM users WHERE deleted_at IS NULL").Scan(&stats.TotalUsers)
	s.db.Raw("SELECT COUNT(*) FROM users WHERE status = 'active' AND deleted_at IS NULL").Scan(&stats.ActiveUsers)
	s.db.Raw("SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'success'").Scan(&stats.TotalRevenue)
	s.db.Raw("SELECT COUNT(*) FROM user_subscriptions WHERE status = 'active' AND end_date > NOW()").Scan(&stats.ActiveSubscription)
	s.db.Raw("SELECT COUNT(*) FROM articles WHERE deleted_at IS NULL").Scan(&stats.TotalArticles)
	s.db.Raw("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE").Scan(&stats.NewUsersToday)

	return stats, nil
}

func (s *Service) GetRevenueReport(days int) ([]RevenueReport, error) {
	var report []RevenueReport

	if days <= 0 {
		days = 30
	}

	since := time.Now().AddDate(0, 0, -days)
	s.db.Raw(`
		SELECT 
			DATE(created_at) AS date,
			COALESCE(SUM(amount), 0) AS revenue,
			COUNT(*) AS count
		FROM payments
		WHERE status = 'success' AND created_at >= ?
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`, since).Scan(&report)

	return report, nil
}

func (s *Service) GetSubscriptionReport() ([]SubscriptionReport, error) {
	var report []SubscriptionReport

	s.db.Raw(`
		SELECT 
			sp.name AS plan_name,
			COUNT(us.id) AS count
		FROM user_subscriptions us
		INNER JOIN subscription_plans sp ON sp.id = us.subscription_plan_id
		WHERE us.status = 'active'
		GROUP BY sp.name
		ORDER BY count DESC
	`).Scan(&report)

	return report, nil
}
