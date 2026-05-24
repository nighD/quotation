package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type SubscriptionPlan struct {
	ID           string
	Name         string
	Price        float64
	DurationDays int
	Description  string
	IsActive     bool
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

	var plans []SubscriptionPlan
	if err := db.Table("subscription_plans").Find(&plans).Error; err != nil {
		log.Fatalf("Failed to fetch plans: %v", err)
	}

	fmt.Println("=== Subscription Plans in DB ===")
	for _, p := range plans {
		fmt.Printf("ID: %s | Name: %q | Price: %.0f | Duration: %d days | IsActive: %v\n", 
			p.ID, p.Name, p.Price, p.DurationDays, p.IsActive)
	}
}
