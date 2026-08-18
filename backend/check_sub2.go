package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "postgresql://postgres.hifazlvhdkrdnbbqiguw:testonlybro2009%21@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatal(err)
	}

	var results []map[string]interface{}
	db.Table("user_subscriptions").Where("user_id = ?", "e34d0d13-5606-423f-83e8-3a17aa34c226").Find(&results)
	for _, r := range results {
		fmt.Printf("Sub ID: %v, Status: %v, EndDate: %v\n", r["id"], r["status"], r["end_date"])
	}
}
