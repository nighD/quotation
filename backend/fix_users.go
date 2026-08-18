package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "postgresql://postgres.hifazlvhdkrdnbbqiguw:testonlybro2009%21@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	result := db.Table("users").Where("status = ?", "ACTIVE").Update("status", "active")
	if result.Error != nil {
		log.Fatalf("failed to update: %v", result.Error)
	}

	fmt.Printf("Updated %d users.\n", result.RowsAffected)
}
