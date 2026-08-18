package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2b$10$1StOWssKGjXwDba150JJAum.RkLIrJ1TgsP9h7J5dICEyHFxXvdT."
	password := "oFP.tZ&!40_b!s"

	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Printf("Match failed: %v\n", err)
	} else {
		fmt.Println("Match success!")
	}
}
