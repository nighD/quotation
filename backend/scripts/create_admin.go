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
	// Load environment variables
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	dsn := os.Getenv("POSTGRES_URL")
	if dsn == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		password := os.Getenv("DB_PASSWORD")
		dbname := os.Getenv("DB_NAME")
		sslmode := os.Getenv("DB_SSLMODE")
		timezone := os.Getenv("DB_TIMEZONE")
		if host == "" {
			log.Fatal("POSTGRES_URL or DB_HOST environment variable not set in .env")
		}
		dsn = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
			host, port, user, password, dbname, sslmode, timezone)
	}

	fmt.Println("Connecting to database...")
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected successfully. Running admin creation query...")

	sqlScript := `
DO $$
DECLARE
    new_user_id UUID := gen_random_uuid();
    admin_role_id UUID;
BEGIN
    -- 1. Check if user already exists to avoid unique constraint violations
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@quotation.com') THEN
        -- 2. Insert the admin user with pre-generated bcrypt hash for 'admin@quotation'
        INSERT INTO users (id, email, password, full_name, auth_provider, status)
        VALUES (
            new_user_id, 
            'admin@quotation.com', 
            '$2a$10$K8.iQeiCMI59Y6LwOuH2aejrDSis0gMAphoGogxCxBhGRCsP30ERW', 
            'Admin User', 
            'email', 
            'active'
        );
        
        -- 3. Get the ID of the 'admin' role
        SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
        
        -- 4. Assign the role to the user
        IF admin_role_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id)
            VALUES (new_user_id, admin_role_id);
            RAISE NOTICE 'Admin user created successfully and role assigned.';
        ELSE
            RAISE NOTICE 'Admin user created, but "admin" role was not found in the roles table.';
        END IF;
    ELSE
        RAISE NOTICE 'User admin@quotation.com already exists.';
    END IF;
END $$;`

	err = db.Exec(sqlScript).Error
	if err != nil {
		log.Fatalf("Failed to execute script: %v", err)
	}

	// Verify if the user exists and print roles
	type User struct {
		ID    string
		Email string
	}
	var adminUser User
	err = db.Table("users").Where("email = ?", "admin@quotation.com").First(&adminUser).Error
	if err != nil {
		log.Fatalf("Admin user was not found after creation: %v", err)
	}

	fmt.Printf("✅ Admin user created/verified: %s (ID: %s)\n", adminUser.Email, adminUser.ID)

	// Fetch roles
	type Role struct {
		Name string
	}
	var roles []Role
	db.Raw(`
		SELECT r.name 
		FROM roles r
		JOIN user_roles ur ON ur.role_id = r.id
		WHERE ur.user_id = ?
	`, adminUser.ID).Scan(&roles)

	fmt.Printf("Assigned Roles: ")
	if len(roles) == 0 {
		fmt.Println("None")
	} else {
		for i, r := range roles {
			if i > 0 {
				fmt.Print(", ")
			}
			fmt.Print(r.Name)
		}
		fmt.Println()
	}
}
