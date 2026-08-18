package main

import (
	"fmt"
	"log"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type UserSubscription struct {
	ID                 string
	UserID             string
	Status             string
	EndDate            time.Time
}

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

	var subs []UserSubscription
	db.Table("user_subscriptions").Where("user_id = ?", "e34d0d13-5606-423f-83e8-3a17aa34c226").Find(&subs)
	for _, s := range subs {
		fmt.Printf("Sub ID: %s, User: %s, Status: %s, EndDate: %v\n", s.ID, s.UserID, s.Status, s.EndDate)
	}
}
