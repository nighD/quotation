package cms

import (
	"context"
	"fmt"
	"log"

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

	articles, total, err := h.service.ListArticles(pg.Page, pg.PageSize, status)
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

func (h *Handler) StreamReportPDF(c *fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	roles := middleware.GetRoles(c)

	// Check if user is premium or admin from JWT claims
	hasAccess := false
	for _, r := range roles {
		if r == "admin" || r == "premium" {
			hasAccess = true
			break
		}
	}

	// Fallback to active subscription check in database (prevents JWT session staleness issues)
	if !hasAccess && userID != "" {
		hasAccess = h.service.repo.HasActiveSubscription(userID)
	}

	if !hasAccess {
		return response.Forbidden(c, "You do not have permission to perform this action")
	}

	id := c.Params("id")
	var pdfKey string

	// Fetch article by ID (custom string primary key)
	article, err := h.service.repo.FindArticleByID(id)
	if err == nil && article != nil {
		pdfKey = article.PDFKey
	}

	// Fallback/Mock key logic for testing (using a real key that exists in S3)
	if pdfKey == "" {
		pdfKey = "pdfs/1779564822544-WealthandAssetManagementOutlook-September2024.pdf"
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
