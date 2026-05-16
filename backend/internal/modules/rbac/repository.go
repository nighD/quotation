package rbac

import (
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Repository handles RBAC database operations.
type Repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) CreateRole(role *Role) error {
	return r.db.Create(role).Error
}

func (r *Repository) ListRoles() ([]Role, error) {
	var roles []Role
	if err := r.db.Preload("Permissions").Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (r *Repository) FindRoleByID(id string) (*Role, error) {
	var role Role
	if err := r.db.Preload("Permissions").Where("id = ?", id).First(&role).Error; err != nil {
		return nil, fmt.Errorf("role not found")
	}
	return &role, nil
}

func (r *Repository) AssignRoleToUser(userID, roleID string) error {
	uid, err := uuid.Parse(userID)
	if err != nil {
		return fmt.Errorf("invalid user_id")
	}
	rid, err := uuid.Parse(roleID)
	if err != nil {
		return fmt.Errorf("invalid role_id")
	}

	userRole := UserRole{UserID: uid, RoleID: rid}
	// Use upsert to avoid duplicates
	return r.db.FirstOrCreate(&userRole, UserRole{UserID: uid, RoleID: rid}).Error
}

func (r *Repository) RemoveRoleFromUser(userID, roleID string) error {
	return r.db.Where("user_id = ? AND role_id = ?", userID, roleID).Delete(&UserRole{}).Error
}

func (r *Repository) ListPermissions() ([]Permission, error) {
	var perms []Permission
	if err := r.db.Find(&perms).Error; err != nil {
		return nil, err
	}
	return perms, nil
}

func (r *Repository) FindPermissionsByKeys(keys []string) ([]Permission, error) {
	var perms []Permission
	if err := r.db.Where("key IN ?", keys).Find(&perms).Error; err != nil {
		return nil, err
	}
	return perms, nil
}
