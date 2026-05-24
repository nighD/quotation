package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Article struct {
	ID             string  `json:"id"`
	Title          string  `json:"title"`
	Slug           string  `json:"slug"`
	Description    string  `json:"description"`
	Thumbnail      string  `json:"thumbnail"`
	Layouts        string  `json:"layouts"`
	Content        string  `json:"content"`
	Blocks         string  `json:"blocks"`
	Status         string  `json:"status"`
	CategoryID     *string `json:"category_id"`
	CreatedBy      string  `json:"created_by"`
	PDFKey         string  `json:"pdf_key,omitempty"`
	SEOTitle       string  `json:"seo_title"`
	SEODescription string  `json:"seo_description"`
	SEOKeywords    string  `json:"seo_keywords"`
	CreatedAt      string  `json:"created_at"`
	UpdatedAt      string  `json:"updated_at"`
}

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	dsn := os.Getenv("POSTGRES_URL")
	if dsn == "" {
		log.Fatal("POSTGRES_URL environment variable is not set")
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	var articles []Article
	if err := db.Table("articles").Order("created_at DESC").Find(&articles).Error; err != nil {
		log.Fatalf("Failed to query articles: %v", err)
	}

	outputFile := "articles_dump.json"
	
	// Print summary
	fmt.Printf("Successfully queried %d articles from database.\n", len(articles))

	// Marshal to JSON
	data, err := json.MarshalIndent(articles, "", "  ")
	if err != nil {
		log.Fatalf("Failed to marshal articles to JSON: %v", err)
	}

	// Save to file
	if err := os.WriteFile(outputFile, data, 0644); err != nil {
		log.Fatalf("Failed to write to file %s: %v", outputFile, err)
	}

	fmt.Printf("Saved articles data to: %s\n", outputFile)
}
