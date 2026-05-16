package cms

import (
	"fmt"

	"github.com/gosimple/slug"
	"github.com/google/uuid"
)

// Service handles CMS business logic.
type Service struct {
	repo *Repository
}

func NewService(repo *Repository) *Service {
	return &Service{repo: repo}
}

// ─── Article operations ──────────────────────────────────────

func (s *Service) CreateArticle(req *CreateArticleRequest, createdBy string) (*ArticleResponse, error) {
	catID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		return nil, fmt.Errorf("invalid category_id")
	}

	creatorID, _ := uuid.Parse(createdBy)

	generatedSlug := s.uniqueSlug(req.Title)

	status := req.Status
	if status == "" {
		status = "draft"
	}

	article := &Article{
		Title:      req.Title,
		Slug:       generatedSlug,
		Content:    req.Content,
		Status:     status,
		CategoryID: catID,
		CreatedBy:  creatorID,
	}

	if err := s.repo.CreateArticle(article); err != nil {
		return nil, fmt.Errorf("failed to create article: %w", err)
	}

	return toArticleResponse(article), nil
}

func (s *Service) ListArticles(page, pageSize int, status string) ([]*ArticleResponse, int64, error) {
	offset := (page - 1) * pageSize
	articles, total, err := s.repo.FindAllArticles(offset, pageSize, status)
	if err != nil {
		return nil, 0, err
	}

	var result []*ArticleResponse
	for i := range articles {
		result = append(result, toArticleResponse(&articles[i]))
	}

	return result, total, nil
}

func (s *Service) GetArticle(id string, userID string, roles []string) (*ArticleResponse, error) {
	article, err := s.repo.FindArticleByID(id)
	if err != nil {
		return nil, err
	}
	
	res := toArticleResponse(article)

	// Check if user has full access
	hasAccess := false
	for _, r := range roles {
		if r == "admin" || r == "editor" {
			hasAccess = true
			break
		}
	}

	if !hasAccess && userID != "" {
		hasAccess = s.repo.HasActiveSubscription(userID)
	}

	// Apply truncation if user doesn't have access
	if !hasAccess {
		res.IsPreview = true
		if len(res.Content) > 300 {
			res.Content = res.Content[:300] + "..."
		}
	}

	return res, nil
}

func (s *Service) UpdateArticle(id string, req *UpdateArticleRequest) (*ArticleResponse, error) {
	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
		updates["slug"] = s.uniqueSlug(req.Title)
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.Status != "" {
		updates["status"] = req.Status
	}
	if req.CategoryID != "" {
		catID, err := uuid.Parse(req.CategoryID)
		if err != nil {
			return nil, fmt.Errorf("invalid category_id")
		}
		updates["category_id"] = catID
	}

	article, err := s.repo.UpdateArticle(id, updates)
	if err != nil {
		return nil, err
	}

	return toArticleResponse(article), nil
}

func (s *Service) DeleteArticle(id string) error {
	return s.repo.DeleteArticle(id)
}

// ─── Category operations ─────────────────────────────────────

func (s *Service) CreateCategory(req *CreateCategoryRequest) (*CategoryResponse, error) {
	cat := &Category{Name: req.Name}
	if err := s.repo.CreateCategory(cat); err != nil {
		return nil, fmt.Errorf("failed to create category (may already exist)")
	}
	return toCategoryResponse(cat), nil
}

func (s *Service) ListCategories() ([]*CategoryResponse, error) {
	cats, err := s.repo.FindAllCategories()
	if err != nil {
		return nil, err
	}

	var result []*CategoryResponse
	for i := range cats {
		result = append(result, toCategoryResponse(&cats[i]))
	}

	return result, nil
}

// ─── Helpers ──────────────────────────────────────────────────

// uniqueSlug generates a URL-safe slug and ensures uniqueness by appending a suffix.
func (s *Service) uniqueSlug(title string) string {
	base := slug.Make(title)
	if !s.repo.SlugExists(base) {
		return base
	}
	for i := 1; ; i++ {
		candidate := fmt.Sprintf("%s-%d", base, i)
		if !s.repo.SlugExists(candidate) {
			return candidate
		}
	}
}
