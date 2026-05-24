package cms

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	appconfig "github.com/baole/quotation/internal/config"
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/internal/utils"
	"github.com/baole/quotation/pkg/response"
	"github.com/baole/quotation/pkg/validator"
	"github.com/gofiber/fiber/v2"
)

// Handler handles HTTP requests for the CMS module.
type Handler struct {
	service  *Service
	s3Client *s3.Client
	bucket   string
}

func NewHandler(service *Service, awsCfg appconfig.AWSConfig) *Handler {
	var s3Client *s3.Client
	var err error
	var sdkCfg aws.Config

	bucket := awsCfg.BucketName
	if bucket == "" {
		bucket = "vifc" // default fallback
	}

	if awsCfg.AccessKeyID != "" && awsCfg.SecretAccessKey != "" {
		sdkCfg, err = awsconfig.LoadDefaultConfig(context.TODO(),
			awsconfig.WithRegion(awsCfg.Region),
			awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
				awsCfg.AccessKeyID,
				awsCfg.SecretAccessKey,
				"",
			)),
		)
	} else {
		sdkCfg, err = awsconfig.LoadDefaultConfig(context.TODO())
	}

	if err != nil {
		log.Printf("Warning: Failed to load default AWS config: %v", err)
	} else {
		s3Client = s3.NewFromConfig(sdkCfg)
	}

	return &Handler{
		service:  service,
		s3Client: s3Client,
		bucket:   bucket,
	}
}

// ─── Articles ─────────────────────────────────────────────────

func (h *Handler) CreateArticle(c *fiber.Ctx) error {
	var req CreateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	userID := middleware.GetUserID(c)
	article, err := h.service.CreateArticle(&req, userID)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.Created(c, article, "Article created successfully")
}

func (h *Handler) ListArticles(c *fiber.Ctx) error {
	pg := utils.ParsePagination(c)
	status := c.Query("status", "")
	tag := c.Query("tag", "")

	articles, total, err := h.service.ListArticles(pg.Page, pg.PageSize, status, tag)
	if err != nil {
		return response.InternalError(c, "Failed to fetch articles")
	}

	return response.OKWithMeta(c, articles, "", response.NewMeta(pg.Page, pg.PageSize, total))
}

func (h *Handler) GetArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	userID := middleware.GetUserID(c)
	roles := middleware.GetRoles(c)

	article, err := h.service.GetArticle(id, userID, roles)
	if err != nil {
		return response.NotFound(c, "Article not found")
	}
	return response.OK(c, article, "")
}

func (h *Handler) UpdateArticle(c *fiber.Ctx) error {
	id := c.Params("id")

	var req UpdateArticleRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	article, err := h.service.UpdateArticle(id, &req)
	if err != nil {
		return response.NotFound(c, err.Error())
	}

	return response.OK(c, article, "Article updated successfully")
}

func (h *Handler) DeleteArticle(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.service.DeleteArticle(id); err != nil {
		return response.NotFound(c, err.Error())
	}
	return response.OK(c, nil, "Article deleted successfully")
}

// ─── Categories ───────────────────────────────────────────────

func (h *Handler) CreateCategory(c *fiber.Ctx) error {
	var req CreateCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Invalid request body", nil)
	}
	if errs := validator.Validate(&req); validator.HasErrors(errs) {
		return response.BadRequest(c, "Validation failed", errs)
	}

	cat, err := h.service.CreateCategory(&req)
	if err != nil {
		return response.Conflict(c, err.Error())
	}

	return response.Created(c, cat, "Category created successfully")
}

func (h *Handler) ListCategories(c *fiber.Ctx) error {
	cats, err := h.service.ListCategories()
	if err != nil {
		return response.InternalError(c, "Failed to fetch categories")
	}
	return response.OK(c, cats, "")
}

var roleLevels = map[string]int{
	"free":     0,
	"base":     1,
	"standard": 2,
	"premium":  3,
	"admin":    4,
}

func checkRoleAccess(userRoles []string, requiredRole string) bool {
	reqLevel := roleLevels[requiredRole]
	maxUserLevel := 0
	for _, r := range userRoles {
		if lvl, ok := roleLevels[r]; ok && lvl > maxUserLevel {
			maxUserLevel = lvl
		}
	}
	return maxUserLevel >= reqLevel
}

func getPDFActiveRoleAndKey(blocksJSON string) (string, string) {
	if blocksJSON == "" {
		return "free", ""
	}
	var blocks []map[string]interface{}
	if err := json.Unmarshal([]byte(blocksJSON), &blocks); err != nil {
		return "free", ""
	}
	for _, b := range blocks {
		if t, ok := b["type"].(string); ok && t == "pdf" {
			activeRole, _ := b["activeRole"].(string)
			url, _ := b["url"].(string)
			if activeRole == "" {
				activeRole = "free"
			}
			return activeRole, url
		}
	}
	return "free", ""
}

func extractS3Key(s3URL string) string {
	if s3URL == "" {
		return ""
	}
	if idx := strings.Index(s3URL, ".amazonaws.com/"); idx != -1 {
		return s3URL[idx+len(".amazonaws.com/"):]
	}
	if strings.HasPrefix(s3URL, "/") {
		return s3URL[1:]
	}
	return s3URL
}

func (h *Handler) StreamReportPDF(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	roles := middleware.GetRoles(c)

	id := c.Params("id")

	// Fetch article first (custom string primary key or slug)
	article, err := h.service.repo.FindArticleByID(id)
	if err != nil || article == nil {
		return response.NotFound(c, "Article not found")
	}

	// Parse required role and pdf key from blocks JSON
	requiredRole, pdfURL := getPDFActiveRoleAndKey(article.Blocks)
	pdfKey := extractS3Key(pdfURL)

	if pdfKey == "" {
		pdfKey = article.PDFKey
	}

	// Fallback/Mock key logic for testing (using a real key that exists in S3)
	if pdfKey == "" {
		pdfKey = "pdfs/1779564822544-WealthandAssetManagementOutlook-September2024.pdf"
	}

	// Check access
	allowed := false
	for _, r := range roles {
		if r == "admin" || r == "editor" {
			allowed = true
			break
		}
	}

	if !allowed {
		allowed = checkRoleAccess(roles, requiredRole)
	}

	// Fallback to active subscription check in database (prevents JWT session staleness issues)
	if !allowed && userID != "" {
		var activePlans []string
		h.service.repo.db.Table("user_subscriptions").
			Joins("JOIN subscription_plans ON subscription_plans.id = user_subscriptions.subscription_plan_id").
			Where("user_subscriptions.user_id = ? AND user_subscriptions.status = 'active' AND user_subscriptions.end_date > NOW()", userID).
			Pluck("subscription_plans.name", &activePlans)
		
		var dbRoles []string
		for _, planName := range activePlans {
			if planName == "Monthly Basic" {
				dbRoles = append(dbRoles, "base")
			} else if planName == "Quarterly Pro" {
				dbRoles = append(dbRoles, "standard")
			} else if planName == "Annual Premium" {
				dbRoles = append(dbRoles, "premium")
			}
		}
		
		var userDbRoles []string
		h.service.repo.db.Raw(`
			SELECT r.name FROM roles r
			INNER JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = ?
		`, userID).Scan(&userDbRoles)
		
		allRoles := append(dbRoles, userDbRoles...)
		allowed = checkRoleAccess(allRoles, requiredRole)
	}

	if !allowed {
		return response.Forbidden(c, "You do not have permission to access this PDF report")
	}

	if h.s3Client == nil {
		return response.InternalError(c, "S3 Client not configured")
	}

	rangeHeader := c.Get("Range")

	input := &s3.GetObjectInput{
		Bucket: &h.bucket,
		Key:    &pdfKey,
	}

	if rangeHeader != "" {
		input.Range = &rangeHeader
	}

	resp, err := h.s3Client.GetObject(c.Context(), input)
	if err != nil {
		log.Printf("S3 error fetching key %s: %v", pdfKey, err)
		return response.InternalError(c, fmt.Sprintf("Error downloading file from S3: %v", err))
	}

	c.Set("Content-Type", "application/pdf")
	c.Set("Accept-Ranges", "bytes")
	c.Set("Content-Disposition", "inline")

	if resp.ContentRange != nil {
		c.Set("Content-Range", *resp.ContentRange)
		c.Status(fiber.StatusPartialContent) // 206
	} else {
		c.Status(fiber.StatusOK) // 200
	}

	if resp.ContentLength != nil {
		c.Set("Content-Length", fmt.Sprintf("%d", *resp.ContentLength))
		c.Response().SetBodyStream(resp.Body, int(*resp.ContentLength))
	} else {
		c.Response().SetBodyStream(resp.Body, -1)
	}

	return nil
}

// GetArticleSEOHTML serves pre-rendered HTML for search engines and social crawler bots.
func (h *Handler) GetArticleSEOHTML(c *fiber.Ctx) error {
	id := c.Params("id")

	// Fetch article (supports UUID ID or Slug)
	article, err := h.service.repo.FindArticleByID(id)
	if err != nil || article == nil {
		return response.NotFound(c, "Article not found")
	}

	title := article.SEOTitle
	if title == "" {
		title = article.Title
	}
	description := article.SEODescription
	if description == "" {
		description = article.Description
	}
	keywords := article.SEOKeywords
	image := article.Thumbnail

	// Generate static HTML for bots with Open Graph meta tags
	htmlContent := fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>%s</title>
    <meta name="description" content="%s">
    <meta name="keywords" content="%s">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="%s">
    <meta property="og:description" content="%s">
    <meta property="og:image" content="%s">
    <meta property="og:url" content="https://vifcpass.com/reports/detail/%s">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="%s">
    <meta name="twitter:description" content="%s">
    <meta name="twitter:image" content="%s">

    <!-- JavaScript fallback redirect for humans -->
    <script>
        window.location.href = "/reports/detail/%s";
    </script>
</head>
<body>
    <h1>%s</h1>
    <p>%s</p>
    <img src="%s" alt="%s">
</body>
</html>`,
		title, description, keywords,
		title, description, image, article.Slug,
		title, description, image,
		article.Slug,
		article.Title, description, image, article.Title,
	)

	c.Type("html")
	return c.SendString(htmlContent)
}
