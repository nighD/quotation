package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type SubscriptionPlan struct {
	ID           string `gorm:"type:uuid"`
	Name         string
	Price        float64
	DurationDays int
	Description  string
	IsActive     bool
}

type UserSubscription struct {
	ID                 string `gorm:"type:uuid"`
	UserID             string `gorm:"type:uuid"`
	SubscriptionPlanID string `gorm:"type:uuid"`
	Plan               SubscriptionPlan `gorm:"foreignKey:SubscriptionPlanID"`
	StartDate          time.Time
	EndDate            time.Time
	Status             string
}

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	dsn := os.Getenv("POSTGRES_URL")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	userID := "ab776387-c41c-4732-af6d-139038a9593b" // Bảo Lê

	var sub UserSubscription
	err = db.Preload("Plan").
		Where("user_id = ? AND status = ? AND end_date > ?", userID, "active", time.Now()).
		Order("end_date DESC").
		First(&sub).Error

	if err != nil {
		fmt.Printf("GetMySubscription logic result: ERROR: %v (Meaning: User is considered FREE)\n", err)
	} else {
		fmt.Printf("GetMySubscription logic result: SUCCESS! Found subscription ID: %s, Status: %s, End: %v (Meaning: User is considered PREMIUM)\n", sub.ID, sub.Status, sub.EndDate)
	}
}
