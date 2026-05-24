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
		log.Fatal("POSTGRES_URL is not set in environment")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlBytes, err := os.ReadFile("migrations/004_update_articles_schema.sql")
	if err != nil {
		log.Fatalf("Failed to read migration SQL file: %v", err)
	}

	fmt.Println("Running database migration...")
	if err := db.Exec(string(sqlBytes)).Error; err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	fmt.Println("✅ Articles table migration successfully executed on Supabase!")
}
