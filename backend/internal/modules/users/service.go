package users

import (
	"fmt"
)

// Service handles user business logic.
type Service struct {
	repo *Repository
}

// NewService creates a new user service.
func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) ListUsers(page, pageSize int) ([]*UserResponse, int64, error) {
	offset := (page - 1) * pageSize
	users, total, err := s.repo.FindAll(offset, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to list users: %w", err)
	}

	var result []*UserResponse
	for i := range users {
		result = append(result, toResponse(&users[i]))
	}

	return result, total, nil
}

func (s *Service) GetUser(id string) (*UserResponse, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return toResponse(user), nil
}

func (s *Service) UpdateUser(id string, req *UpdateUserRequest) (*UserResponse, error) {
	updates := map[string]interface{}{}
	if req.FullName != "" {
		updates["full_name"] = req.FullName
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}

	if len(updates) == 0 {
		return s.GetUser(id)
	}

	user, err := s.repo.Update(id, updates)
	if err != nil {
		return nil, err
	}

	return toResponse(user), nil
}

func (s *Service) DeleteUser(id string) error {
	return s.repo.Delete(id)
}
