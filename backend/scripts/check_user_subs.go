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

type User struct {
	ID       string
	Email    string
	FullName string
}

type UserSubscription struct {
	ID                 string
	UserID             string
	SubscriptionPlanID string
	StartDate          time.Time
	EndDate            time.Time
	Status             string
	CreatedAt          time.Time
}

type SubscriptionPlan struct {
	ID   string
	Name string
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

	var users []User
	db.Table("users").Find(&users)

	fmt.Println("=== Subscriptions History in Database ===")
	for _, u := range users {
		var subs []UserSubscription
		db.Table("user_subscriptions").Where("user_id = ?", u.ID).Order("created_at DESC").Find(&subs)

		fmt.Printf("User: %s (%s) [ID: %s]\n", u.FullName, u.Email, u.ID)
		if len(subs) == 0 {
			fmt.Println("  (No subscriptions)")
		}
		for _, s := range subs {
			var plan SubscriptionPlan
			db.Table("subscription_plans").Where("id = ?", s.SubscriptionPlanID).First(&plan)
			fmt.Printf("  - SubID: %s | Plan: %s | Status: %s | Start: %s | End: %s | Created: %s\n",
				s.ID, plan.Name, s.Status, 
				s.StartDate.Format("2006-01-02 15:04:05"), 
				s.EndDate.Format("2006-01-02 15:04:05"),
				s.CreatedAt.Format("2006-01-02 15:04:05"))
		}
		fmt.Println()
	}
}
