package main

import (
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

	err = db.Exec("UPDATE user_subscriptions SET end_date = NOW() + INTERVAL '1 year' WHERE end_date IS NULL AND status = 'active'").Error
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Fixed NULL end_date for active subscriptions")
}
