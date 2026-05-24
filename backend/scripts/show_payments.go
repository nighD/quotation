package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type TableColumn struct {
	ColumnName string `gorm:"column:column_name"`
	DataType   string `gorm:"column:data_type"`
	IsNullable string `gorm:"column:is_nullable"`
}

type PaymentRecord struct {
	ID             string    `gorm:"column:id"`
	UserID         string    `gorm:"column:user_id"`
	Gateway        string    `gorm:"column:gateway"`
	Amount         float64   `gorm:"column:amount"`
	Currency       string    `gorm:"column:currency"`
	TransactionID  *string   `gorm:"column:transaction_id"`
	Status         string    `gorm:"column:status"`
	Metadata       *string   `gorm:"column:metadata"`
	SubscriptionID *string   `gorm:"column:subscription_id"`
	CreatedAt      time.Time `gorm:"column:created_at"`
}

func main() {
	// Load environment variables
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	dsn := os.Getenv("POSTGRES_URL")
	if dsn == "" {
		// Try default docker compose dev URL if env not loaded
		dsn = "postgres://postgres:postgres@localhost:5432/quotation_db?sslmode=disable"
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}

	fmt.Println("==============================================================")
	fmt.Println("📊 payments TABLE COLUMNS (SCHEMA)")
	fmt.Println("==============================================================")
	var columns []TableColumn
	query := `
		SELECT column_name, data_type, is_nullable 
		FROM information_schema.columns 
		WHERE table_name = 'payments' 
		ORDER BY ordinal_position
	`
	if err := db.Raw(query).Scan(&columns).Error; err != nil {
		log.Fatalf("Failed to fetch table columns: %v", err)
	}

	for _, col := range columns {
		nullableStr := "NULL"
		if col.IsNullable == "NO" {
			nullableStr = "NOT NULL"
		}
		fmt.Printf("- %-18s: %-15s (%s)\n", col.ColumnName, col.DataType, nullableStr)
	}

	fmt.Println("\n==============================================================")
	fmt.Println("💸 PAYMENT TRANSACTIONS SO FAR")
	fmt.Println("==============================================================")
	var records []PaymentRecord
	if err := db.Table("payments").Order("created_at DESC").Find(&records).Error; err != nil {
		log.Fatalf("Failed to fetch payments records: %v", err)
	}

	if len(records) == 0 {
		fmt.Println("(No payment records found in the database)")
		return
	}

	for i, r := range records {
		txID := "N/A"
		if r.TransactionID != nil {
			txID = *r.TransactionID
		}
		subID := "N/A"
		if r.SubscriptionID != nil {
			subID = *r.SubscriptionID
		}

		fmt.Printf("[%d] ID: %s\n", i+1, r.ID)
		fmt.Printf("    User ID        : %s\n", r.UserID)
		fmt.Printf("    Subscription ID: %s\n", subID)
		fmt.Printf("    Gateway / TxID : %s / %s\n", r.Gateway, txID)
		fmt.Printf("    Amount / Status: %.0f %s / %s\n", r.Amount, r.Currency, r.Status)
		fmt.Printf("    Created At     : %s\n", r.CreatedAt.Format(time.RFC3339))
		
		if r.Metadata != nil && *r.Metadata != "" && *r.Metadata != "{}" {
			var prettyJSON map[string]interface{}
			if err := json.Unmarshal([]byte(*r.Metadata), &prettyJSON); err == nil {
				prettyBytes, _ := json.MarshalIndent(prettyJSON, "                     ", "  ")
				fmt.Printf("    Metadata       : %s\n", string(prettyBytes))
			} else {
				fmt.Printf("    Metadata       : %s\n", *r.Metadata)
			}
		} else {
			fmt.Printf("    Metadata       : (empty)\n")
		}
		fmt.Println("--------------------------------------------------------------")
	}
}
