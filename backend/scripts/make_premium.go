package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID       string `gorm:"column:id"`
	Email    string `gorm:"column:email"`
	FullName string `gorm:"column:full_name"`
}

type SubscriptionPlan struct {
	ID           string `gorm:"type:uuid;column:id"`
	Name         string `gorm:"column:name"`
	DurationDays int    `gorm:"column:duration_days"`
}

type UserSubscription struct {
	ID                 string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey;column:id"`
	UserID             string    `gorm:"type:uuid;column:user_id"`
	SubscriptionPlanID string    `gorm:"type:uuid;column:subscription_plan_id"`
	StartDate          time.Time `gorm:"column:start_date"`
	EndDate            time.Time `gorm:"column:end_date"`
	Status             string    `gorm:"column:status"`
	CreatedAt          time.Time `gorm:"column:created_at"`
	UpdatedAt          time.Time `gorm:"column:updated_at"`
}

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	dsn := os.Getenv("POSTGRES_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		sslmode := os.Getenv("DB_SSLMODE")
		timezone := os.Getenv("DB_TIMEZONE")
		if host == "" {
			log.Fatal("POSTGRES_URL or DB_HOST environment variable not set in .env")
		}
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
			host, port, user, password, dbname, sslmode, timezone)
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// 1. List users
	var users []User
	db.Table("users").Find(&users)
	fmt.Println("Available Users in Local DB:")
	for _, u := range users {
		fmt.Printf("- %s (%s) [ID: %s]\n", u.FullName, u.Email, u.ID)
	}
	fmt.Println("--------------------------------------------------")

	var email string
	if len(os.Args) > 1 {
		email = os.Args[1]
	} else {
		fmt.Print("Enter user email to grant PREMIUM access: ")
		reader := bufio.NewReader(os.Stdin)
		input, err := reader.ReadString('\n')
		if err != nil {
			log.Fatalf("Failed to read input: %v", err)
		}
		email = strings.TrimSpace(input)
	}

	if email == "" {
		log.Fatal("Email cannot be empty")
	}

	var targetUser User
	err = db.Table("users").Where("email = ?", email).First(&targetUser).Error
	if err != nil {
		log.Fatalf("User with email %q not found: %v", email, err)
	}

	// Find the Premium Plan
	var plan SubscriptionPlan
	err = db.Table("subscription_plans").Where("name LIKE ?", "%Premium%").First(&plan).Error
	if err != nil {
		log.Fatalf("Premium subscription plan not found: %v", err)
	}

	fmt.Printf("Activating plan %q (ID: %s) for user %s...\n", plan.Name, plan.ID, targetUser.Email)

	// Create or update subscription
	now := time.Now()
	endDate := now.AddDate(1, 0, 0) // 1 year

	sub := UserSubscription{
		ID:                 uuid.New().String(),
		UserID:             targetUser.ID,
		SubscriptionPlanID: plan.ID,
		StartDate:          now,
		EndDate:            endDate,
		Status:             "active",
		CreatedAt:          now,
		UpdatedAt:          now,
	}

	// Expire any existing active subscriptions first
	db.Table("user_subscriptions").
		Where("user_id = ? AND status = ?", targetUser.ID, "active").
		Update("status", "expired")

	// Insert the premium subscription
	err = db.Table("user_subscriptions").Create(&sub).Error
	if err != nil {
		log.Fatalf("Failed to create premium subscription: %v", err)
	}

	fmt.Printf("✅ Success! User %s is now a PREMIUM user until %v.\n", targetUser.Email, endDate.Format("2006-01-02"))
}
