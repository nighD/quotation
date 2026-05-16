package subscriptions

import (
	"fmt"
	"time"

	"github.com/google/uuid"
)

// Service handles subscription business logic.
type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListPlans() ([]*PlanResponse, error) {
	plans, err := s.repo.ListActivePlans()
	if err != nil {
		return nil, err
	}

	var result []*PlanResponse
	for i := range plans {
		r := toPlanResponse(&plans[i])
		result = append(result, &r)
	}
	return result, nil
}

// Purchase creates a pending subscription and returns the payment data.
// The subscription is activated after payment is confirmed via webhook.
func (s *Service) Purchase(userID string, req *PurchaseRequest) (*UserSubscription, *SubscriptionPlan, error) {
	plan, err := s.repo.FindPlanByID(req.PlanID)
	if err != nil {
		return nil, nil, err
	}

	uid, err := uuid.Parse(userID)
	if err != nil {
		return nil, nil, fmt.Errorf("invalid user id")
	}

	sub := &UserSubscription{
		UserID:             uid,
		SubscriptionPlanID: plan.ID,
		Status:             "pending",
		StartDate:          time.Now(),
		EndDate:            time.Now().AddDate(0, 0, plan.DurationDays),
	}

	if err := s.repo.CreateSubscription(sub); err != nil {
		return nil, nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	sub.Plan = plan
	return sub, plan, nil
}

// GetMySubscription returns the active subscription for a user.
func (s *Service) GetMySubscription(userID string) (*SubscriptionResponse, error) {
	sub, err := s.repo.FindActiveSubscription(userID)
	if err != nil {
		return nil, err
	}
	return toSubResponse(sub), nil
}

// Activate activates a subscription after successful payment.
func (s *Service) Activate(subID uuid.UUID, durationDays int) error {
	now := time.Now()
	endDate := now.AddDate(0, 0, durationDays)
	return s.repo.ActivateSubscription(subID, now, endDate)
}
