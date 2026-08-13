package engagement

import (
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type userRecord struct {
	ID       uuid.UUID
	Email    string
	FullName string
	Company  string
	Title    string
	Country  string
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) SubscribeNewsletter(userID string, req *SubscribeNewsletterRequest) (*NewsletterSubscription, error) {
	user, err := s.getUser(userID)
	if err != nil {
		return nil, err
	}

	source := strings.TrimSpace(req.Source)
	if source == "" {
		source = "admin-notifications"
	}

	var existing NewsletterSubscription
	if err := s.db.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		updates := map[string]interface{}{
			"user_id":    user.ID,
			"full_name":  user.FullName,
			"source":     source,
			"status":     "subscribed",
			"updated_at": time.Now(),
		}
		if err := s.db.Model(&existing).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("failed to update newsletter subscription: %w", err)
		}
		if err := s.db.First(&existing, "id = ?", existing.ID).Error; err != nil {
			return nil, fmt.Errorf("failed to reload newsletter subscription: %w", err)
		}
		return &existing, nil
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to query newsletter subscription: %w", err)
	}

	item := &NewsletterSubscription{
		UserID:   &user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		Source:   source,
		Status:   "subscribed",
	}
	if err := s.db.Create(item).Error; err != nil {
		return nil, fmt.Errorf("failed to create newsletter subscription: %w", err)
	}
	return item, nil
}

func (s *Service) ListNewsletterSubscriptions() ([]NewsletterSubscription, error) {
	var items []NewsletterSubscription
	if err := s.db.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list newsletter subscriptions: %w", err)
	}
	return items, nil
}

func (s *Service) RegisterEvent(userID string, req *RegisterEventRequest) (*EventRegistration, error) {
	user, err := s.getUser(userID)
	if err != nil {
		return nil, err
	}

	var existing EventRegistration
	query := s.db.Where("user_id = ? AND event_id = ?", user.ID, req.EventID)
	if err := query.First(&existing).Error; err == nil {
		updates := map[string]interface{}{
			"event_title": req.EventTitle,
			"event_date":  req.EventDate,
			"location":    req.Location,
			"notes":       req.Notes,
			"status":      "pending",
			"updated_at":  time.Now(),
		}
		if err := s.db.Model(&existing).Updates(updates).Error; err != nil {
			return nil, fmt.Errorf("failed to update event registration: %w", err)
		}
		if err := s.db.First(&existing, "id = ?", existing.ID).Error; err != nil {
			return nil, fmt.Errorf("failed to reload event registration: %w", err)
		}
		return &existing, nil
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to query event registration: %w", err)
	}

	item := &EventRegistration{
		UserID:     &user.ID,
		Email:      user.Email,
		FullName:   user.FullName,
		EventID:    req.EventID,
		EventTitle: req.EventTitle,
		EventDate:  req.EventDate,
		Location:   req.Location,
		Status:     "pending",
		Notes:      req.Notes,
	}
	if err := s.db.Create(item).Error; err != nil {
		return nil, fmt.Errorf("failed to create event registration: %w", err)
	}
	return item, nil
}

func (s *Service) ListEventRegistrations() ([]EventRegistration, error) {
	var items []EventRegistration
	if err := s.db.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list event registrations: %w", err)
	}
	return items, nil
}

func (s *Service) ListMyEventRegistrations(userID string) ([]EventRegistration, error) {
	var items []EventRegistration
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list event registrations: %w", err)
	}
	return items, nil
}

func (s *Service) SubmitBookingRequest(userID string, req *SubmitBookingRequestRequest) (*BookingRequest, error) {
	user, err := s.getUser(userID)
	if err != nil {
		return nil, err
	}

	source := strings.TrimSpace(req.Source)
	if source == "" {
		source = "admin-dashboard"
	}

	item := &BookingRequest{
		UserID:       user.ID,
		Email:        user.Email,
		FullName:     user.FullName,
		BookingType:  req.BookingType,
		BookingTitle: req.BookingTitle,
		Status:       "pending",
		Source:       source,
		Note:         req.Note,
	}

	if err := s.db.Create(item).Error; err != nil {
		return nil, fmt.Errorf("failed to create booking request: %w", err)
	}
	return item, nil
}

func (s *Service) ListMyBookingRequests(userID string) ([]BookingRequest, error) {
	var items []BookingRequest
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list booking requests: %w", err)
	}
	return items, nil
}

func (s *Service) ListBookingRequests() ([]BookingRequest, error) {
	var items []BookingRequest
	if err := s.db.Order("created_at DESC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list booking requests: %w", err)
	}
	return items, nil
}

func (s *Service) SubmitUpgradeRequest(userID string, req *SubmitUpgradeRequestRequest) (*UpgradeRequest, error) {
	user, err := s.getUser(userID)
	if err != nil {
		return nil, err
	}

	var existing UpgradeRequest
	if err := s.db.Where("user_id = ? AND status = ?", user.ID, "pending").Order("created_at DESC").First(&existing).Error; err == nil {
		return &existing, fmt.Errorf("upgrade request is already pending")
	} else if err != nil && err != gorm.ErrRecordNotFound {
		return nil, fmt.Errorf("failed to query upgrade requests: %w", err)
	}

	requestedRole := "premium"

	queueNumber, err := s.nextQueueNumber()
	if err != nil {
		return nil, err
	}

	cardNumber := fmt.Sprintf("VIFC-%04d", queueNumber)

	item := &UpgradeRequest{
		UserID:        user.ID,
		Email:         user.Email,
		FullName:      user.FullName,
		Company:       req.Company,
		Title:         user.Title,
		Country:       req.Country,
		Note:          req.Note,
		Status:        "pending",
		RequestedRole: requestedRole,
		QueueNumber:   queueNumber,
		CardNumber:    cardNumber,
	}

	if err := s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(item).Error; err != nil {
			return err
		}

		cardRole := s.getUserRole(user.ID)
		userCard := &UserCard{
			ID:        uuid.New(),
			UserID:    user.ID,
			Username:  user.Email,
			SoThe:     cardNumber,
			LoaiThe:   cardRole,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		if err := tx.Create(userCard).Error; err != nil {
			return err
		}

		return tx.Exec("UPDATE users SET is_joined_waitlist = TRUE WHERE id = ?", user.ID).Error
	}); err != nil {
		return nil, fmt.Errorf("failed to create upgrade request: %w", err)
	}

	return item, nil
}

func (s *Service) GetLatestUpgradeRequest(userID string) (*UpgradeRequest, error) {
	var item UpgradeRequest
	if err := s.db.Where("user_id = ?", userID).Order("created_at DESC").First(&item).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to fetch upgrade request: %w", err)
	}
	return &item, nil
}

func (s *Service) ListUpgradeRequests() ([]UpgradeRequest, error) {
	var items []UpgradeRequest
	if err := s.db.Order("queue_number ASC").Order("created_at ASC").Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to list upgrade requests: %w", err)
	}
	return items, nil
}

func (s *Service) ReviewUpgradeRequest(requestID, reviewerID string, req *ReviewUpgradeRequestRequest) (*UpgradeRequest, error) {
	var item UpgradeRequest
	if err := s.db.Where("id = ?", requestID).First(&item).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("upgrade request not found")
		}
		return nil, fmt.Errorf("failed to fetch upgrade request: %w", err)
	}

	now := time.Now()
	updates := map[string]interface{}{
		"status":      req.Status,
		"review_note": req.Note,
		"reviewed_at": now,
		"updated_at":  now,
	}

	if reviewerID != "" {
		if rid, err := uuid.Parse(reviewerID); err == nil {
			updates["reviewed_by"] = rid
		}
	}

	if req.Status == "approved" {
		roleName := req.RoleName
		if roleName == "" {
			roleName = item.RequestedRole
		}
		if roleName == "" {
			roleName = "premium"
		}
		updates["requested_role"] = roleName
		if item.CardNumber == "" {
			updates["card_number"] = fmt.Sprintf("VIFC-%04d", item.QueueNumber)
		}
		if err := s.assignRoleToUser(item.UserID, roleName); err != nil {
			return nil, err
		}
	}

	if err := s.db.Model(&item).Updates(updates).Error; err != nil {
		return nil, fmt.Errorf("failed to review upgrade request: %w", err)
	}
	if err := s.db.Where("id = ?", item.ID).First(&item).Error; err != nil {
		return nil, fmt.Errorf("failed to reload upgrade request: %w", err)
	}
	return &item, nil
}

func (s *Service) getUser(userID string) (*userRecord, error) {
	var user userRecord
	if err := s.db.Table("users").Where("id = ?", userID).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to load user: %w", err)
	}
	return &user, nil
}

func (s *Service) nextQueueNumber() (int, error) {
	var next int
	if err := s.db.Model(&UpgradeRequest{}).Select("COALESCE(MAX(queue_number), 0) + 1").Scan(&next).Error; err != nil {
		return 0, fmt.Errorf("failed to generate queue number: %w", err)
	}
	if next <= 0 {
		next = 1
	}
	return next, nil
}

func (s *Service) assignRoleToUser(userID uuid.UUID, roleName string) error {
	if err := s.db.Exec(`
		INSERT INTO roles (id, name, description, created_at)
		VALUES (gen_random_uuid(), ?, ?, NOW())
		ON CONFLICT (name) DO NOTHING
	`, roleName, "Assigned from upgrade request").Error; err != nil {
		return fmt.Errorf("failed to ensure role exists: %w", err)
	}

	var roleID uuid.UUID
	if err := s.db.Raw("SELECT id FROM roles WHERE name = ?", roleName).Scan(&roleID).Error; err != nil {
		return fmt.Errorf("failed to fetch role id: %w", err)
	}
	if roleID == uuid.Nil {
		return fmt.Errorf("role %s not found", roleName)
	}

	if err := s.db.Exec(`
		INSERT INTO user_roles (user_id, role_id, created_at)
		VALUES (?, ?, NOW())
		ON CONFLICT DO NOTHING
	`, userID, roleID).Error; err != nil {
		return fmt.Errorf("failed to assign role to user: %w", err)
	}

	return nil
}

func (s *Service) getUserRole(userID uuid.UUID) string {
	var roles []string
	s.db.Raw(`
		SELECT r.name FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ?
	`, userID).Scan(&roles)

	// Check active subscription plans
	var planNames []string
	s.db.Table("user_subscriptions").
		Joins("JOIN subscription_plans ON subscription_plans.id = user_subscriptions.subscription_plan_id").
		Where("user_subscriptions.user_id = ? AND user_subscriptions.status = 'active' AND user_subscriptions.end_date > NOW()", userID).
		Pluck("subscription_plans.name", &planNames)

	for _, name := range planNames {
		if name == "Monthly Basic" {
			roles = append(roles, "base")
		} else if name == "Quarterly Pro" {
			roles = append(roles, "standard")
		} else if name == "Annual Premium" {
			roles = append(roles, "premium")
		}
	}

	hasRole := func(name string) bool {
		for _, r := range roles {
			if r == name {
				return true
			}
		}
		return false
	}

	if hasRole("admin") {
		return "admin"
	}
	if hasRole("premium") {
		return "premium"
	}
	if hasRole("standard") {
		return "standard"
	}
	if hasRole("base") {
		return "base"
	}
	return "user"
}

