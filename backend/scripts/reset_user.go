package main

import (
	"bufio"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env
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

	// Define lightweight struct for querying user
	type User struct {
		ID       string `gorm:"column:id"`
		Email    string `gorm:"column:email"`
		FullName string `gorm:"column:full_name"`
	}

	// List all users in the DB
	var allUsers []User
	db.Table("users").Find(&allUsers)
	fmt.Println("All users in DB:")
	for _, u := range allUsers {
		var activeCount int64
		db.Table("user_subscriptions").Where("user_id = ? AND status = ?", u.ID, "active").Count(&activeCount)
		fmt.Printf("- Name: %s, Email: %s, ID: %s, Active Subs Count: %d\n", u.FullName, u.Email, u.ID, activeCount)
	}
	fmt.Println("--------------------------------------------------")

	var email string
	if len(os.Args) > 1 {
		email = os.Args[1]
	} else {
		fmt.Print("Enter user email to reset to Free: ")
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


	var user User
	err = db.Table("users").Where("email = ?", email).First(&user).Error
	if err != nil {
		log.Fatalf("User with email %q not found: %v", email, err)
	}

	fmt.Printf("Found user: %s (ID: %s)\n", user.FullName, user.ID)

	// Get and print all subscriptions of the user
	type Subscription struct {
		ID                 string    `gorm:"column:id"`
		UserID             string    `gorm:"column:user_id"`
		SubscriptionPlanID string    `gorm:"column:subscription_plan_id"`
		StartDate          time.Time `gorm:"column:start_date"`
		EndDate            time.Time `gorm:"column:end_date"`
		Status             string    `gorm:"column:status"`
	}

	var subs []Subscription
	db.Table("user_subscriptions").Where("user_id = ?", user.ID).Find(&subs)
	fmt.Println("Current subscriptions in DB:")
	for _, s := range subs {
		fmt.Printf("- ID: %s, Plan: %s, Status: %s, Start: %v, End: %v\n", s.ID, s.SubscriptionPlanID, s.Status, s.StartDate, s.EndDate)
	}

	// Set active user subscriptions to expired
	res := db.Table("user_subscriptions").
		Where("user_id = ?", user.ID).
		Updates(map[string]interface{}{
			"status":   "expired",
			"end_date": time.Now().Add(-1 * time.Second),
		})

	// Generate a bcrypt hash for 'password123' so they can login locally
	hash, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Failed to generate password hash: %v", err)
	}

	err = db.Table("users").Where("id = ?", user.ID).Update("password", string(hash)).Error
	if err != nil {
		log.Fatalf("Failed to update user password: %v", err)
	}

	fmt.Printf("Successfully expired %d active subscriptions.\n", res.RowsAffected)
	fmt.Printf("User %s is now reset to FREE plan.\n", email)
	fmt.Println("Password successfully set to 'password123' for local email/password login!")
}
