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
