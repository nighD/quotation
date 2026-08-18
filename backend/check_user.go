package main

import (
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	Email  string
	Status string
}

func main() {
	dsn := "postgresql://postgres.hifazlvhdkrdnbbqiguw:testonlybro2009%21@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	var user User
	result := db.Table("users").Select("email", "status").Where("email = ?", "legiabao@gmail.com").First(&user)
	if result.Error != nil {
		log.Fatalf("failed to query: %v", result.Error)
	}

	fmt.Printf("Email: %s\nStatus: %s\n", user.Email, user.Status)
}
