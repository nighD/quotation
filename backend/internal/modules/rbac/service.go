package rbac

import "fmt"

// Service handles RBAC business logic.
type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateRole(req *CreateRoleRequest) (*Role, error) {
	role := &Role{
		Name:        req.Name,
		Description: req.Description,
	}

	// Attach permissions if provided
	if len(req.Permissions) > 0 {
		perms, err := s.repo.FindPermissionsByKeys(req.Permissions)
		if err != nil {
			return nil, fmt.Errorf("failed to find permissions: %w", err)
		}
		role.Permissions = perms
	}

	if err := s.repo.CreateRole(role); err != nil {
		return nil, fmt.Errorf("failed to create role (may already exist): %w", err)
	}

	return role, nil
}

func (s *Service) ListRoles() ([]Role, error) {
	return s.repo.ListRoles()
}

func (s *Service) AssignRole(req *AssignRoleRequest) error {
	return s.repo.AssignRoleToUser(req.UserID, req.RoleID)
}

func (s *Service) RemoveRole(userID, roleID string) error {
	return s.repo.RemoveRoleFromUser(userID, roleID)
}

func (s *Service) ListPermissions() ([]Permission, error) {
	return s.repo.ListPermissions()
}
