package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
)

func main() {
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	// Print AWS env vars status (hiding secrets)
	region := os.Getenv("AWS_REGION")
	bucket := os.Getenv("AWS_BUCKET_NAME")
	accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
	secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")

	fmt.Println("=== AWS Configuration Status ===")
	fmt.Printf("AWS_REGION: %s\n", region)
	fmt.Printf("AWS_BUCKET_NAME: %s\n", bucket)
	fmt.Printf("AWS_ACCESS_KEY_ID: %s\n", mask(accessKey))
	fmt.Printf("AWS_SECRET_ACCESS_KEY: %s\n", mask(secretKey))
	fmt.Println("=================================")

	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}

	client := s3.NewFromConfig(cfg)

	// Test 1: List objects to check credentials & bucket connectivity
	fmt.Println("\nTesting S3 bucket connectivity (ListObjectsV2)...")
	listInput := &s3.ListObjectsV2Input{
		Bucket: &bucket,
		MaxKeys: ptr(int32(5)),
	}

	listResp, err := client.ListObjectsV2(context.TODO(), listInput)
	if err != nil {
		fmt.Printf("❌ Connection/Access Failed: %v\n", err)
	} else {
		fmt.Println("✅ Connection Successful! Found objects:")
		for _, obj := range listResp.Contents {
			fmt.Printf("  - Key: %s, Size: %d bytes\n", *obj.Key, *obj.Size)
		}
	}

	// Test 2: Try to get a specific PDF if it exists
	testKey := "pdfs/1779564822544-WealthandAssetManagementOutlook-September2024.pdf"
	fmt.Printf("\nTesting S3 GetObject for key %q...\n", testKey)
	getInput := &s3.GetObjectInput{
		Bucket: &bucket,
		Key:    &testKey,
	}

	getResp, err := client.GetObject(context.TODO(), getInput)
	if err != nil {
		fmt.Printf("❌ GetObject Failed: %v\n", err)
	} else {
		fmt.Printf("✅ GetObject Successful! ContentType: %s, Length: %d bytes\n", 
			*getResp.ContentType, *getResp.ContentLength)
		getResp.Body.Close()
	}
}

func mask(s string) string {
	if s == "" {
		return "[NOT SET]"
	}
	if len(s) <= 8 {
		return "****"
	}
	return s[:4] + "****" + s[len(s)-4:]
}

func ptr[T any](v T) *T {
	return &v
}
