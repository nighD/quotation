package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TempArticle struct {
	ID             string     `json:"id"`
	Title          string     `json:"title"`
	Slug           string     `json:"slug"`
	Description    string     `json:"description"`
	Thumbnail      string     `json:"thumbnail"`
	Layouts        string     `json:"layouts"`
	Content        string     `json:"content"`
	Blocks         string     `json:"blocks"`
	Status         string     `json:"status"`
	CategoryID     *uuid.UUID `json:"category_id"`
	CreatedBy      string     `json:"created_by"`
	PDFKey         string     `json:"pdf_key"`
	SEOTitle       string     `json:"seo_title"`
	SEODescription string     `json:"seo_description"`
	SEOKeywords    string     `json:"seo_keywords"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	// Determine DSN
	var dsn string
	if pgURL := os.Getenv("POSTGRES_URL"); pgURL != "" {
		dsn = pgURL
	} else {
		host := os.Getenv("DB_HOST")
		if host == "" {
			host = "localhost"
		}
		port := os.Getenv("DB_PORT")
		if port == "" {
			port = "5432"
		}
		user := os.Getenv("DB_USER")
		if user == "" {
			user = "postgres"
		}
		pass := os.Getenv("DB_PASSWORD")
		if pass == "" {
			pass = "postgres"
		}
		name := os.Getenv("DB_NAME")
		if name == "" {
			name = "quotation_db"
		}
		ssl := os.Getenv("DB_SSLMODE")
		if ssl == "" {
			ssl = "disable"
		}
		tz := os.Getenv("DB_TIMEZONE")
		if tz == "" {
			tz = "Asia/Ho_Chi_Minh"
		}
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s", host, port, user, pass, name, ssl, tz)
	}

	log.Printf("Connecting to database...")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	log.Printf("✅ Connected successfully")

	// Read JSON dump file
	dumpFile := "articles_dump.json"
	data, err := os.ReadFile(dumpFile)
	if err != nil {
		// Fallback to checking one directory up
		dumpFile = "../articles_dump.json"
		data, err = os.ReadFile(dumpFile)
		if err != nil {
			log.Fatalf("Failed to read articles dump file: %v", err)
		}
	}

	var tempArticles []TempArticle
	if err := json.Unmarshal(data, &tempArticles); err != nil {
		log.Fatalf("Failed to unmarshal JSON: %v", err)
	}

	log.Printf("Found %d articles to import.", len(tempArticles))

	for _, temp := range tempArticles {
		var createdBy interface{}
		if temp.CreatedBy != "" && temp.CreatedBy != "00000000-0000-0000-0000-000000000000" {
			if parsed, err := uuid.Parse(temp.CreatedBy); err == nil && parsed != uuid.Nil {
				createdBy = parsed
			} else {
				createdBy = nil
			}
		} else {
			createdBy = nil
		}

		// Ensure we don't have constraints conflict
		var count int64
		db.Table("articles").Where("id = ? OR slug = ?", temp.ID, temp.Slug).Count(&count)
		
		record := map[string]interface{}{
			"id":              temp.ID,
			"title":           temp.Title,
			"slug":            temp.Slug,
			"description":     temp.Description,
			"thumbnail":       temp.Thumbnail,
			"layouts":         temp.Layouts,
			"content":         temp.Content,
			"blocks":          temp.Blocks,
			"status":          temp.Status,
			"category_id":     temp.CategoryID,
			"created_by":      createdBy,
			"pdf_key":         temp.PDFKey,
			"seo_title":       temp.SEOTitle,
			"seo_description": temp.SEODescription,
			"seo_keywords":    temp.SEOKeywords,
			"created_at":      temp.CreatedAt,
			"updated_at":      temp.UpdatedAt,
		}

		if count > 0 {
			log.Printf("Updating existing article: %s", temp.Title)
			if err := db.Table("articles").Where("id = ?", temp.ID).Updates(record).Error; err != nil {
				log.Fatalf("Failed to update article %s: %v", temp.Title, err)
			}
		} else {
			log.Printf("Inserting new article: %s", temp.Title)
			if err := db.Table("articles").Create(record).Error; err != nil {
				log.Fatalf("Failed to insert article %s: %v", temp.Title, err)
			}
		}
	}

	log.Println("🎉 Database articles import completed successfully!")
}
