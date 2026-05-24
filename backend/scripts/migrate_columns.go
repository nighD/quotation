package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

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

	fmt.Println("Connecting to database for column migration...")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected. Adding company, title, and country columns to users table...")

	alterQueries := []string{
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS title VARCHAR(255);",
		"ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);",
	}

	for _, query := range alterQueries {
		if err := db.Exec(query).Error; err != nil {
			log.Fatalf("Failed to execute query %q: %v", query, err)
		}
	}

	fmt.Println("✅ Columns successfully migrated on Supabase!")
}
