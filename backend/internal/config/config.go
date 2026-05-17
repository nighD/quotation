package config

import (
	"fmt"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// Config holds all application configuration loaded from environment variables.
type Config struct {
	App       AppConfig
	Database  DatabaseConfig
	JWT       JWTConfig
	Redis     RedisConfig
	Stripe    StripeConfig
	MoMo      MoMoConfig
	VNPay     VNPayConfig
	OnePay    OnePayConfig
	Storage   StorageConfig
	RateLimit RateLimitConfig
	Google    GoogleConfig
}

type GoogleConfig struct {
	ClientID string
}

type AppConfig struct {
	Name    string
	Env     string
	Port    string
	URL     string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
	Timezone string
	URL      string
}

type JWTConfig struct {
	Secret              string
	ExpiryHours         time.Duration
	RefreshSecret       string
	RefreshExpiryDays   time.Duration
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type StripeConfig struct {
	SecretKey      string
	WebhookSecret  string
	PublishableKey string
}

type MoMoConfig struct {
	PartnerCode string
	AccessKey   string
	SecretKey   string
	Endpoint    string
	ReturnURL   string
	NotifyURL   string
}

type VNPayConfig struct {
	TMNCode    string
	HashSecret string
	URL        string
	ReturnURL  string
	APIURL     string
}

type OnePayConfig struct {
	MerchantID      string
	AccessCode      string
	HashKey         string
	PaymentEndpoint string
}

type StorageConfig struct {
	Path               string
	MaxFileSizeMB      int64
	AllowedImageTypes  []string
}

type RateLimitConfig struct {
	Max            int
	ExpiryMinutes  time.Duration
}

// Load reads configuration from .env file and environment variables.
func Load() (*Config, error) {
	// Load .env file (ignore error if file doesn't exist in production)
	_ = godotenv.Load()

	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	viper.AutomaticEnv()

	// App defaults
	viper.SetDefault("APP_NAME", "QuotationAPI")
	viper.SetDefault("APP_ENV", "development")
	viper.SetDefault("APP_PORT", "8080")
	viper.SetDefault("APP_URL", "http://localhost:8080")

	// DB defaults
	viper.SetDefault("DB_HOST", "localhost")
	viper.SetDefault("DB_PORT", "5432")
	viper.SetDefault("DB_USER", "postgres")
	viper.SetDefault("DB_PASSWORD", "postgres")
	viper.SetDefault("DB_NAME", "quotation_db")
	viper.SetDefault("DB_SSLMODE", "disable")
	viper.SetDefault("DB_TIMEZONE", "Asia/Ho_Chi_Minh")

	// JWT defaults
	viper.SetDefault("JWT_EXPIRY_HOURS", 24)
	viper.SetDefault("JWT_REFRESH_EXPIRY_DAYS", 30)

	// Redis defaults
	viper.SetDefault("REDIS_HOST", "localhost")
	viper.SetDefault("REDIS_PORT", "6379")
	viper.SetDefault("REDIS_DB", 0)

	// Rate limit defaults
	viper.SetDefault("RATE_LIMIT_MAX", 100)
	viper.SetDefault("RATE_LIMIT_EXPIRY_MINUTES", 1)

	// Storage defaults
	viper.SetDefault("STORAGE_PATH", "./storage/uploads")
	viper.SetDefault("MAX_FILE_SIZE_MB", 10)

	cfg := &Config{
		App: AppConfig{
			Name: viper.GetString("APP_NAME"),
			Env:  viper.GetString("APP_ENV"),
			Port: viper.GetString("APP_PORT"),
			URL:  viper.GetString("APP_URL"),
		},
		Database: DatabaseConfig{
			Host:     viper.GetString("DB_HOST"),
			Port:     viper.GetString("DB_PORT"),
			User:     viper.GetString("DB_USER"),
			Password: viper.GetString("DB_PASSWORD"),
			Name:     viper.GetString("DB_NAME"),
			SSLMode:  viper.GetString("DB_SSLMODE"),
			Timezone: viper.GetString("DB_TIMEZONE"),
			URL:      viper.GetString("POSTGRES_URL"),
		},
		JWT: JWTConfig{
			Secret:            viper.GetString("JWT_SECRET"),
			ExpiryHours:       time.Duration(viper.GetInt("JWT_EXPIRY_HOURS")) * time.Hour,
			RefreshSecret:     viper.GetString("JWT_REFRESH_SECRET"),
			RefreshExpiryDays: time.Duration(viper.GetInt("JWT_REFRESH_EXPIRY_DAYS")) * 24 * time.Hour,
		},
		Redis: RedisConfig{
			Host:     viper.GetString("REDIS_HOST"),
			Port:     viper.GetString("REDIS_PORT"),
			Password: viper.GetString("REDIS_PASSWORD"),
			DB:       viper.GetInt("REDIS_DB"),
		},
		Stripe: StripeConfig{
			SecretKey:      viper.GetString("STRIPE_SECRET_KEY"),
			WebhookSecret:  viper.GetString("STRIPE_WEBHOOK_SECRET"),
			PublishableKey: viper.GetString("STRIPE_PUBLISHABLE_KEY"),
		},
		MoMo: MoMoConfig{
			PartnerCode: viper.GetString("MOMO_PARTNER_CODE"),
			AccessKey:   viper.GetString("MOMO_ACCESS_KEY"),
			SecretKey:   viper.GetString("MOMO_SECRET_KEY"),
			Endpoint:    viper.GetString("MOMO_ENDPOINT"),
			ReturnURL:   viper.GetString("MOMO_RETURN_URL"),
			NotifyURL:   viper.GetString("MOMO_NOTIFY_URL"),
		},
		VNPay: VNPayConfig{
			TMNCode:    viper.GetString("VNPAY_TMN_CODE"),
			HashSecret: viper.GetString("VNPAY_HASH_SECRET"),
			URL:        viper.GetString("VNPAY_URL"),
			ReturnURL:  viper.GetString("VNPAY_RETURN_URL"),
			APIURL:     viper.GetString("VNPAY_API_URL"),
		},
		OnePay: OnePayConfig{
			MerchantID:      viper.GetString("ONEPAY_MERCHANT_ID"),
			AccessCode:      viper.GetString("ONEPAY_ACCESS_CODE"),
			HashKey:         viper.GetString("ONEPAY_HASH_KEY"),
			PaymentEndpoint: viper.GetString("ONEPAY_ENDPOINT"),
		},
		Storage: StorageConfig{
			Path:              viper.GetString("STORAGE_PATH"),
			MaxFileSizeMB:     viper.GetInt64("MAX_FILE_SIZE_MB"),
			AllowedImageTypes: strings.Split(viper.GetString("ALLOWED_IMAGE_TYPES"), ","),
		},
		RateLimit: RateLimitConfig{
			Max:           viper.GetInt("RATE_LIMIT_MAX"),
			ExpiryMinutes: time.Duration(viper.GetInt("RATE_LIMIT_EXPIRY_MINUTES")) * time.Minute,
		},
		Google: GoogleConfig{
			ClientID: viper.GetString("GOOGLE_CLIENT_ID"),
		},
	}

	if cfg.JWT.Secret == "" {
		return nil, fmt.Errorf("JWT_SECRET must be set")
	}

	return cfg, nil
}

// DSN returns the PostgreSQL connection string.
func (d *DatabaseConfig) DSN() string {
	if d.URL != "" {
		return d.URL
	}
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s TimeZone=%s",
		d.Host, d.Port, d.User, d.Password, d.Name, d.SSLMode, d.Timezone,
	)
}

// RedisAddr returns host:port for Redis.
func (r *RedisConfig) Addr() string {
	return fmt.Sprintf("%s:%s", r.Host, r.Port)
}

// IsDevelopment returns true if running in development mode.
func (a *AppConfig) IsDevelopment() bool {
	return a.Env == "development"
}
