package database

import (
	"fmt"
	"log"
	"time"

	"github.com/baole/quotation/internal/config"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global GORM database instance.
var DB *gorm.DB

// Connect initialises the PostgreSQL connection and runs auto-migration.
func Connect(cfg *config.Config) (*gorm.DB, error) {
	logLevel := logger.Silent
	if cfg.App.IsDevelopment() {
		logLevel = logger.Info
	}

	gormCfg := &gorm.Config{
		Logger:                                   logger.Default.LogMode(logLevel),
		DisableForeignKeyConstraintWhenMigrating: false,
		PrepareStmt:                              false,
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  cfg.Database.DSN(),
		PreferSimpleProtocol: true,
	}), gormCfg)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	DB = db
	log.Println("✅ Database connected successfully")

	return db, nil
}

// AutoMigrate runs GORM auto-migration for all registered models.
// NOTE: For production, use SQL migration files instead.
func AutoMigrate(db *gorm.DB, models ...interface{}) error {
	// Ensure avatar_url and other profile fields exist on users table
	if err := db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT").Error; err != nil {
		log.Printf("⚠️ Failed to add avatar_url column: %v\n", err)
	}
	if err := db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255)").Error; err != nil {
		log.Printf("⚠️ Failed to add company column: %v\n", err)
	}
	if err := db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255)").Error; err != nil {
		log.Printf("⚠️ Failed to add title column: %v\n", err)
	}
	if err := db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100)").Error; err != nil {
		log.Printf("⚠️ Failed to add country column: %v\n", err)
	}
	if err := db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_joined_waitlist BOOLEAN NOT NULL DEFAULT FALSE").Error; err != nil {
		log.Printf("⚠️ Failed to add is_joined_waitlist column: %v\n", err)
	}

	// Ensure engagement tables exist for local environments that were initialized
	// before these models were added.
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID,
			email VARCHAR(255) NOT NULL UNIQUE,
			full_name VARCHAR(255),
			source VARCHAR(100) DEFAULT 'dashboard',
			status VARCHAR(50) DEFAULT 'subscribed',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`).Error; err != nil {
		log.Printf("⚠️ Failed to ensure newsletter_subscriptions table: %v\n", err)
	}
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS event_registrations (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID,
			email VARCHAR(255) NOT NULL,
			full_name VARCHAR(255),
			event_id VARCHAR(100),
			event_title VARCHAR(255) NOT NULL,
			event_date VARCHAR(100),
			location VARCHAR(255),
			status VARCHAR(50) DEFAULT 'pending',
			notes TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`).Error; err != nil {
		log.Printf("⚠️ Failed to ensure event_registrations table: %v\n", err)
	}
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS booking_requests (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL,
			email VARCHAR(255) NOT NULL,
			full_name VARCHAR(255),
			booking_type VARCHAR(100) NOT NULL,
			booking_title VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'pending',
			source VARCHAR(100) DEFAULT 'admin-dashboard',
			note TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`).Error; err != nil {
		log.Printf("⚠️ Failed to ensure booking_requests table: %v\n", err)
	}
	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS upgrade_requests (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id UUID NOT NULL,
			email VARCHAR(255) NOT NULL,
			full_name VARCHAR(255),
			company VARCHAR(255),
			title VARCHAR(255),
			country VARCHAR(100),
			note TEXT,
			status VARCHAR(50) DEFAULT 'pending',
			requested_role VARCHAR(100) DEFAULT 'premium',
			queue_number INTEGER NOT NULL UNIQUE,
			card_number VARCHAR(100),
			review_note TEXT,
			reviewed_at TIMESTAMPTZ,
			reviewed_by UUID,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)
	`).Error; err != nil {
		log.Printf("⚠️ Failed to ensure upgrade_requests table: %v\n", err)
	}

	if err := db.Exec(`
		CREATE TABLE IF NOT EXISTS user_cards (
			id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id     UUID NOT NULL,
			username    VARCHAR(255) NOT NULL,
			so_the      VARCHAR(100) NOT NULL,
			loai_the    VARCHAR(100) NOT NULL,
			created_at  TIMESTAMPTZ DEFAULT NOW(),
			updated_at  TIMESTAMPTZ DEFAULT NOW()
		)
	`).Error; err != nil {
		log.Printf("⚠️ Failed to ensure user_cards table: %v\n", err)
	}

	if err := db.Exec("ALTER TABLE user_cards ADD COLUMN IF NOT EXISTS user_id UUID").Error; err != nil {
		log.Printf("⚠️ Failed to add user_id column to user_cards: %v\n", err)
	}

	if err := db.AutoMigrate(models...); err != nil {
		return fmt.Errorf("auto migration failed: %w", err)
	}
	log.Println("✅ Database migration completed")
	return nil
}

// GetDB returns the global database instance.
func GetDB() *gorm.DB {
	return DB
}

// SeedSubscriptionPlans ensures that the subscription plans table contains the correct prices.
func SeedSubscriptionPlans(db *gorm.DB) error {
	plans := []struct {
		Name         string
		Price        float64
		DurationDays int
		Description  string
	}{
		{"Monthly Basic", 1.00, 30, "Basic access for 30 days"},
		{"Quarterly Pro", 500.00, 90, "Pro access for 90 days"},
		{"Annual Premium", 2500.00, 365, "Premium access for 1 year"},
	}

	for _, p := range plans {
		var count int64
		// If the table doesn't exist yet, GORM count might fail. Check count safety.
		if err := db.Table("subscription_plans").Where("name = ?", p.Name).Count(&count).Error; err != nil {
			// Skip seeding if table doesn't exist
			return nil
		}
		if count > 0 {
			// Update existing plan
			if err := db.Table("subscription_plans").
				Where("name = ?", p.Name).
				Updates(map[string]interface{}{
					"price":         p.Price,
					"duration_days": p.DurationDays,
					"description":   p.Description,
				}).Error; err != nil {
				return fmt.Errorf("failed to update plan %s: %w", p.Name, err)
			}
		} else {
			// Insert new plan
			if err := db.Exec(`
				INSERT INTO subscription_plans (name, price, duration_days, description)
				VALUES (?, ?, ?, ?)
			`, p.Name, p.Price, p.DurationDays, p.Description).Error; err != nil {
				return fmt.Errorf("failed to insert plan %s: %w", p.Name, err)
			}
		}
	}
	log.Println("✅ Subscription plans successfully seeded")
	return nil
}
