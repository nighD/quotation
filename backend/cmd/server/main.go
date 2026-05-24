package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/baole/quotation/internal/config"
	"github.com/baole/quotation/internal/database"
	"github.com/baole/quotation/internal/middleware"
	"github.com/baole/quotation/internal/modules/analytics"
	"github.com/baole/quotation/internal/modules/auth"
	"github.com/baole/quotation/internal/modules/cms"
	"github.com/baole/quotation/internal/modules/payments"
	"github.com/baole/quotation/internal/modules/rbac"
	"github.com/baole/quotation/internal/modules/subscriptions"
	"github.com/baole/quotation/internal/modules/users"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"go.uber.org/zap"

	// _ "github.com/baole/quotation/docs" // Swagger docs (generated via swag init)
)

// @title           Quotation API
// @version         1.0
// @description     Production-ready Go backend API
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@quotation.dev

// @license.name Apache 2.0
// @license.url  http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.
func main() {
	// ── Load configuration ────────────────────────────────────
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// ── Logger ────────────────────────────────────────────────
	var logger *zap.Logger
	if cfg.App.IsDevelopment() {
		logger, _ = zap.NewDevelopment()
	} else {
		logger, _ = zap.NewProduction()
	}
	defer logger.Sync()

	logger.Info("Starting server", zap.String("env", cfg.App.Env), zap.String("port", cfg.App.Port))

	// ── Database ──────────────────────────────────────────────
	db, err := database.Connect(cfg)
	if err != nil {
		logger.Fatal("Database connection failed", zap.Error(err))
	}

	// ── Database Auto-Migration ───────────────────────────────
	if err := database.AutoMigrate(db, &users.User{}, &cms.Article{}, &cms.Category{}); err != nil {
		logger.Warn("Database auto-migration failed", zap.Error(err))
	}

	// ── Fiber app ─────────────────────────────────────────────
	app := fiber.New(fiber.Config{
		AppName:               cfg.App.Name,
		ReadTimeout:           30e9, // 30s
		WriteTimeout:          30e9,
		IdleTimeout:           120e9,
		BodyLimit:             int(cfg.Storage.MaxFileSizeMB+1) * 1024 * 1024,
		DisableStartupMessage: !cfg.App.IsDevelopment(),
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// ── Global middleware ─────────────────────────────────────
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(middleware.Logger(logger))
	app.Use(compress.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-Request-ID",
	}))
	app.Use(middleware.RateLimit(cfg.RateLimit.Max, cfg.RateLimit.ExpiryMinutes))

	// ── Health check ──────────────────────────────────────────
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": cfg.App.Name,
			"version": "1.0.0",
		})
	})

	// ── Static file serving ───────────────────────────────────
	app.Static("/storage", cfg.Storage.Path)

	// ── Swagger ───────────────────────────────────────────────
	// app.Get("/swagger/*", swagger.HandlerDefault)

	// ── Wire up modules ───────────────────────────────────────
	jwtSecret := cfg.JWT.Secret

	// Auth
	authSvc := auth.NewService(db, cfg)
	authHandler := auth.NewHandler(authSvc)
	auth.RegisterRoutes(app, authHandler, jwtSecret)

	// Users
	userRepo := users.NewRepository(db)
	userSvc := users.NewService(userRepo)
	userHandler := users.NewHandler(userSvc)
	users.RegisterRoutes(app, userHandler, jwtSecret)

	// CMS
	cmsRepo := cms.NewRepository(db)
	cmsSvc := cms.NewService(cmsRepo)
	cmsHandler := cms.NewHandler(cmsSvc, cfg.AWS)
	cms.RegisterRoutes(app, cmsHandler, jwtSecret)

	// Subscriptions
	subRepo := subscriptions.NewRepository(db)
	subSvc := subscriptions.NewService(subRepo)
	subHandler := subscriptions.NewHandler(subSvc)
	subscriptions.RegisterRoutes(app, subHandler, jwtSecret)

	// Payments
	payRepo := payments.NewRepository(db)
	paySvc := payments.NewService(payRepo, subRepo, cfg)
	payHandler := payments.NewHandler(paySvc)
	payments.RegisterRoutes(app, payHandler, jwtSecret)

	// RBAC
	rbacRepo := rbac.NewRepository(db)
	rbacSvc := rbac.NewService(rbacRepo)
	rbacHandler := rbac.NewHandler(rbacSvc)
	rbac.RegisterRoutes(app, rbacHandler, jwtSecret)

	// Analytics
	analyticsSvc := analytics.NewService(db)
	analyticsHandler := analytics.NewHandler(analyticsSvc)
	analytics.RegisterRoutes(app, analyticsHandler, jwtSecret)

	// ── 404 handler ───────────────────────────────────────────
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": fmt.Sprintf("Route %s %s not found", c.Method(), c.Path()),
		})
	})

	// ── Start server ──────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	go func() {
		addr := ":" + cfg.App.Port
		logger.Info("Server listening", zap.String("addr", addr))
		if err := app.Listen(addr); err != nil {
			logger.Fatal("Server error", zap.Error(err))
		}
	}()

	<-quit
	logger.Info("Shutting down server gracefully...")
	if err := app.Shutdown(); err != nil {
		logger.Error("Server shutdown error", zap.Error(err))
	}
	logger.Info("Server stopped")
}
